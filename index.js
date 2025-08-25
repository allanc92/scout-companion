// Scout - College Football Discord Bot
require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

console.log('🚀 Starting Scout Discord Bot with WhatsApp-style monitoring...');

// WhatsApp-style Message Monitor
class WhatsAppMonitor {
  constructor(client) {
    this.client = client;
    this.lastResponse = null;
    this.responseCount = 0;
    this.cooldownUntil = 0;
    this.maxResponsesPerHour = 50; // Generous limit for friends!
    this.cooldownSeconds = 3; // Super responsive for friends!
    
    this.setupListener();
  }
  
  setupListener() {
    this.client.on('messageCreate', async (message) => {
      // Skip if bot message or from Scout himself
      if (message.author.bot || message.author.id === this.client.user.id) return;
      
      // Check cooldown
      if (Date.now() < this.cooldownUntil) return;
      
      // Check hourly limit
      if (this.responseCount >= this.maxResponsesPerHour) return;
      
      const content = message.content.toLowerCase();
      const shouldRespond = this.shouldRespond(content);
      
      if (shouldRespond) {
        console.log(`👂 WhatsApp trigger detected: "${message.content}"`);
        
        try {
          // Show typing indicator
          await message.channel.sendTyping();
          
          // Get response (simple for now)
          const response = this.getResponse(message.content);
          
          // Reply to the message
          await message.reply(response);
          
          // Update tracking
          this.lastResponse = Date.now();
          this.responseCount++;
          this.cooldownUntil = Date.now() + (this.cooldownSeconds * 1000);
          
          console.log(`✅ WhatsApp response sent! (${this.responseCount}/${this.maxResponsesPerHour} this hour)`);
          
        } catch (error) {
          console.error('❌ WhatsApp response error:', error);
        }
      }
    });
    
    // Reset hourly counter
    setInterval(() => {
      this.responseCount = 0;
      console.log('🔄 WhatsApp monitoring: Hourly counter reset');
    }, 3600000); // Reset every hour
  }
  
  shouldRespond(content) {
    // Direct Scout mentions
    if (content.includes('scout') || content.includes('<@' + this.client.user.id + '>')) {
      return true;
    }
    
    // Football conversation triggers
    const footballTriggers = [
      'who\'s winning', 'who is winning', 'whats the score', 'what\'s the score',
      'thoughts?', 'any thoughts', 'what do you think',
      'college football', 'cfb', 'football game',
      'which team', 'best team', 'favorite team',
      'playoff', 'bowl game', 'championship'
    ];
    
    return footballTriggers.some(trigger => content.includes(trigger));
  }
  
  getResponse(originalMessage) {
    const responses = [
      "🏈 I heard my name! What's up with college football today?",
      "👋 Hey there! Ready to talk some CFB?",
      "🎯 Scout here! What's the football question?",
      "💚 You called? I'm always down for football talk!",
      "🏆 College football chat? Count me in!"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  getStats() {
    return {
      lastResponse: this.lastResponse ? new Date(this.lastResponse).toLocaleTimeString() : 'Never',
      hourlyResponses: this.responseCount,
      maxPerHour: this.maxResponsesPerHour,
      cooldownRemaining: Math.max(0, this.cooldownUntil - Date.now()),
      cooldownSeconds: this.cooldownSeconds
    };
  }
}

// Create Discord client
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});

// Initialize WhatsApp monitor
let whatsappMonitor;

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
    ),
  new SlashCommandBuilder()
    .setName('monitoring')
    .setDescription('Check Scout\'s WhatsApp-style monitoring status')
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
  
  // Initialize WhatsApp-style monitoring
  whatsappMonitor = new WhatsAppMonitor(client);
  console.log('👂 WhatsApp-style monitoring ACTIVE!');
  console.log('💬 Just mention "Scout" or ask football questions naturally!');
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
        `🏈 **Welcome to Scout with WhatsApp-style monitoring!**\n\n` +
        `I'm your college football companion, ready to chat about games, teams, and everything CFB!\n\n` +
        `**Two ways to chat with me:**\n` +
        `• Use \`/scout\` commands\n` +
        `• Just mention "Scout" or ask football questions naturally in chat!\n\n` +
        `Try saying: "Scout, what do you think about college football?" 🌟`
      );
    }

    if (interaction.commandName === 'monitoring') {
      const stats = whatsappMonitor?.getStats() || { error: 'Not initialized' };
      
      await interaction.reply(
        `📊 **WhatsApp-Style Monitoring Status:**\n\n` +
        `**Status:** ✅ ACTIVE\n` +
        `**Last Response:** ${stats.lastResponse}\n` +
        `**Responses This Hour:** ${stats.hourlyResponses}/${stats.maxPerHour}\n` +
        `**Cooldown:** ${Math.ceil((stats.cooldownRemaining || 0) / 1000)}s\n\n` +
        `**Natural Triggers:**\n` +
        `• "Scout" mentions\n` +
        `• "Who's winning?" / "Thoughts?"\n` +
        `• College football keywords\n\n` +
        `💬 Just chat naturally - I'll join in!`
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
