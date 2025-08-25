// Integration test for Scout WhatsApp-style companion
require('dotenv').config();

console.log('🧪 SCOUT INTEGRATION TEST');
console.log('========================');

// Test 1: Environment Variables
console.log('\n1️⃣ Testing Environment Variables:');
console.log('- DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? '✅ Set' : '❌ Missing');
console.log('- CLIENT_ID:', process.env.CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('- GUILD_ID:', process.env.GUILD_ID ? '✅ Set' : '❌ Missing');
console.log('- AZURE_OPENAI_API_KEY:', process.env.AZURE_OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('- AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT ? '✅ Set' : '❌ Missing');
console.log('- AZURE_OPENAI_DEPLOYMENT:', process.env.AZURE_OPENAI_DEPLOYMENT ? '✅ Set' : '❌ Missing');

// Test 2: Discord.js Import
console.log('\n2️⃣ Testing Discord.js Import:');
try {
  const { Client, GatewayIntentBits } = require('discord.js');
  console.log('✅ Discord.js imported successfully');
  
  // Test client creation
  const testClient = new Client({ 
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ] 
  });
  console.log('✅ Discord client created successfully');
} catch (error) {
  console.log('❌ Discord.js import failed:', error.message);
}

// Test 3: Personality System Import
console.log('\n3️⃣ Testing Personality System Import:');
try {
  const { buildSystemPrompt, detectArchetype, ARCHETYPES, CHAT_CONTEXTS, BANTER_LEVELS } = require('./src/personality/prompts');
  const { BanterMeter, ResponseFilter, PersonalityConsistency } = require('./src/personality/banter');
  const { ArchetypeManager, PersonalityEnhancer } = require('./src/personality/archetypes');
  
  console.log('✅ Personality system components imported');
  console.log('  - Archetypes available:', Object.keys(ARCHETYPES).length);
  console.log('  - Chat contexts available:', Object.keys(CHAT_CONTEXTS).length);
  console.log('  - Banter levels available:', Object.keys(BANTER_LEVELS).length);
  
  // Test component initialization
  const banterMeter = new BanterMeter();
  const responseFilter = new ResponseFilter();
  const personalityConsistency = new PersonalityConsistency();
  const archetypeManager = new ArchetypeManager();
  console.log('✅ Personality system components initialized');
  
} catch (error) {
  console.log('❌ Personality system import failed:', error.message);
  console.log('Stack trace:', error.stack);
}

// Test 4: WhatsApp-style Monitoring System Import
console.log('\n4️⃣ Testing WhatsApp-style Monitoring System:');
try {
  const MessageListener = require('./src/monitoring/listener');
  const TriggerParser = require('./src/monitoring/triggerParser');
  const GroupContextManager = require('./src/monitoring/groupContext');
  
  console.log('✅ Monitoring system components imported');
  
  // Test component initialization
  const triggerParser = new TriggerParser();
  const groupContextManager = new GroupContextManager();
  console.log('✅ Monitoring system components initialized');
  console.log('  - TriggerParser stats:', triggerParser.getStats());
  console.log('  - GroupContextManager stats:', groupContextManager.getStats());
  
} catch (error) {
  console.log('❌ Monitoring system import failed:', error.message);
  console.log('Stack trace:', error.stack);
}

// Test 5: Integration Test
console.log('\n5️⃣ Testing Full Integration:');
try {
  // Simulate full import without running the bot
  const testIndex = require.resolve('./src/index.js');
  console.log('✅ Main index.js file can be resolved');
  
  // Clear the module cache and test loading
  delete require.cache[testIndex];
  console.log('✅ Module cache cleared');
  
} catch (error) {
  console.log('❌ Full integration test failed:', error.message);
}

console.log('\n🎯 Integration Test Complete!');
console.log('If all tests passed, Scout is ready for deployment! 🚀');
