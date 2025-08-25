# Scout College Football Companion - Azure Deployment

## 🚀 Deployment Options

### Option 1: Azure App Service (Recommended)
Best for production deployment with scaling and monitoring.

### Option 2: Railway/Render (Alternative)
Simpler deployment options if you prefer those platforms.

## 📋 Pre-Deployment Checklist

### ✅ Environment Variables Needed:
- `DISCORD_TOKEN` - Your Discord bot token
- `CLIENT_ID` - Discord application client ID  
- `GUILD_ID` - Discord server ID for slash commands
- `AZURE_OPENAI_API_KEY` - Your Azure OpenAI API key
- `AZURE_OPENAI_ENDPOINT` - Your Azure OpenAI endpoint URL
- `AZURE_OPENAI_DEPLOYMENT` - Your deployment name (gpt-5-chat-scout)

### ✅ Files Ready for Deployment:
- `src/index.js` - Main bot file
- `src/personality/` - Complete personality system
- `package.json` - Dependencies configured
- `.gitignore` - Environment security

## 🔧 Azure App Service Deployment Steps

### Step 1: Create Azure App Service
```bash
# Login to Azure CLI
az login

# Create resource group
az group create --name scout-companion-rg --location "East US"

# Create App Service Plan
az appservice plan create --name scout-companion-plan --resource-group scout-companion-rg --sku B1 --is-linux

# Create Web App
az webapp create --resource-group scout-companion-rg --plan scout-companion-plan --name scout-companion-bot --runtime "NODE:18-lts"
```

### Step 2: Configure Environment Variables
```bash
# Set environment variables
az webapp config appsettings set --resource-group scout-companion-rg --name scout-companion-bot --settings \
    DISCORD_TOKEN="your_discord_token" \
    CLIENT_ID="your_client_id" \
    GUILD_ID="your_guild_id" \
    AZURE_OPENAI_API_KEY="your_azure_openai_key" \
    AZURE_OPENAI_ENDPOINT="your_azure_openai_endpoint" \
    AZURE_OPENAI_DEPLOYMENT="gpt-5-chat-scout"
```

### Step 3: Deploy Code
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Scout college football companion ready for deployment"

# Deploy to Azure
az webapp deployment source config-local-git --name scout-companion-bot --resource-group scout-companion-rg

# Add Azure remote and push
git remote add azure <git_clone_url_from_above_command>
git push azure main
```

## 🌐 Alternative: Railway Deployment

### Quick Railway Deploy:
1. Push code to GitHub
2. Connect Railway to your GitHub repo
3. Add environment variables in Railway dashboard
4. Deploy automatically

## 🎯 Post-Deployment Testing

### Test Commands:
1. `/ping` - Verify bot is online
2. `/kickoff` - Test personality system
3. `/scout prompt:"Who's gonna win the championship?"` - Test AI integration
4. `/setarchetype diehard` - Test archetype switching
5. `/banter` - Test banter level system

## 🔍 Monitoring & Logs

### Azure Portal:
- Check Application Logs
- Monitor performance metrics
- Set up alerts for downtime

### Discord:
- Verify bot shows as online
- Test slash commands in your server
- Monitor response times

## 🎉 Share with Friends!

Once deployed, your friends can:
1. Join your Discord server
2. Use `/kickoff` to get started
3. Try different archetypes with `/setarchetype`
4. Ask football questions with `/scout`
5. Watch their banter level progress!

## 🚨 Security Notes

- Never commit `.env` files to git
- Use Azure Key Vault for production secrets
- Monitor usage and set rate limits
- Keep bot permissions minimal

---

**Ready to go live with Scout!** 🏈🚀
