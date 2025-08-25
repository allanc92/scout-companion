/**
 * Scout Group Context Manager
 * Detects conversation context and group dynamics
 */

class GroupContextManager {
  constructor() {
    // Context detection thresholds
    this.thresholds = {
      activeUserWindow: 300000, // 5 minutes
      groupChatMinUsers: 3,
      highEnergyMessageRate: 5, // messages per minute
      quietPeriodMs: 600000 // 10 minutes of silence
    };

    // Track channel activity
    this.channelActivity = new Map();
    this.userActivity = new Map();
  }

  /**
   * Detects the conversation context from a message
   * @param {Message} message - Discord message object
   * @returns {Object} Context information
   */
  async detectContext(message) {
    const channelId = message.channel.id;
    const now = Date.now();

    // Update activity tracking
    this.updateActivity(message);

    // Get recent activity data
    const activity = this.channelActivity.get(channelId) || this.createEmptyActivity();
    const recentUsers = this.getRecentUsers(channelId, now);
    const messageRate = this.getMessageRate(channelId, now);
    
    // Determine context type
    const context = {
      type: this.determineContextType(recentUsers.size, messageRate),
      energy: this.determineEnergyLevel(messageRate, message),
      recentUsers: recentUsers.size,
      messageRate: messageRate,
      quietPeriod: now - activity.lastMessage > this.thresholds.quietPeriodMs,
      channelType: message.channel.type,
      timestamp: now
    };

    // Add conversation flow analysis
    context.conversationFlow = this.analyzeConversationFlow(channelId);
    
    return context;
  }

  /**
   * Updates activity tracking for a channel and user
   * @param {Message} message - Discord message
   */
  updateActivity(message) {
    const channelId = message.channel.id;
    const userId = message.author.id;
    const now = Date.now();

    // Update channel activity
    if (!this.channelActivity.has(channelId)) {
      this.channelActivity.set(channelId, this.createEmptyActivity());
    }
    
    const activity = this.channelActivity.get(channelId);
    activity.messages.push({
      timestamp: now,
      userId: userId,
      content: message.content
    });
    activity.lastMessage = now;
    activity.totalMessages++;

    // Clean old messages (keep last hour)
    const oneHourAgo = now - 3600000;
    activity.messages = activity.messages.filter(msg => msg.timestamp > oneHourAgo);

    // Update user activity
    if (!this.userActivity.has(userId)) {
      this.userActivity.set(userId, { lastSeen: now, messageCount: 0, channels: new Set() });
    }
    
    const user = this.userActivity.get(userId);
    user.lastSeen = now;
    user.messageCount++;
    user.channels.add(channelId);
  }

  /**
   * Creates empty activity object
   * @returns {Object} Empty activity tracking object
   */
  createEmptyActivity() {
    return {
      messages: [],
      lastMessage: 0,
      totalMessages: 0
    };
  }

  /**
   * Gets users active in the recent time window
   * @param {string} channelId - Channel ID
   * @param {number} now - Current timestamp
   * @returns {Set} Set of active user IDs
   */
  getRecentUsers(channelId, now) {
    const activity = this.channelActivity.get(channelId);
    if (!activity) return new Set();

    const recentWindow = now - this.thresholds.activeUserWindow;
    const recentUsers = new Set();

    activity.messages
      .filter(msg => msg.timestamp > recentWindow)
      .forEach(msg => recentUsers.add(msg.userId));

    return recentUsers;
  }

  /**
   * Calculates message rate for a channel
   * @param {string} channelId - Channel ID  
   * @param {number} now - Current timestamp
   * @returns {number} Messages per minute
   */
  getMessageRate(channelId, now) {
    const activity = this.channelActivity.get(channelId);
    if (!activity) return 0;

    const oneMinuteAgo = now - 60000;
    const recentMessages = activity.messages.filter(msg => msg.timestamp > oneMinuteAgo);
    
    return recentMessages.length;
  }

  /**
   * Determines context type based on activity
   * @param {number} userCount - Number of active users
   * @param {number} messageRate - Messages per minute
   * @returns {string} Context type
   */
  determineContextType(userCount, messageRate) {
    if (userCount >= this.thresholds.groupChatMinUsers) {
      return 'group';
    } else if (userCount === 2) {
      return '1on1';
    } else {
      return 'quiet';
    }
  }

