# Azure Staging Deployment Guide

## Create a Staging Slot for Feature Branch Testing

### Step 1: Create Deployment Slot in Azure Portal
1. Go to your Azure App Service → Deployment slots
2. Click "Add Slot"
3. Name: `staging` or `feature-test`
4. Clone settings from production

### Step 2: Configure Branch Deployment
1. In the staging slot → Deployment Center
2. Source: GitHub
3. Organization: allanc92
4. Repository: scout-companion
5. **Branch: feature/real-time-data** ← Key difference!
6. Build provider: App Service Build Service

### Step 3: Environment Variables
Copy all environment variables from production slot to staging:
- DISCORD_TOKEN (use same bot, different channels if needed)
- CLIENT_ID
- GUILD_ID 
- AZURE_OPENAI_ENDPOINT
- AZURE_OPENAI_API_KEY
- AZURE_OPENAI_DEPLOYMENT

### Step 4: Test URL
Your staging Scout will be available at:
`https://your-app-name-staging.azurewebsites.net`

### Benefits:
✅ Full Azure environment testing
✅ Same infrastructure as production
✅ Independent from main branch
✅ Easy to swap to production when ready
✅ Can test with real Discord/OpenAI APIs
