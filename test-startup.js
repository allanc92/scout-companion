require('dotenv').config();

console.log('🚀 Starting Scout... [WHATSAPP-STYLE COMPANION]');
console.log('📊 Environment check:');
console.log('- DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? 'Set ✅' : 'Missing ❌');
console.log('- CLIENT_ID:', process.env.CLIENT_ID ? 'Set ✅' : 'Missing ❌');
console.log('- GUILD_ID:', process.env.GUILD_ID ? 'Set ✅' : 'Missing ❌');
console.log('- AZURE_OPENAI_API_KEY:', process.env.AZURE_OPENAI_API_KEY ? 'Set ✅' : 'Missing ❌');
console.log('- AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT ? 'Set ✅' : 'Missing ❌');
console.log('- AZURE_OPENAI_DEPLOYMENT:', process.env.AZURE_OPENAI_DEPLOYMENT ? 'Set ✅' : 'Missing ❌');
console.log('- ENABLE_MESSAGE_MONITORING:', process.env.ENABLE_MESSAGE_MONITORING || 'false');

console.log('\n🔄 Testing imports...');

try {
  const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
  console.log('✅ Discord.js imported');
  
  const { buildSystemPrompt, detectArchetype, ARCHETYPES, CHAT_CONTEXTS, BANTER_LEVELS } = require('./src/personality/prompts');
  console.log('✅ Personality prompts imported');
  
  const { BanterMeter, ResponseFilter, PersonalityConsistency } = require('./src/personality/banter');
  console.log('✅ Personality banter imported');
  
  const { ArchetypeManager, PersonalityEnhancer } = require('./src/personality/archetypes');
  console.log('✅ Personality archetypes imported');
  
  const MessageListener = require('./src/monitoring/listener');
  console.log('✅ MessageListener imported');
  
  const TriggerParser = require('./src/monitoring/triggerParser');
  console.log('✅ TriggerParser imported');
  
  const GroupContextManager = require('./src/monitoring/groupContext');
  console.log('✅ GroupContextManager imported');
  
  console.log('\n🎯 All imports successful! Testing client creation...');
  
  const client = new Client({ 
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages
      // MessageContent excluded for testing
    ] 
  });
  
  console.log('✅ Discord client created successfully');
  
  client.once('ready', () => {
    console.log(`✅ Scout is ONLINE! Logged in as ${client.user.tag}`);
    console.log('🎯 Test complete - disconnecting...');
    client.destroy();
    process.exit(0);
  });
  
  client.on('error', (error) => {
    console.error('❌ Discord client error:', error);
    process.exit(1);
  });
  
  console.log('🔑 Logging into Discord...');
  client.login(process.env.DISCORD_TOKEN);
  
} catch (error) {
  console.error('❌ Import or setup error:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
