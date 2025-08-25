// Azure Diagnostic Helper
// Run this script to get information for troubleshooting Azure deployment

console.log('🔍 Azure Scout Diagnostic Helper');
console.log('=================================');
console.log();

console.log('📋 STEP 1: Check Azure App Service Logs');
console.log('----------------------------------------');
console.log('1. Go to Azure Portal → Your App Service');
console.log('2. In the left menu, click "Log stream" or "Logs"');
console.log('3. Look for startup errors or deployment issues');
console.log();

console.log('📋 STEP 2: Check Kudu Console Deployment Status');
console.log('-----------------------------------------------');
console.log('1. Go to your App Service → Advanced Tools → Go (Kudu)');
console.log('2. Click "Debug console" → CMD or PowerShell');
console.log('3. Navigate to site/wwwroot and run these commands:');
console.log('   - ls -la (to see files)');
console.log('   - cat package.json (to verify start script)');
console.log('   - node verify-deployment.js (our diagnostic script)');
console.log();

console.log('📋 STEP 3: Check Environment Variables in Azure');
console.log('----------------------------------------------');
console.log('1. Go to your App Service → Configuration');
console.log('2. Check Application Settings tab');
console.log('3. Verify these environment variables exist:');
console.log('   - DISCORD_TOKEN');
console.log('   - CLIENT_ID'); 
console.log('   - GUILD_ID');
console.log();

console.log('📋 STEP 4: Manual Start Test in Kudu');
console.log('-----------------------------------');
console.log('In Kudu console, try manually starting Scout:');
console.log('   - cd site/wwwroot');
console.log('   - node index.js');
console.log('This will show you the exact error if there is one.');
console.log();

console.log('📋 STEP 5: Check Azure App Service Status');
console.log('----------------------------------------');
console.log('1. In Azure Portal → Your App Service → Overview');
console.log('2. Check the Status (should be "Running")');
console.log('3. Check if there are any alerts or issues');
console.log();

console.log('📋 Common Azure Issues to Look For:');
console.log('----------------------------------');
console.log('❌ Environment variables not set in Azure');
console.log('❌ Wrong startup command (should be "node index.js")');
console.log('❌ Missing dependencies (discord.js, dotenv)');
console.log('❌ App Service not running or crashed');
console.log('❌ Port configuration issues');
console.log('❌ Memory/CPU limits exceeded');
console.log();

// Try a basic connectivity test
console.log('📋 Local Environment Check:');
console.log('--------------------------');
require('dotenv').config();

const envVars = {
  'DISCORD_TOKEN': process.env.DISCORD_TOKEN,
  'CLIENT_ID': process.env.CLIENT_ID,
  'GUILD_ID': process.env.GUILD_ID
};

Object.entries(envVars).forEach(([key, value]) => {
  console.log(`${key}: ${value ? '✅ Set' : '❌ Missing'}`);
});

console.log();
console.log('🎯 NEXT STEPS:');
console.log('1. Check Azure logs first (Step 1)');
console.log('2. If no obvious errors, try manual start in Kudu (Step 4)');
console.log('3. Verify environment variables in Azure (Step 3)');
console.log('4. Report back what you find!');
console.log();
console.log('🕒 Generated:', new Date().toISOString());
