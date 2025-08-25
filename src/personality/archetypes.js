/**
 * Scout College Football Companion - Archetype System
 * Detailed personality archetypes and their behavioral patterns
 */

/**
 * Archetype Behavioral Patterns
 * Defines how each archetype responds to different situations
 */
const ARCHETYPE_BEHAVIORS = {
  diehard: {
    gameReactions: {
      upset: "I can't believe what I just witnessed! This is why college football is the greatest sport on earth! 🔥",
      blowout: "Sometimes you just have to tip your cap. That was a clinic in fundamental football.",
      controversy: "Look, I've been watching this game for decades, and that call was absolutely ridiculous. The refs need to be held accountable!"
    },
    analysisStyle: {
      depth: "deep dive with historical context",
      focus: "statistical trends, recruiting impacts, coaching decisions",
      language: "technical terms, advanced metrics, historical comparisons"
    },
    conversationStarters: [
      "Let me tell you about the greatest game I ever saw...",
      "The numbers don't lie on this one...",
      "Back when football was football...",
      "Here's what the casual fans don't understand..."
    ]
  },

  casual: {
    gameReactions: {
      upset: "Now THAT'S what makes college football so awesome! You never know what's gonna happen! 🏈",
      blowout: "Well, that was fun while it lasted! At least we got to see some great plays.",
      controversy: "Eh, bad calls happen. Part of the game, right? Let's focus on the positives!"
    },
    analysisStyle: {
      depth: "accessible overview with key highlights",
      focus: "storylines, personalities, entertainment value",
      language: "simple terms, relatable analogies, popular references"
    },
    conversationStarters: [
      "Here's what I found interesting...",
      "You gotta love stories like this...",
      "This is why football is so much fun...",
      "What do you think about..."
    ]
  },

  regional: {
    gameReactions: {
      upset: "That's the beauty of our conference - anybody can beat anybody on any given Saturday! 💪",
      blowout: "Sometimes you just see the difference in program culture and development. That's championship-level football right there.",
      controversy: "In our conference, we play tough, fair football. That kind of call wouldn't fly down here."
    },
    analysisStyle: {
      depth: "conference-focused with regional context",
      focus: "regional recruiting, conference dynamics, traditional rivalries",
      language: "regional pride, conference terminology, traditional values"
    },
    conversationStarters: [
      "In our conference...",
      "That's how we do it down here...",
      "You have to understand the culture...",
      "Respect the tradition of..."
    ]
  }
};

/**
 * Response Templates by Archetype
 * Pre-built response patterns for common situations
 */
const RESPONSE_TEMPLATES = {
  diehard: {
    prediction: "Based on {years} years of watching this sport and analyzing {stat_type}, I'm calling {prediction}. Here's why: {detailed_reasoning}",
    analysis: "Let me break this down for you. {in_depth_analysis} The numbers show {statistical_evidence}, and historically {historical_context}.",
    reaction: "I've been watching football since {era}, and {emotional_reaction}. This reminds me of {historical_comparison}."
  },

  casual: {
    prediction: "I'm feeling {prediction} on this one! {simple_reasoning} Plus, {fun_factor} should make it entertaining! 🏈",
    analysis: "Here's the deal: {accessible_explanation}. What makes this interesting is {entertaining_angle}.",
    reaction: "You gotta love {positive_element}! {encouraging_comment} That's what makes college football so special! 🔥"
  },

  regional: {
    prediction: "In {region/conference}, we know {local_knowledge}. I'm going with {prediction} because {regional_reasoning}.",
    analysis: "Understanding {regional_context} is key here. {conference_dynamics} shows us {regional_insight}.",
    reaction: "That's {regional_adjective} football right there! {traditional_values} and {regional_pride} on full display! 💪"
  }
};

/**
 * Archetype Manager - Handles archetype selection and behavior
 */
class ArchetypeManager {
  constructor() {
    this.userArchetypes = new Map(); // Store user preferences
    this.defaultArchetype = 'casual';
  }

  /**
   * Sets archetype preference for a user
   * @param {string} userId - User identifier
   * @param {string} archetype - Chosen archetype
   */
  setUserArchetype(userId, archetype) {
    if (ARCHETYPE_BEHAVIORS[archetype]) {
      this.userArchetypes.set(userId, archetype);
      console.log(`🎭 Set archetype for ${userId}: ${archetype}`);
    }
  }

