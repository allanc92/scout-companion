// Quick startup test for Scout Discord connection
require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

console.log('🚀 Testing Scout Discord Connection...');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});

// Set a timeout to auto-disconnect after successful connection
let connectionTest = false;

client.once('ready', () => {
  console.log(`✅ SUCCESS: Scout connected as ${client.user.tag}`);
  console.log(`🎯 Bot ID: ${client.user.id}`);
  console.log(`🏰 Connected to ${client.guilds.cache.size} servers`);
  
  client.guilds.cache.forEach(guild => {
    console.log(`📍 Server: ${guild.name} (ID: ${guild.id})`);
  });
  
  connectionTest = true;
  console.log('🎯 Discord connection test PASSED! ✅');
  console.log('🔌 Disconnecting test client...');
  client.destroy();
  
  setTimeout(() => {
    console.log('✨ Scout is ready for deployment to Azure App Service!');
    process.exit(0);
  }, 1000);
});

client.on('error', (error) => {
  console.error('❌ Discord connection error:', error);
  process.exit(1);
});

// Timeout after 10 seconds if no connection
setTimeout(() => {
  if (!connectionTest) {
    console.log('⏰ Connection test timeout - this might be a network issue');
    console.log('🔧 Check Discord token and network connectivity');
    client.destroy();
    process.exit(1);
  }
}, 10000);

console.log('🔑 Attempting Discord login...');
client.login(process.env.DISCORD_TOKEN);