  /**
   * Determines energy level of the conversation
   * @param {number} messageRate - Messages per minute
   * @param {Message} message - Current message
   * @returns {string} Energy level
   */
  determineEnergyLevel(messageRate, message) {
    const content = message.content.toLowerCase();
    
    // High energy indicators
    const highEnergyPatterns = [
      /!{2,}/, // Multiple exclamation marks
      /[A-Z]{3,}/, // All caps words
      /🔥|💪|🚀|⚡/, // High energy emojis
      /(wow|omg|holy|damn|insane|crazy)/i
    ];

    const hasHighEnergyContent = highEnergyPatterns.some(pattern => pattern.test(content));
    
    if (messageRate >= this.thresholds.highEnergyMessageRate || hasHighEnergyContent) {
      return 'high';
    } else if (messageRate >= 2) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Analyzes conversation flow and topics
   * @param {string} channelId - Channel ID
   * @returns {Object} Conversation flow analysis
   */
  analyzeConversationFlow(channelId) {
    const activity = this.channelActivity.get(channelId);
    if (!activity || activity.messages.length < 2) {
      return { trend: 'neutral', topic: 'general' };
    }

    const recentMessages = activity.messages.slice(-5); // Last 5 messages
    
    // Analyze topic consistency
    const footballKeywords = ['game', 'team', 'player', 'score', 'win', 'lose', 'championship'];
    const footballMentions = recentMessages.filter(msg => 
      footballKeywords.some(keyword => msg.content.toLowerCase().includes(keyword))
    ).length;

    const topic = footballMentions >= 2 ? 'football' : 'general';
    
    // Analyze conversation trend (heating up vs cooling down)
    const timestamps = recentMessages.map(msg => msg.timestamp);
    const intervals = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i-1]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const trend = avgInterval < 30000 ? 'heating_up' : avgInterval > 120000 ? 'cooling_down' : 'steady';

    return { trend, topic, avgInterval, footballMentions };
  }

  /**
   * Gets context suggestions for Scout's response style
   * @param {Object} context - Detected context
   * @returns {Object} Response style suggestions
   */
  getResponseStyleSuggestions(context) {
    const suggestions = {
      responseLength: 'medium',
      enthusiasmLevel: 'moderate',
      includeQuestions: false,
      useEmojis: true
    };

    // Adjust based on context
    if (context.type === 'group' && context.energy === 'high') {
      suggestions.responseLength = 'short';
      suggestions.enthusiasmLevel = 'high';
      suggestions.useEmojis = true;
    } else if (context.type === '1on1') {
      suggestions.responseLength = 'medium';
      suggestions.includeQuestions = true;
    } else if (context.energy === 'low') {
      suggestions.enthusiasmLevel = 'calm';
      suggestions.responseLength = 'long';
    }

    if (context.conversationFlow.topic === 'football') {
      suggestions.includeFootballEmojis = true;
    }

    return suggestions;
  }

  /**
   * Cleans up old activity data
   */
  cleanup() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    // Clean old messages from channel activity
    for (const [channelId, activity] of this.channelActivity) {
      activity.messages = activity.messages.filter(msg => msg.timestamp > oneHourAgo);
      
      // Remove empty activities
      if (activity.messages.length === 0 && now - activity.lastMessage > 3600000) {
        this.channelActivity.delete(channelId);
      }
    }

    // Clean old user data
    const oneDayAgo = now - 86400000;
    for (const [userId, user] of this.userActivity) {
      if (user.lastSeen < oneDayAgo) {
        this.userActivity.delete(userId);
      }
    }

    console.log('🧹 Context manager cleaned up old activity data');
  }

  /**
   * Gets activity statistics
   * @returns {Object} Activity stats
   */
  getStats() {
    return {
      trackedChannels: this.channelActivity.size,
      trackedUsers: this.userActivity.size,
      totalMessages: Array.from(this.channelActivity.values())
        .reduce((total, activity) => total + activity.totalMessages, 0)
    };
  }
}

module.exports = GroupContextManager;