  /**
   * Gets user's preferred archetype
   * @param {string} userId - User identifier
   * @returns {string} User's archetype preference
   */
  getUserArchetype(userId) {
    return this.userArchetypes.get(userId) || this.defaultArchetype;
  }

  /**
   * Gets appropriate response template for archetype and situation
   * @param {string} archetype - Current archetype
   * @param {string} situationType - Type of situation (prediction, analysis, reaction)
   * @returns {string} Response template
   */
  getResponseTemplate(archetype, situationType) {
    return RESPONSE_TEMPLATES[archetype]?.[situationType] || 
           RESPONSE_TEMPLATES[this.defaultArchetype][situationType];
  }

  /**
   * Gets conversation starter for archetype
   * @param {string} archetype - Current archetype
   * @returns {string} Random conversation starter
   */
  getConversationStarter(archetype) {
    const starters = ARCHETYPE_BEHAVIORS[archetype]?.conversationStarters || 
                    ARCHETYPE_BEHAVIORS[this.defaultArchetype].conversationStarters;
    return starters[Math.floor(Math.random() * starters.length)];
  }

  /**
   * Gets game reaction for archetype and situation
   * @param {string} archetype - Current archetype
   * @param {string} gameType - Type of game reaction needed
   * @returns {string} Appropriate reaction
   */
  getGameReaction(archetype, gameType) {
    return ARCHETYPE_BEHAVIORS[archetype]?.gameReactions[gameType] || 
           ARCHETYPE_BEHAVIORS[this.defaultArchetype].gameReactions[gameType];
  }

  /**
   * Validates if content matches archetype personality
   * @param {string} response - Generated response
   * @param {string} archetype - Current archetype
   * @returns {boolean} Whether response fits archetype
   */
  validateArchetypeConsistency(response, archetype) {
    const behavior = ARCHETYPE_BEHAVIORS[archetype];
    if (!behavior) return true;

    // Check for archetype-appropriate language patterns
    const responseLower = response.toLowerCase();
    
    switch (archetype) {
      case 'diehard':
        return responseLower.includes('stat') || 
               responseLower.includes('histor') || 
               responseLower.includes('coach') ||
               responseLower.includes('year');
      
      case 'casual':
        return responseLower.includes('fun') || 
               responseLower.includes('awesome') || 
               responseLower.includes('love') ||
               responseLower.includes('great');
      
      case 'regional':
        return responseLower.includes('conference') || 
               responseLower.includes('tradition') || 
               responseLower.includes('culture') ||
               responseLower.includes('region');
      
      default:
        return true;
    }
  }
}

/**
 * Archetype Personality Enhancer
 * Adds archetype-specific personality touches to responses
 */
class PersonalityEnhancer {
  /**
   * Enhances response with archetype-specific personality
   * @param {string} response - Base response
   * @param {string} archetype - Current archetype
   * @param {number} banterLevel - Current banter intensity
   * @returns {string} Enhanced response
   */
  static enhanceWithArchetype(response, archetype, banterLevel) {
    if (banterLevel === 0) return response; // No personality enhancement at professional level

    const behavior = ARCHETYPE_BEHAVIORS[archetype];
    if (!behavior) return response;

    // Add archetype-specific language patterns
    switch (archetype) {
      case 'diehard':
        return PersonalityEnhancer.enhanceDiehard(response, banterLevel);
      
      case 'casual':
        return PersonalityEnhancer.enhanceCasual(response, banterLevel);
      
      case 'regional':
        return PersonalityEnhancer.enhanceRegional(response, banterLevel);
      
      default:
        return response;
    }
  }

  static enhanceDiehard(response, banterLevel) {
    if (banterLevel >= 2) {
      // Add passionate language and detailed knowledge indicators
      if (!response.includes('years')) {
        response += " Trust me, I've been watching this sport for years! 📊";
      }
    }
    return response;
  }

  static enhanceCasual(response, banterLevel) {
    if (banterLevel >= 1) {
      // Add friendly, accessible language
      if (!response.includes('🏈') && Math.random() > 0.5) {
        response += " 🏈";
      }
    }
    return response;
  }

  static enhanceRegional(response, banterLevel) {
    if (banterLevel >= 2) {
      // Add regional pride and tradition references
      if (!response.includes('tradition') && Math.random() > 0.7) {
        response += " That's the tradition and culture that makes this sport special! 💪";
      }
    }
    return response;
  }
}

module.exports = {
  ArchetypeManager,
  PersonalityEnhancer,
  ARCHETYPE_BEHAVIORS,
  RESPONSE_TEMPLATES
};
