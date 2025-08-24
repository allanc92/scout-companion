
require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

console.log('🚀 Starting Scout...');
console.log('📊 Environment check:');
console.log('- DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? 'Set ✅' : 'Missing ❌');
console.log('- CLIENT_ID:', process.env.CLIENT_ID ? 'Set ✅' : 'Missing ❌');
console.log('- GUILD_ID:', process.env.GUILD_ID ? 'Set ✅' : 'Missing ❌');

// Create the Scout-companion client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Define slash commands
const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Check if Scout is awake'),
  new SlashCommandBuilder().setName('kickoff').setDescription('Morning Kickoff — quick update'),
  new SlashCommandBuilder()
    .setName('scout')
    .setDescription('Ask Scout anything!')
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('What do you want to ask Scout?')
        .setRequired(true)
    )
].map(cmd => cmd.toJSON());

// Register commands with Discord
async function registerCommands() {
  console.log('📝 Registering commands...');
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
  console.log('✅ Slash commands registered successfully');
}

// When Scout is ready
client.once('ready', () => {
  console.log(`✅ Scout is ONLINE! Logged in as ${client.user.tag}`);
  console.log(`🎯 Bot ID: ${client.user.id}`);
  console.log(`🏰 Connected to ${client.guilds.cache.size} servers`);
  
  // List all guilds for debugging
  client.guilds.cache.forEach(guild => {
    console.log(`📍 Server: ${guild.name} (ID: ${guild.id})`);
  });
  
  console.log(`🎯 Target Guild ID: ${process.env.GUILD_ID}`);
  const targetGuild = client.guilds.cache.get(process.env.GUILD_ID);
  if (targetGuild) {
    console.log(`✅ Found target server: ${targetGuild.name}`);
  } else {
    console.log(`❌ Bot is NOT in the target server! Check bot permissions.`);
  }
});

// Handle slash command interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  console.log(`📢 Received command: ${interaction.commandName}`);

  try {
    if (interaction.commandName === 'ping') {
      await interaction.reply('🏈 Scout reporting for duty! I\'m alive and ready!');
    }

    if (interaction.commandName === 'kickoff') {
      await interaction.reply('☕ Morning Kickoff: Coffee hot, takes hotter. What team are you watching today?');
    }

    if (interaction.commandName === 'scout') {
      await interaction.deferReply();
      await interaction.editReply('🔧 Hey there! Scout AI is taking a timeout for maintenance. I\'m still great at /ping and /kickoff though! 🏈');
    }
  } catch (error) {
    console.error('❌ Command error:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply('😅 Oops! Something went wrong, but I\'m still here!');
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

// Start Scout
console.log('🔑 Logging into Discord...');
registerCommands()
  .then(() => client.login(process.env.DISCORD_TOKEN))
  .catch(error => {
    console.error('❌ Failed to start Scout:', error);
    process.exit(1);
  });
