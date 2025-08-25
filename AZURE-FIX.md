# 🚨 AZURE DEPLOYMENT FIX

## Issue
GitHub Actions deployment failed with: "No credentials found. Add an Azure login action before this action."

## Solution Applied ✅

### 1. Updated GitHub Actions Workflow
- Added proper Azure login step with `azure/login@v1`
- Fixed environment variable handling for Azure App Service
- Added manual deployment trigger option
- Updated Node.js setup with caching

### 2. Required GitHub Secrets
You need to add these secrets to your GitHub repository:

**Go to: GitHub Repository → Settings → Secrets and variables → Actions**

#### Required Secrets:
```
AZURE_CREDENTIALS          # Azure service principal JSON
DISCORD_TOKEN              # Your Discord bot token
CLIENT_ID                  # Discord application client ID  
GUILD_ID                   # Discord server ID
AZURE_OPENAI_API_KEY       # Azure OpenAI API key
AZURE_OPENAI_ENDPOINT      # Azure OpenAI endpoint URL
AZURE_OPENAI_DEPLOYMENT    # Azure OpenAI model deployment name
```

#### Optional Secrets:
```
AZURE_WEBAPP_NAME          # Azure App Service name (defaults to 'scout-companion')
ENABLE_MESSAGE_MONITORING  # Set to 'true' for WhatsApp-style features
```

### 3. How to Get Azure Credentials

Run this command in Azure CLI to create a service principal:

```bash
az ad sp create-for-rbac --name "scout-github-actions" --role contributor --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group} --sdk-auth
```

This will output JSON that you'll paste into the `AZURE_CREDENTIALS` secret.

### 4. Next Steps

1. **Add all required secrets** to GitHub repository
2. **Push this fix** to trigger new deployment  
3. **Monitor deployment** in GitHub Actions tab
4. **Scout will be back online** once deployment succeeds!

## Quick Recovery Commands

```bash
# Push the fix
git add .
git commit -m "🔧 Fix Azure deployment credentials"
git push origin main

# Monitor deployment
# Go to: GitHub → Actions tab → Watch "Deploy main to Azure" workflow
```

Scout will be back online once the secrets are configured! 🚀
