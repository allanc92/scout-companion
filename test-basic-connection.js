// Test Scout without Message Content Intent
require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

console.log('🚀 Testing Scout with Basic Intents...');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
    // MessageContent intent disabled for testing
  ] 
});

let connectionTest = false;

client.once('ready', () => {
  console.log(`✅ SUCCESS: Scout connected as ${client.user.tag}`);
  console.log(`🎯 Bot ID: ${client.user.id}`);
  console.log(`🏰 Connected to ${client.guilds.cache.size} servers`);
  
  client.guilds.cache.forEach(guild => {
    console.log(`📍 Server: ${guild.name} (ID: ${guild.id})`);
  });
  
  connectionTest = true;
  console.log('🎯 Basic Discord connection test PASSED! ✅');
  console.log('⚠️  Note: Message Content Intent needs to be enabled for WhatsApp-style monitoring');
  console.log('🔌 Disconnecting test client...');
  client.destroy();
  
  setTimeout(() => {
    console.log('✨ Scout basic connection works! Ready for intent configuration.');
    process.exit(0);
  }, 1000);
});

client.on('error', (error) => {
  console.error('❌ Discord connection error:', error);
  process.exit(1);
});

setTimeout(() => {
  if (!connectionTest) {
    console.log('⏰ Connection test timeout');
    client.destroy();
    process.exit(1);
  }
}, 10000);

console.log('🔑 Attempting Discord login...');
client.login(process.env.DISCORD_TOKEN);
