# Azure App Service Configuration for Scout Feature Flags

## 🔧 Required Azure Configuration

When you deploy Scout with feature flags, you need to configure environment variables in Azure App Service to control the features.

## 📍 Where to Configure

```
Azure Portal → Your App Service → Settings → Configuration → Application Settings
```

## 🎯 Feature Flag Variables to Add

### Core Feature Flags (Add these new variables)
```
Name: ENABLE_RESILIENCE
Value: false
Description: Enable connection resilience features

Name: DEBUG_MODE  
Value: false
Description: Enable debug commands and detailed feature status

Name: TESTING_MODE
Value: false
Description: Show beta testing indicators in responses

Name: ENHANCED_LOGGING
Value: false
Description: Enable detailed logging for troubleshooting

Name: ENABLE_HEALTH_ENDPOINT
Value: true
Description: Enable HTTP health check endpoint (recommended for Azure)

Name: FEATURE_BRANCH
Value: main
Description: Track which branch/version is deployed
```

### Your Existing Variables (Keep these unchanged)
```
✅ AZURE_OPENAI_API_KEY: [Your Azure OpenAI API Key]
✅ AZURE_OPENAI_ENDPOINT: https://scoutazureopenai.openai.azure.com
✅ AZURE_OPENAI_DEPLOYMENT: gpt-5-chat-scout
✅ AZURE_OPENAI_MODEL: gpt-5-chat
✅ DISCORD_TOKEN: [Your Discord Bot Token]
✅ CLIENT_ID: [Your Discord Client ID]
✅ GUILD_ID: [Your Discord Guild ID]
✅ ENABLE_MESSAGE_MONITORING: true
```

## 🚀 Deployment Configurations

### Production (Safe First Deployment)
```javascript
// All feature flags OFF - Scout runs exactly like before
ENABLE_RESILIENCE=false
DEBUG_MODE=false
TESTING_MODE=false
ENHANCED_LOGGING=false
ENABLE_HEALTH_ENDPOINT=true    // Keep this ON for Azure monitoring
FEATURE_BRANCH=main
```

### Testing (Enable Enhanced Features)
```javascript
// Enable resilience features for testing
ENABLE_RESILIENCE=true
DEBUG_MODE=true               // Shows /features command
TESTING_MODE=true            // Beta indicators in responses
ENHANCED_LOGGING=true        // Detailed logs
ENABLE_HEALTH_ENDPOINT=true  // Health monitoring
FEATURE_BRANCH=feature/real-time-data
```

### Production Enhanced (After Testing)
```javascript
// Resilience enabled, no testing indicators
ENABLE_RESILIENCE=true
DEBUG_MODE=false
TESTING_MODE=false
ENHANCED_LOGGING=false
ENABLE_HEALTH_ENDPOINT=true
FEATURE_BRANCH=main
```

## 📋 Step-by-Step Azure Configuration

### 1. Access Configuration
```
1. Go to Azure Portal (portal.azure.com)
2. Navigate to your App Service
3. Click "Configuration" in the left menu
4. Click "Application settings" tab
```

### 2. Add Feature Flag Variables
```
For each feature flag:
1. Click "+ New application setting"
2. Name: ENABLE_RESILIENCE
3. Value: false
4. Click "OK"
5. Repeat for all feature flags
```

### 3. Save and Restart
```
1. Click "Save" at the top
2. Click "Continue" to confirm
3. Azure will restart your app with new variables
4. Scout will start with the configured feature flags
```

## 🔍 Verification Commands

Once deployed, use these Discord commands to verify:

```
/ping           # Basic health check
/features       # Shows feature flag status (if DEBUG_MODE=true)
/connection     # Connection health (if ENABLE_RESILIENCE=true)
/monitoring     # Enhanced monitoring stats
```

## 🎯 Testing Workflow

### Phase 1: Deploy Safely
```
1. Deploy new Scout code to Azure
2. Keep all feature flags set to false
3. Verify Scout works exactly like before
4. Use /ping to confirm deployment
```

### Phase 2: Test Features
```
1. In Azure Portal, set ENABLE_RESILIENCE=true
2. Set DEBUG_MODE=true
3. Set TESTING_MODE=true  
4. Save → App restarts
5. Use /features to verify flags are active
6. Test connection resilience features
```

### Phase 3: Production Rollout
```
1. If testing successful, keep ENABLE_RESILIENCE=true
2. Set DEBUG_MODE=false (removes debug commands)
3. Set TESTING_MODE=false (removes beta indicators)
4. Save → Production with enhanced features!
```

## ⚡ Instant Rollback

If issues arise:
```
1. Azure Portal → Configuration
2. Set ENABLE_RESILIENCE=false
3. Save → Scout immediately returns to stable behavior
4. No code changes needed!
```

## 🏥 Health Monitoring

With `ENABLE_HEALTH_ENDPOINT=true`, Azure can monitor Scout:
```
Health URL: https://your-app-name.azurewebsites.net/health

Returns:
{
  "status": "healthy",
  "uptime": 123456,
  "ping": 45,
  "guilds": 1,
  "features": {
    "connectionResilience": true,
    "debugMode": false,
    "testingMode": false
  }
}
```

## 🎯 Summary

**Before Deployment:**
- Add 6 new environment variables in Azure App Service
- Set all to "false" except ENABLE_HEALTH_ENDPOINT=true
- Deploy code

**After Deployment:**
- Scout runs exactly like before
- Use Azure Portal to enable features for testing
- Instant rollback by changing variables
- No downtime for feature testing!

This gives you professional-grade deployment capabilities on your Basic plan! 🚀
