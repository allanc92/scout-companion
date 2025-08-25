// Scout - College Football Discord Bot
require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

console.log('🚀 Starting Scout Discord Bot...');

// Create Discord client
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});

// Simple slash commands
const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Check if Scout is awake'),
  new SlashCommandBuilder().setName('kickoff').setDescription('Get started with Scout!'),
  new SlashCommandBuilder()
    .setName('scout')
    .setDescription('Ask Scout about college football!')
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('What do you want to ask Scout?')
        .setRequired(true)
    )
].map(cmd => cmd.toJSON());

// Register commands
async function registerCommands() {
  console.log('📝 Registering commands...');
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
  console.log('✅ Commands registered');
}

// When Scout is ready
client.once('ready', () => {
  console.log(`✅ Scout is ONLINE! Logged in as ${client.user.tag}`);
  console.log(`🏰 Connected to ${client.guilds.cache.size} servers`);
  
  client.guilds.cache.forEach(guild => {
    console.log(`📍 Server: ${guild.name} (ID: ${guild.id})`);
  });
});

// Handle slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  console.log(`📢 Command: ${interaction.commandName}`);

  try {
    if (interaction.commandName === 'ping') {
      await interaction.reply('💚 Scout reporting for duty! Ready to talk college football! 🏈');
    }

    if (interaction.commandName === 'kickoff') {
      await interaction.reply(
        `🏈 **Welcome to Scout!**\n\n` +
        `I'm your college football companion, ready to chat about games, teams, and everything CFB!\n\n` +
        `Try asking me something with \`/scout\` or just mention me in chat! 🌟`
      );
    }

    if (interaction.commandName === 'scout') {
      await interaction.deferReply();
      const prompt = interaction.options.getString('prompt');
      
      console.log(`🎯 Scout command: "${prompt}"`);
      
      // Simple response for now
      const response = `🏈 You asked: "${prompt}"\n\nI'm Scout, your college football buddy! Right now I'm running in basic mode, but I'm ready to chat about CFB! 🌟`;
      
      await interaction.editReply(response);
    }
  } catch (error) {
    console.error('❌ Command error:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply('😅 Oops! Something went wrong, but I\'m still here for football! 🏈');
    }
  }
});

// Error handling
client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

// Environment check
console.log('📊 Environment check:');
console.log('- DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? 'Set ✅' : 'Missing ❌');
console.log('- CLIENT_ID:', process.env.CLIENT_ID ? 'Set ✅' : 'Missing ❌');
console.log('- GUILD_ID:', process.env.GUILD_ID ? 'Set ✅' : 'Missing ❌');

// Start Scout
console.log('🔑 Starting Scout...');
registerCommands()
  .then(() => client.login(process.env.DISCORD_TOKEN))
  .catch(error => {
    console.error('❌ Failed to start Scout:', error);
    process.exit(1);
  });
