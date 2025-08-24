require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

// Minimal Scout for testing
console.log('🧪 TESTING: Minimal Scout starting...');
console.log('🔍 Environment variables:');
console.log('- DISCORD_TOKEN length:', process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.length : 'MISSING');
console.log('- CLIENT_ID:', process.env.CLIENT_ID || 'MISSING');
console.log('- GUILD_ID:', process.env.GUILD_ID || 'MISSING');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log('✅ MINIMAL SCOUT IS ONLINE!');
  console.log(`✅ Logged in as: ${client.user.tag}`);
  console.log(`✅ Bot ID: ${client.user.id}`);
  console.log('✅ Test successful - Discord connection working!');
});

client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

client.login(process.env.DISCORD_TOKEN)
  .then(() => {
    console.log('🔑 Login attempt successful');
  })
  .catch(error => {
    console.error('❌ Login failed:', error);
    process.exit(1);
  });

// Keep alive
setInterval(() => {
  console.log('💓 Heartbeat - Scout is alive');
}, 30000);
