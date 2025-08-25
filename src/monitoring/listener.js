/**
 * Scout Discord Message Listener
 * Monitors channels for natural conversation triggers and responds like a group member
 */

const { Events } = require('discord.js');

class MessageListener {
  constructor(client, scoutResponseHandler, triggerParser, groupContextManager) {
    this.client = client;
    this.getScoutResponse = scoutResponseHandler;
    this.triggerParser = triggerParser;
    this.groupContext = groupContextManager;
    
    // Configuration
    this.config = {
      monitoredChannels: process.env.MONITORED_CHANNELS?.split(',') || [], // Specific channels to monitor
      responseChance: 0.15, // 15% chance to respond to general conversation
      cooldownMs: 30000, // 30 second cooldown between unprompted responses
      maxResponsesPerHour: 5 // Rate limiting
    };
    
    // State tracking
    this.lastResponse = new Date(0);
    this.hourlyResponses = 0;
    this.hourlyResetTime = Date.now() + 3600000; // Reset counter every hour
    
    this.setupListener();
  }

  /**
   * Sets up the Discord message listener
   */
  setupListener() {
    this.client.on(Events.MessageCreate, async (message) => {
      try {
        // Skip bot messages, DMs, and messages from Scout itself
        if (message.author.bot || !message.guild || message.author.id === this.client.user.id) {
          return;
        }

        // Check if channel should be monitored
        if (this.config.monitoredChannels.length > 0 && 
            !this.config.monitoredChannels.includes(message.channel.id)) {
          return;
        }

        // Reset hourly counter if needed
        if (Date.now() > this.hourlyResetTime) {
          this.hourlyResponses = 0;
          this.hourlyResetTime = Date.now() + 3600000;
        }

        // Analyze the message for triggers
        const triggerResult = await this.triggerParser.analyzeMessage(message);
        
        if (triggerResult.shouldRespond) {
          await this.handleResponse(message, triggerResult);
        }

      } catch (error) {
        console.error('❌ Message listener error:', error);
      }
    });

    console.log('👂 Scout message listener active - monitoring for natural conversation');
  }

  /**
   * Handles Scout's response based on trigger analysis
   */
  async handleResponse(message, triggerResult) {
    const now = Date.now();
    
    // Check rate limiting for unprompted responses
    if (!triggerResult.isDirectMention && 
        (now - this.lastResponse.getTime() < this.config.cooldownMs || 
         this.hourlyResponses >= this.config.maxResponsesPerHour)) {
      console.log('🚫 Scout response rate limited');
      return;
    }

    // Determine chat context
    const chatContext = await this.groupContext.detectContext(message);
    
    // Add typing indicator for natural feel
    await message.channel.sendTyping();
    
    // Brief delay for natural conversation flow
    const typingDelay = Math.random() * 2000 + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, typingDelay));

    try {
      // Get Scout's response using the existing personality system
      const scoutResponse = await this.getScoutResponse(
        triggerResult.contextualPrompt,
        triggerResult.suggestedArchetype,
        chatContext.type,
        message.author.id
      );

      // Send response
      await message.reply(scoutResponse);
      
      // Update tracking
      this.lastResponse = new Date();
      if (!triggerResult.isDirectMention) {
        this.hourlyResponses++;
      }

      console.log(`💬 Scout responded naturally to: "${message.content.substring(0, 50)}..."`);
      console.log(`🎭 Context: ${chatContext.type} | Trigger: ${triggerResult.trigger} | Archetype: ${triggerResult.suggestedArchetype}`);

    } catch (error) {
      console.error('❌ Error generating Scout response:', error);
      // Fallback response
      await message.react('🤔');
    }
  }

  /**
   * Updates monitoring configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Scout listener config updated:', this.config);
  }

  /**
   * Gets current listener statistics
   */
  getStats() {
    return {
      lastResponse: this.lastResponse,
      hourlyResponses: this.hourlyResponses,
      cooldownRemaining: Math.max(0, this.config.cooldownMs - (Date.now() - this.lastResponse.getTime())),
      monitoredChannels: this.config.monitoredChannels.length
    };
  }
}

module.exports = MessageListener;
