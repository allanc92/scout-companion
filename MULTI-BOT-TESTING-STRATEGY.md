# Multi-Bot Testing Strategy for Basic Plan

## Architecture Overview
```
Production Bot (Scout) → main branch → Azure App Service
Testing Bot (Scout-Beta) → feature branches → Same Azure App Service
A/B Testing Bot (Scout-Alpha) → experimental branches → Same Azure App Service
```

## Setup Instructions

### Step 1: Create Additional Discord Bot Applications

#### Production Bot (Current Scout)
- App Name: "Scout CFB Companion"
- Status: Production, stable
- Branch: main

#### Beta Testing Bot  
- App Name: "Scout CFB Beta" 
- Different bot token, different CLIENT_ID
- Same Azure App Service (different processes)
- Branch: feature/real-time-data

#### Alpha Testing Bot (Optional A/B Testing)
- App Name: "Scout CFB Alpha"
- Different bot token, different CLIENT_ID  
- Same Azure App Service
- Branch: experimental features

### Step 2: Environment Variable Strategy
```bash
# Production environment (.env.production)
DISCORD_TOKEN=production_bot_token
CLIENT_ID=production_client_id
BOT_NAME=Scout
BOT_MODE=production

# Beta environment (.env.beta)  
DISCORD_TOKEN=beta_bot_token
CLIENT_ID=beta_client_id
BOT_NAME=Scout-Beta
BOT_MODE=beta

# Alpha environment (.env.alpha)
DISCORD_TOKEN=alpha_bot_token  
CLIENT_ID=alpha_client_id
BOT_NAME=Scout-Alpha
BOT_MODE=alpha
```

### Step 3: Process Management on Single Azure Instance
```javascript
// Use PM2 or similar process manager
// package.json scripts:
{
  "start": "node index.js",
  "start:beta": "NODE_ENV=beta node index-resilient.js",
  "start:alpha": "NODE_ENV=alpha node index-experimental.js",
  "start:all": "concurrently \"npm run start\" \"npm run start:beta\""
}
```

### Step 4: Discord Server Setup
```
Your Discord Server:
├── #production-chat (Scout responds)
├── #beta-testing (Scout-Beta responds)  
└── #alpha-testing (Scout-Alpha responds)

Or separate test servers for each bot
```

## Benefits
✅ Test multiple branches simultaneously
✅ Real Azure environment testing
✅ A/B testing capabilities
✅ Zero impact on production
✅ Same infrastructure costs
✅ Easy comparison between versions
✅ Rollback safety
