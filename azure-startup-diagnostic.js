// Azure Startup Diagnostic
console.log('🔍 DIAGNOSTIC: Starting Scout diagnostic...');

try {
  console.log('Step 1: Loading dotenv...');
  require('dotenv').config();
  console.log('✅ dotenv loaded');

  console.log('Step 2: Loading discord.js...');
  const { Client, GatewayIntentBits } = require('discord.js');
  console.log('✅ discord.js loaded');

  console.log('Step 3: Loading OpenAI...');
  const { OpenAI } = require('openai');
  console.log('✅ OpenAI loaded');

  console.log('Step 4: Checking environment variables...');
  console.log('- DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? 'Set ✅' : 'Missing ❌');
  console.log('- CLIENT_ID:', process.env.CLIENT_ID ? 'Set ✅' : 'Missing ❌');
  console.log('- AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT ? 'Set ✅' : 'Missing ❌');

  console.log('Step 5: Creating Discord client...');
  const client = new Client({ 
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ] 
  });
  console.log('✅ Discord client created');

  console.log('Step 6: Creating OpenAI client...');
  const openai = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
    defaultQuery: { 'api-version': '2024-05-01-preview' },
    defaultHeaders: {
      'api-key': process.env.AZURE_OPENAI_API_KEY,
    },
  });
  console.log('✅ OpenAI client created');

  console.log('🎉 ALL DIAGNOSTIC CHECKS PASSED! Scout should be able to start.');
  
} catch (error) {
  console.error('❌ DIAGNOSTIC FAILED:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
