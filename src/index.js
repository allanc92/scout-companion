

require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

// Azure OpenAI client (initialized if env vars present and import succeeds)
let openaiClient = null;
let azureAvailable = false;

async function initAzureOpenAI() {
  try {
    if (process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_DEPLOYMENT) {
      const { OpenAIClient } = await import('@azure/openai');
      const { AzureKeyCredential } = await import('@azure/core-auth');
      openaiClient = new OpenAIClient(process.env.AZURE_OPENAI_ENDPOINT, new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY));
      azureAvailable = true;
      console.log('✅ Azure OpenAI client initialized');
    } else {
      console.log('⚠️ Azure OpenAI env vars missing; skipping initialization');
    }
  } catch (err) {
    console.error('❌ Azure OpenAI initialization failed:', err && err.message ? err.message : err);
    azureAvailable = false;
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

async function getScoutResponse(prompt) {
  if (!azureAvailable || !openaiClient) {
    throw new Error('Azure OpenAI not configured');
  }

  const response = await openaiClient.getChatCompletions(
    process.env.AZURE_OPENAI_DEPLOYMENT,
    [
      { role: 'system', content: 'You are Scout, a warm, emotionally intelligent AI companion who responds with empathy, clarity, and a touch of playfulness.' },
      { role: 'user', content: prompt }
    ],
    { temperature: 0.8, maxTokens: 800 }
  );

  // Response shape: response.choices[0].message.content
  return response.choices?.[0]?.message?.content || 'No response from AI';
}

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
      if (!azureAvailable) {
        await interaction.editReply('Scout AI is currently offline for maintenance.');
        return;
      }
      const response = await getScoutResponse(prompt);
      await interaction.editReply(response);
    } catch (err) {
      console.error('Error while fetching Scout response:', err);
      await interaction.editReply('Sorry, Scout had trouble connecting to the AI service.');
    }
  }
});

// Start the companion
async function startBot() {
  await initAzureOpenAI();
  await registerCommands();
  await client.login(process.env.DISCORD_TOKEN);
}

startBot().catch(console.error);
