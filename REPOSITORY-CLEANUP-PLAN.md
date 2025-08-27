# Scout Repository Cleanup Plan

## 🎯 CORE FILES TO KEEP

### **Essential Production Files**
```
✅ index.js                    # Main Scout application (feature flagged)
✅ connection-manager.js       # Connection resilience system
✅ package.json               # Dependencies and scripts
✅ package-lock.json          # Lock file for dependencies
✅ .env                       # Environment variables (local)
✅ .gitignore                 # Git ignore rules
✅ README.md                  # Project documentation
```

### **Essential Configuration**
```
✅ .deployment               # Azure deployment config
✅ FEATURE-FLAGS-CONFIG.md    # Feature flag documentation
✅ AZURE-FEATURE-FLAGS-SETUP.md # Azure configuration guide
```

## 🗑️ FILES TO DELETE

### **Obsolete Scout Versions**
```
❌ index-resilient.js         # Merged into index.js with feature flags
❌ scout-debug.js            # Debug version - no longer needed
❌ scout-full-whatsapp.js    # Old version
❌ scout-whatsapp.js         # Old version
❌ app.js                    # Duplicate/old version
❌ azure-minimal.js          # Test file
```

### **Old Test/Debug Files**
```
❌ debug-message-test.js     # One-off test
❌ debug-scout.js           # Debug version
❌ diagnostic.js            # Old diagnostic
❌ azure-diagnostic.js      # Old diagnostic  
❌ azure-startup-diagnostic.js # Old diagnostic
❌ simple-diagnostic.js     # Old diagnostic
❌ test-*.js (all 10 files) # All test files - served their purpose
❌ verify-deployment.js     # One-time verification
❌ keep-alive.js           # Old solution attempt
```

### **Duplicate/Old Documentation**
```
❌ AZURE-FIX.md            # Superseded by newer docs
❌ CONNECTION-RESILIENCE-FIX.md # Merged info into other docs  
❌ DEPLOYMENT-READY.md     # Outdated
❌ DEPLOYMENT.md           # Outdated
❌ DEPLOY-RAILWAY.md       # Not using Railway
❌ SYSTEM_OVERVIEW.md      # Outdated
❌ SYSTEM_STATUS.md        # Outdated
❌ BRANCH-SWITCHING-STRATEGY.md # Using feature flags instead
❌ MULTI-BOT-TESTING-STRATEGY.md # Using feature flags instead
❌ FEATURE-FLAG-STRATEGY.md # Superseded by FEATURE-FLAGS-CONFIG.md
```

### **Build/Deploy Artifacts**
```
❌ azure-fix.sh           # One-time script
❌ deploy.ps1             # Old deploy script
❌ deployment-log.txt     # Log file
❌ package-fixed.json     # Backup file
❌ vercel.json            # Not using Vercel
```

### **Folders to Clean**
```
❌ src/                   # Old structure - moved to root
❌ .vscode/               # IDE settings (optional - can keep if you use VS Code)
```

## 🧹 CLEANUP COMMANDS

### **Safe Deletion (in order)**
```bash
# 1. Delete obsolete Scout versions
git rm index-resilient.js scout-*.js app.js azure-minimal.js

# 2. Delete test files
git rm test-*.js debug-*.js diagnostic*.js verify-deployment.js keep-alive.js

# 3. Delete old documentation  
git rm AZURE-FIX.md CONNECTION-RESILIENCE-FIX.md DEPLOYMENT*.md DEPLOY-RAILWAY.md SYSTEM_*.md BRANCH-SWITCHING-STRATEGY.md MULTI-BOT-TESTING-STRATEGY.md FEATURE-FLAG-STRATEGY.md

# 4. Delete build artifacts
git rm azure-fix.sh deploy.ps1 deployment-log.txt package-fixed.json vercel.json

# 5. Delete old folders
git rm -r src/

# 6. Commit cleanup
git commit -m "🧹 CLEANUP: Remove obsolete files and old versions"
```

## 📋 FINAL CLEAN REPOSITORY

After cleanup, you'll have **~15 files** instead of 60+:

```
scout-companion/
├── 📄 index.js                     # Main application
├── 📄 connection-manager.js         # Connection resilience  
├── 📄 package.json                 # Dependencies
├── 📄 package-lock.json            # Lock file
├── 📄 .env                         # Environment variables
├── 📄 .env.example                 # Environment template
├── 📄 .deployment                  # Azure config
├── 📄 .gitignore                   # Git ignore
├── 📄 README.md                    # Main documentation
├── 📄 SCOUT_PRD.md                 # Product requirements
├── 📄 PERSONALITY_SYSTEM.md        # Scout personality docs
├── 📄 FEATURE-FLAGS-CONFIG.md      # Feature flag guide
├── 📄 AZURE-FEATURE-FLAGS-SETUP.md # Azure setup guide
├── 📄 AZURE-CONNECTION-TROUBLESHOOTING.md # Troubleshooting
└── 📁 node_modules/                # Dependencies (git ignored)
```

## 🎯 BENEFITS

- ✅ **75% fewer files** (60+ → ~15)
- ✅ **Clear purpose** for every remaining file
- ✅ **Easy navigation** and maintenance
- ✅ **No confusion** about which files to use
- ✅ **Faster git operations**

Want me to execute this cleanup plan? We can do it safely with git so nothing is permanently lost.
