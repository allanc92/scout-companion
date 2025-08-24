

require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

// Create the Scout-companion client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Define slash commands
const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Check if Scout-companion is awake'),
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
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
  console.log('✅ Slash commands registered');
}

// When Scout-companion is ready
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Handle interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Scout-companion reporting for duty. 🏈');
  }

  if (interaction.commandName === 'kickoff') {
    await interaction.reply('Morning Kickoff: Coffee hot, takes hotter. What team are you watching today?');
  }

  if (interaction.commandName === 'scout') {
    await interaction.deferReply();
    await interaction.editReply('Scout AI is currently offline for maintenance.');
  }
});

// Start the companion
registerCommands().then(() => client.login(process.env.DISCORD_TOKEN));
