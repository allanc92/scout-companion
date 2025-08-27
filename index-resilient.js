// Scout - Enhanced College Football Discord Bot with Connection Resilience
require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { OpenAI } = require('openai');
const ScoutConnectionManager = require('./connection-manager');

console.log('🚀 Starting Scout Discord Bot with enhanced connection resilience...');

// Azure OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
  defaultQuery: { 'api-version': '2024-05-01-preview' },
  defaultHeaders: {
    'api-key': process.env.AZURE_OPENAI_API_KEY,
  },
});

console.log('🤖 Azure OpenAI configured for GPT-5');

// WhatsApp-style Message Monitor with Enhanced Error Handling
class WhatsAppMonitor {
  constructor(client) {
    this.client = client;
    this.lastResponse = null;
    this.responseCount = 0;
    this.cooldownUntil = 0;
    this.maxResponsesPerHour = 50;
    this.cooldownSeconds = 3;
    this.consecutiveErrors = 0;
    this.maxConsecutiveErrors = 3;
    
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
      
      // Check if we're in error recovery mode
      if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
        console.warn(`⚠️ In error recovery mode (${this.consecutiveErrors} consecutive errors)`);
        return;
      }
      
      const content = message.content.toLowerCase();
      const shouldRespond = this.shouldRespond(content);
      
      if (shouldRespond) {
        console.log(`👂 WhatsApp trigger detected: "${message.content}"`);
        
        try {
          // Show typing indicator with timeout
          const typingPromise = message.channel.sendTyping();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Typing timeout')), 5000)
          );
          
          await Promise.race([typingPromise, timeoutPromise]);
          
          // Get AI response with timeout
          const responsePromise = this.getAIResponse(message.content, message.author.displayName);
          const aiTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI response timeout')), 15000)
          );
          
          const response = await Promise.race([responsePromise, aiTimeoutPromise]);
          
          // Reply to the message with timeout
          const replyPromise = message.reply(response);
          const replyTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Reply timeout')), 10000)
          );
          
          await Promise.race([replyPromise, replyTimeoutPromise]);
          
          // Update tracking on success
          this.lastResponse = Date.now();
          this.responseCount++;
          this.cooldownUntil = Date.now() + (this.cooldownSeconds * 1000);
          this.consecutiveErrors = 0; // Reset error counter on success
          
          console.log(`✅ WhatsApp AI response sent! (${this.responseCount}/${this.maxResponsesPerHour} this hour)`);
          
        } catch (error) {
          this.consecutiveErrors++;
          console.error(`❌ WhatsApp response error (${this.consecutiveErrors}/${this.maxConsecutiveErrors}):`, error.message);
          
          // Try fallback response if not too many errors
          if (this.consecutiveErrors < this.maxConsecutiveErrors) {
            try {
              const fallbackResponse = this.getFallbackResponse();
              await message.reply(fallbackResponse);
              
              this.lastResponse = Date.now();
              this.responseCount++;
              this.cooldownUntil = Date.now() + (this.cooldownSeconds * 1000);
              console.log(`⚠️ Fallback response sent due to AI error`);
              
            } catch (fallbackError) {
              console.error('❌ Even fallback failed:', fallbackError.message);
            }
          } else {
            console.warn(`🛑 Too many consecutive errors, entering recovery mode for 5 minutes`);
            setTimeout(() => {
              this.consecutiveErrors = 0;
              console.log(`🔄 Error recovery mode ended, resuming normal operation`);
            }, 300000); // 5 minutes
          }
        }
      }
    });
    
    // Reset hourly counter
    setInterval(() => {
      this.responseCount = 0;
      console.log('🔄 WhatsApp monitoring: Hourly counter reset');
    }, 3600000);
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
  
  async getAIResponse(message, userName) {
    console.log(`🤖 Getting AI response for: "${message}"`);
    
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT,
        messages: [
          {
            role: "system",
            content: `You are Scout, a friendly college football enthusiast who loves chatting about CFB in Discord. You're responding naturally in a group chat like WhatsApp - keep it casual, fun, and friend-like. Use emojis, be enthusiastic about college football, and respond as if you're just hanging out with friends. Keep responses concise (1-3 sentences max) unless asked for detailed analysis. The user's name is ${userName}.`
          },
          {
            role: "user", 
            content: message
          }
        ],
        max_tokens: 150,
        temperature: 0.8
      });
      
      const response = completion.choices[0].message.content.trim();
      console.log(`✅ AI response generated: "${response}"`);
      return response;
      
    } catch (error) {
      console.error('❌ Azure OpenAI error:', error);
      throw error;
    }
  }
  
  getFallbackResponse() {
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
      cooldownSeconds: this.cooldownSeconds,
      consecutiveErrors: this.consecutiveErrors,
      errorRecoveryMode: this.consecutiveErrors >= this.maxConsecutiveErrors
    };
  }
}

