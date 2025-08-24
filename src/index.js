

require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

// OpenAI client for Azure OpenAI (using standard OpenAI SDK with Azure endpoints)
let openaiClient = null;
let aiAvailable = false;

try {
  if (process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY) {
    const { OpenAI } = require('openai');
    
    openaiClient = new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
      defaultQuery: { 'api-version': '2024-06-01' },
      defaultHeaders: {
        'api-key': process.env.AZURE_OPENAI_API_KEY,
      },
    });
    
    aiAvailable = true;
    console.log('✅ OpenAI client configured for Azure OpenAI');
  } else {
    console.log('⚠️ Azure OpenAI env vars missing; only Discord commands will work');
  }
} catch (err) {
  console.error('❌ OpenAI client initialization failed:', err.message);
  console.log('📌 Discord bot will continue working without AI features');
  aiAvailable = false;
}

async function getScoutResponse(prompt) {
  if (!aiAvailable || !openaiClient) {
    throw new Error('AI service not available');
  }

  try {
    const response = await openaiClient.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT, // This is the deployment name in Azure
      messages: [
        { 
          role: 'system', 
          content: 'You are Scout, a warm, emotionally intelligent AI companion who responds with empathy, clarity, and a touch of playfulness about sports and college football. Keep responses concise but engaging.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    return response.choices?.[0]?.message?.content || 'No response generated';
  } catch (err) {
    console.error('OpenAI API call failed:', err.message);
    throw new Error('AI service temporarily unavailable');
  }
}

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
    const prompt = interaction.options.getString('prompt');
    await interaction.deferReply();
    
    try {
      if (!aiAvailable) {
        await interaction.editReply('🔧 Scout AI is currently offline for maintenance. Try /ping or /kickoff instead!');
        return;
      }
      
      const response = await getScoutResponse(prompt);
      await interaction.editReply(response);
    } catch (err) {
      console.error('Error in /scout command:', err.message);
      await interaction.editReply('🤖 Sorry, Scout had trouble connecting to the AI service. Please try again later!');
    }
  }
});

// Start the companion
registerCommands().then(() => client.login(process.env.DISCORD_TOKEN));
