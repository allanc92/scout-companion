# Branch Switching Testing Strategy

## Quick Azure Deployment Center Setup

### Step 1: Link GitHub to Azure (One-time setup)
```
Azure Portal → Your App Service → Deployment Center
Source: GitHub  
Organization: allanc92
Repository: scout-companion
Branch: main (initially)
Build provider: App Service Build Service
```

### Step 2: Testing Workflow
```bash
# Test a feature branch:
1. Azure Portal → Deployment Center → Change branch to "feature/real-time-data"
2. Azure auto-deploys feature branch  
3. Test Scout with resilient features
4. Switch back to "main" when done
5. Production Scout restored
```

### Step 3: Automated Branch Testing Script
```javascript
// deploy-branch.js - Automate branch switching via Azure CLI
const { exec } = require('child_process');

function deployBranch(branchName) {
  const command = `az webapp deployment source config \
    --name your-app-name \
    --resource-group your-resource-group \
    --repo-url https://github.com/allanc92/scout-companion \
    --branch ${branchName} \
    --manual-integration`;
    
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Deployment failed: ${error}`);
      return;
    }
    console.log(`✅ Deployed branch: ${branchName}`);
  });
}

// Usage:
// deployBranch('feature/real-time-data');  // Test feature
// deployBranch('main');                    // Back to production
```

## Benefits  
✅ Simple one-click branch testing
✅ Full Azure environment
✅ Preserves main branch safety
✅ No additional bot setup needed

## Drawbacks
❌ Can't test multiple branches simultaneously  
❌ Brief downtime during switches
❌ Manual process