// Create Discord client with enhanced intents
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  // Enhanced WebSocket options for stability
  ws: {
    properties: {
      browser: 'scout-cfb-bot'
    }
  }
});

// Initialize connection manager and WhatsApp monitor
let connectionManager;
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
    .setDescription('Check Scout\'s WhatsApp-style monitoring status'),
  new SlashCommandBuilder()
    .setName('connection')
    .setDescription('Check Scout\'s connection status and health')
].map(cmd => cmd.toJSON());

// Register commands with retry logic
async function registerCommands(retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📝 Registering commands (attempt ${attempt}/${retries})...`);
      const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log('✅ Commands registered successfully');
      return;
    } catch (error) {
      console.error(`❌ Command registration attempt ${attempt} failed:`, error.message);
      if (attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
    }
  }
}

// When Scout is ready (using clientReady for Discord.js v14+)
client.once('clientReady', () => {
  console.log(`✅ Scout is ONLINE! Logged in as ${client.user.tag}`);
  console.log(`🏰 Connected to ${client.guilds.cache.size} servers`);
  console.log(`📡 WebSocket ping: ${client.ws.ping}ms`);
  
  client.guilds.cache.forEach(guild => {
    console.log(`📍 Server: ${guild.name} (ID: ${guild.id})`);
  });
  
  // Initialize connection manager
  connectionManager = new ScoutConnectionManager(client);
  console.log('🛡️ Connection resilience manager active');
  
  // Initialize WhatsApp-style monitoring
  whatsappMonitor = new WhatsAppMonitor(client);
  console.log('👂 WhatsApp-style monitoring ACTIVE!');
  console.log('💬 Just mention "Scout" or ask football questions naturally!');
});

// Handle slash commands with enhanced error handling
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  console.log(`📢 Command: ${interaction.commandName} from ${interaction.user.tag}`);

  try {
    if (interaction.commandName === 'ping') {
      const ping = client.ws.ping;
      await interaction.reply(`💚 Scout reporting for duty! Ready to talk college football! 🏈\n🏓 Ping: ${ping}ms`);
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
        `**Status:** ${stats.errorRecoveryMode ? '🔄 Recovery Mode' : '✅ ACTIVE'}\n` +
        `**Last Response:** ${stats.lastResponse}\n` +
        `**Responses This Hour:** ${stats.hourlyResponses}/${stats.maxPerHour}\n` +
        `**Cooldown:** ${Math.ceil((stats.cooldownRemaining || 0) / 1000)}s\n` +
        `**Consecutive Errors:** ${stats.consecutiveErrors || 0}\n\n` +
        `**Natural Triggers:**\n` +
        `• "Scout" mentions\n` +
        `• "Who's winning?" / "Thoughts?"\n` +
        `• College football keywords\n\n` +
        `💬 Just chat naturally - I'll join in!`
      );
    }

    if (interaction.commandName === 'connection') {
      const connStatus = connectionManager?.getConnectionStatus() || { status: 'unknown' };
      const uptime = connStatus.uptime ? Math.floor(connStatus.uptime / 1000 / 60) : 0;
      
      await interaction.reply(
        `🔌 **Scout Connection Status:**\n\n` +
        `**Status:** ${connStatus.status === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}\n` +
        `**Uptime:** ${uptime} minutes\n` +
        `**Ping:** ${connStatus.ping || 'N/A'}ms\n` +
        `**Reconnect Attempts:** ${connStatus.reconnectAttempts || 0}\n` +
        `**Is Reconnecting:** ${connStatus.isReconnecting ? 'Yes' : 'No'}\n\n` +
        `${connStatus.status === 'connected' ? '✅ All systems operational!' : '⚠️ Connection issues detected'}`
      );
    }

    if (interaction.commandName === 'scout') {
      await interaction.deferReply();
      const prompt = interaction.options.getString('prompt');
      
      console.log(`🎯 Scout command: "${prompt}"`);
      
      try {
        // AI response with timeout
        const aiPromise = openai.chat.completions.create({
          model: process.env.AZURE_OPENAI_DEPLOYMENT,
          messages: [
            {
              role: "system",
              content: "You are Scout, a knowledgeable and enthusiastic college football companion. Provide helpful, friendly responses about college football topics. Be conversational and use emojis appropriately."
            },
            {
              role: "user", 
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI timeout')), 20000)
        );
        
        const completion = await Promise.race([aiPromise, timeoutPromise]);
        const response = completion.choices[0].message.content.trim();
        
        await interaction.editReply(response);
        console.log(`✅ AI slash command response sent`);
        
      } catch (error) {
        console.error('❌ AI slash command error:', error);
        const fallbackResponse = `🏈 You asked: "${prompt}"\n\nI'm Scout, your college football buddy! I'm having a moment with my AI brain, but I'm still here to chat about CFB! Try asking me again in a moment. 🌟`;
        await interaction.editReply(fallbackResponse);
      }
    }
  } catch (error) {
    console.error('❌ Command error:', error);
    const errorMessage = '😅 Oops! Something went wrong, but I\'m still here for football! 🏈';
    
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply(errorMessage);
      } else if (interaction.deferred) {
        await interaction.editReply(errorMessage);
      }
    } catch (replyError) {
      console.error('❌ Failed to send error response:', replyError);
    }
  }
});

