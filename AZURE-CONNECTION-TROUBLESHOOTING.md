# Azure App Service Troubleshooting for Scout Connection Issues

## 🚨 Critical Azure Settings to Check

### **1. Always On Setting**
```
Azure Portal → Your App Service → Configuration → General Settings
Always On: Must be set to "On"
```
**Issue**: If "Always On" is disabled, Azure puts apps to sleep after 20 minutes of inactivity, causing disconnections.

### **2. Web Sockets**
```
Azure Portal → Your App Service → Configuration → General Settings  
Web sockets: Must be set to "On"
```
**Issue**: Discord bots require persistent WebSocket connections.

### **3. App Service Plan Tier**
```
Azure Portal → Your App Service → App Service Plan
Check your current tier
```
**Issue**: Free/Shared tiers have connection limits and auto-sleep features.

### **4. Platform Settings**
```
Azure Portal → Your App Service → Configuration → General Settings
Platform: 64 Bit (recommended)
Node.js version: 20 LTS
```

### **5. Outbound Connection Limits**
```
Check if you're hitting Azure's outbound connection limits
Basic Plan: 300 outbound connections per instance
```

## 🔧 **Immediate Fixes to Try**

### **Fix 1: Enable Always On**
```
1. Azure Portal → Your App Service → Configuration → General Settings
2. Set "Always On" to "On"  
3. Save
```

### **Fix 2: Enable Web Sockets**
```
1. Azure Portal → Your App Service → Configuration → General Settings
2. Set "Web sockets" to "On"
3. Save
```

### **Fix 3: Add Keep-Alive Settings**
```
Add these environment variables:
WEBSITE_HTTPLOGGING_RETENTION_DAYS=7
WEBSITE_LOAD_USER_PROFILE=1
```

### **Fix 4: Increase Instance Timeout**
```
Add environment variable:
WEBSITES_IDLE_TIMEOUT_IN_MINUTES=0  (disables timeout)
```

## 🎯 **Code-Level Optimizations**

### **Reduce Discord API Calls**
Instead of constantly checking connection, use Discord's built-in heartbeat:

```javascript
// In index.js - reduce API overhead
client.on('ready', () => {
  // Don't poll Discord API frequently
  // Let Discord handle heartbeat internally
});
```

### **Implement Graceful Degradation**
```javascript
// Handle temporary disconnections without full restart
client.on('disconnect', () => {
  console.log('Temporary disconnect - waiting for auto-reconnect...');
  // Don't immediately restart - let Discord.js handle it
});
```

## 📊 **Monitoring to Add**

### **Track Disconnect Patterns**
```javascript
// Add to index.js
const disconnectLog = [];
client.on('disconnect', (event) => {
  disconnectLog.push({
    time: new Date(),
    code: event.code,
    reason: event.reason,
    uptime: client.uptime
  });
  
  console.log('Disconnect pattern:', disconnectLog.slice(-5)); // Last 5
});
```

### **Monitor Azure Metrics**
```
Azure Portal → Your App Service → Monitoring → Metrics
Watch: CPU %, Memory %, HTTP responses, Connection count
```

## 🎯 **Most Likely Culprits**

1. **Always On disabled** (90% chance this is the issue)
2. **Web Sockets disabled** 
3. **Azure putting app to sleep**
4. **Outbound connection limits**
5. **Node.js process crashes** (check Application Insights)

## 🚀 **Recommended Action Plan**

1. **Immediately check** "Always On" and "Web Sockets" settings
2. **Add timeout environment variables**
3. **Monitor for 30 minutes** to see if disconnections stop
4. **If still disconnecting**, check Application Insights for errors

The goal is **zero disconnections**, not better reconnections! 🎯
