/**
 * Scout Trigger Parser
 * Analyzes messages to determine when Scout should naturally respond
 */

class TriggerParser {
  constructor() {
    // Direct mention patterns
    this.directTriggers = [
      /\bscout\b/i,
      /hey scout/i,
      /scout[,!?]?\s/i,
      /@scout/i
    ];

    // Conversation cues that suggest Scout should join in
    this.conversationCues = [
      // Questions seeking opinions
      /thoughts\?/i,
      /what do you think/i,
      /opinions?\?/i,
      /predictions?\?/i,
      /who('s|'s gonna|s going to)\s+(win|winning)/i,
      /any takes\?/i,
      
      // Football-specific triggers
      /championship/i,
      /playoff/i,
      /who('s|'s gonna|s going to)\s+(beat|lose to)/i,
      /(upset|blowout) (alert|incoming)/i,
      /rivalry week/i,
      /game day/i,
      /college football/i,
      
      // Debate/discussion starters
      /controversial take/i,
      /hot take/i,
      /unpopular opinion/i,
      /change my mind/i,
      /am i wrong/i,
      /settle (this|an argument)/i,
      
      // Group energy phrases
      /let's go/i,
      /(this is|that was) (crazy|insane|wild)/i,
      /no way/i,
      /are you kidding/i,
      /i can't believe/i
    ];

    // High-energy phrases that warrant emoji reactions
    this.reactionTriggers = [
      { pattern: /(touchdown|td|score)/i, emoji: '🏈' },
      { pattern: /(upset|major upset)/i, emoji: '🔥' },
      { pattern: /(championship|natty)/i, emoji: '🏆' },
      { pattern: /(rivalry|hate)/i, emoji: '💪' },
      { pattern: /(no way|unbelievable)/i, emoji: '😱' },
      { pattern: /(let's go|hype)/i, emoji: '🚀' }
    ];

    // Context clues for archetype suggestion
    this.archetypeHints = {
      diehard: [/stats?/i, /numbers/i, /analytics?/i, /historically/i, /data/i, /metrics/i],
      casual: [/fun/i, /exciting/i, /entertaining/i, /cool/i, /awesome/i, /love/i],
      regional: [/(sec|big ten|pac.?12|big.?12|acc)/i, /conference/i, /tradition/i, /culture/i]
    };
  }

  /**
   * Analyzes a Discord message to determine if Scout should respond
   * @param {Message} message - Discord message object
   * @returns {Object} Analysis result with response recommendation
   */
  async analyzeMessage(message) {
    const content = message.content.toLowerCase();
    const result = {
      shouldRespond: false,
      trigger: null,
      isDirectMention: false,
      suggestedArchetype: null,
      contextualPrompt: message.content,
      confidence: 0,
      reactionSuggestion: null
    };

    // Check for direct mentions (highest priority)
    for (const trigger of this.directTriggers) {
      if (trigger.test(content)) {
        result.shouldRespond = true;
        result.trigger = 'direct_mention';
        result.isDirectMention = true;
        result.confidence = 0.95;
        break;
      }
    }

    // Check for conversation cues (medium priority)
    if (!result.shouldRespond) {
      for (const cue of this.conversationCues) {
        if (cue.test(content)) {
          result.shouldRespond = Math.random() < 0.4; // 40% chance to respond
          result.trigger = 'conversation_cue';
          result.confidence = 0.6;
          break;
        }
      }
    }

    // Check for high-energy moments (low priority, but good for reactions)
    if (!result.shouldRespond) {
      for (const reactionTrigger of this.reactionTriggers) {
        if (reactionTrigger.pattern.test(content)) {
          result.reactionSuggestion = reactionTrigger.emoji;
          // Sometimes respond, sometimes just react
          result.shouldRespond = Math.random() < 0.2; // 20% chance
          result.trigger = 'high_energy';
          result.confidence = 0.3;
          break;
        }
      }
    }

    // Suggest archetype based on content
    result.suggestedArchetype = this.detectArchetypeHint(content);

    // Enhance contextual prompt for more natural responses
    if (result.shouldRespond && !result.isDirectMention) {
      result.contextualPrompt = this.buildContextualPrompt(message);
    }

    return result;
  }

  /**
   * Detects archetype hints in the message content
   * @param {string} content - Message content
   * @returns {string|null} Suggested archetype
   */
  detectArchetypeHint(content) {
    for (const [archetype, hints] of Object.entries(this.archetypeHints)) {
      for (const hint of hints) {
        if (hint.test(content)) {
          return archetype;
        }
      }
    }
    return null;
  }

  /**
   * Builds a contextual prompt for more natural responses
   * @param {Message} message - Discord message
   * @returns {string} Enhanced prompt
   */
  buildContextualPrompt(message) {
    const baseContent = message.content;
    
    // Add context about the conversation flow
    const contextPrefix = this.getContextPrefix(message);
    
    return `${contextPrefix}${baseContent}`;
  }

  /**
   * Gets appropriate context prefix for natural responses
   * @param {Message} message - Discord message
   * @returns {string} Context prefix
   */
  getContextPrefix(message) {
    const hour = new Date().getHours();
    const content = message.content.toLowerCase();
    
    // Time-based context
    if (hour >= 6 && hour < 12) {
      return "Morning conversation: ";
    } else if (hour >= 12 && hour < 17) {
      return "Afternoon chat: ";
    } else if (hour >= 17 && hour < 22) {
      return "Evening discussion: ";
    } else {
      return "Late night conversation: ";
    }
  }

  /**
   * Updates trigger patterns (for future customization)
   * @param {Object} newPatterns - New trigger patterns
   */
  updateTriggers(newPatterns) {
    if (newPatterns.directTriggers) {
      this.directTriggers = [...this.directTriggers, ...newPatterns.directTriggers];
    }
    if (newPatterns.conversationCues) {
      this.conversationCues = [...this.conversationCues, ...newPatterns.conversationCues];
    }
    console.log('🔧 Trigger patterns updated');
  }

  /**
   * Gets current trigger statistics
   * @returns {Object} Trigger stats
   */
  getStats() {
    return {
      directTriggers: this.directTriggers.length,
      conversationCues: this.conversationCues.length,
      reactionTriggers: this.reactionTriggers.length,
      archetypeHints: Object.keys(this.archetypeHints).length
    };
  }
}

module.exports = TriggerParser;