// Enhanced error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('💀 Uncaught exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

// Environment check
console.log('📊 Environment check:');
console.log('- DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? 'Set ✅' : 'Missing ❌');
console.log('- CLIENT_ID:', process.env.CLIENT_ID ? 'Set ✅' : 'Missing ❌');
console.log('- GUILD_ID:', process.env.GUILD_ID ? 'Set ✅' : 'Missing ❌');
console.log('- AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT ? 'Set ✅' : 'Missing ❌');
console.log('- AZURE_OPENAI_API_KEY:', process.env.AZURE_OPENAI_API_KEY ? 'Set ✅' : 'Missing ❌');
console.log('- AZURE_OPENAI_DEPLOYMENT:', process.env.AZURE_OPENAI_DEPLOYMENT ? 'Set ✅' : 'Missing ❌');

// Start Scout with enhanced error handling
console.log('🔑 Starting Scout with connection resilience...');
registerCommands()
  .then(() => {
    console.log('🚀 Logging into Discord...');
    return client.login(process.env.DISCORD_TOKEN);
  })
  .catch(error => {
    console.error('❌ Failed to start Scout:', error);
    process.exit(1);
  });

// Health check endpoint (for Azure monitoring)
if (process.env.NODE_ENV === 'production') {
  const http = require('http');
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      const status = client.readyAt ? 200 : 503;
      const health = {
        status: client.readyAt ? 'healthy' : 'unhealthy',
        uptime: client.uptime,
        ping: client.ws.ping,
        guilds: client.guilds.cache.size
      };
      
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(health));
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
  
  const port = process.env.PORT || 8080;
  server.listen(port, () => {
    console.log(`🏥 Health check server running on port ${port}`);
  });
}
