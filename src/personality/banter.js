/**
 * Scout College Football Companion - Banter System
 * Logic for managing Scout's personality intensity and banter levels
 */

/**
 * Banter Meter Logic - Controls how much personality Scout shows
 */
class BanterMeter {
  constructor() {
    this.currentLevel = 2; // Default to "Spirited" level
    this.userPreferences = new Map(); // Store per-user banter preferences
  }

  /**
   * Sets banter level for a specific user
   * @param {string} userId - User identifier
   * @param {number} level - Banter level (0-3)
   */
  setUserBanterLevel(userId, level) {
    const clampedLevel = Math.max(0, Math.min(3, level));
    this.userPreferences.set(userId, clampedLevel);
    console.log(`🎚️ Set banter level for ${userId}: ${clampedLevel}`);
  }

  /**
   * Gets banter level for a specific user
   * @param {string} userId - User identifier
   * @returns {number} Current banter level (0-3)
   */
  getUserBanterLevel(userId) {
    return this.userPreferences.get(userId) || this.currentLevel;
  }

  /**
   * Adjusts banter level based on user interaction patterns
   * @param {string} userId - User identifier
   * @param {string} prompt - User's message
   * @param {string} responseType - Type of response expected
   */
  adaptBanterLevel(userId, prompt, responseType = 'general') {
    const currentLevel = this.getUserBanterLevel(userId);
    const promptLower = prompt.toLowerCase();
    
    // Auto-adjust based on context clues
    let suggestedLevel = currentLevel;
    
    // Increase banter for rivalry/trash talk
    if (promptLower.match(/\b(rivalry|trash talk|debate|argue|best team|worst team|hate)\b/)) {
      suggestedLevel = Math.min(3, currentLevel + 1);
    }
    
    // Decrease banter for serious analysis requests
    if (promptLower.match(/\b(analysis|serious|professional|report|statistics|academic)\b/)) {
      suggestedLevel = Math.max(0, currentLevel - 1);
    }
    
    // Increase banter for game reactions
    if (promptLower.match(/\b(game|upset|crazy|unbelievable|what a play|did you see)\b/)) {
      suggestedLevel = Math.min(3, currentLevel + 1);
    }
    
    return suggestedLevel;
  }

  /**
   * Gets personality traits unlocked at current banter level
   * @param {number} level - Banter level
   * @returns {Object} Available personality features
   */
  getUnlockedFeatures(level) {
    const features = {
      opinions: level >= 1,
      humor: level >= 1,
      passion: level >= 2,
      controversy: level >= 2,
      trashTalk: level >= 3,
      hotTakes: level >= 3,
      emotionalInvestment: level >= 2,
      personalAnecdotes: level >= 1,
      strongLanguage: level >= 3
    };
    
    return features;
  }

  /**
   * Validates if a response type is appropriate for banter level
   * @param {number} level - Current banter level
   * @param {string} responseType - Type of response being generated
   * @returns {boolean} Whether response type is allowed
   */
  isResponseTypeAllowed(level, responseType) {
    const restrictions = {
      0: ['facts', 'analysis', 'polite'],
      1: ['facts', 'analysis', 'polite', 'opinions', 'mild_humor'],
      2: ['facts', 'analysis', 'polite', 'opinions', 'mild_humor', 'passion', 'banter'],
      3: ['facts', 'analysis', 'polite', 'opinions', 'mild_humor', 'passion', 'banter', 'trash_talk', 'hot_takes']
    };
    
    return restrictions[level]?.includes(responseType) || false;
  }
}

/**
 * Response Filters - Apply banter-level appropriate filtering
 */
class ResponseFilter {
  /**
   * Filters response content based on banter level
   * @param {string} response - Raw AI response
   * @param {number} banterLevel - Current banter level
   * @returns {string} Filtered response
   */
  static applyBanterFilter(response, banterLevel) {
    const features = new BanterMeter().getUnlockedFeatures(banterLevel);
    
    // Level 0: Professional filter
    if (banterLevel === 0) {
      return ResponseFilter.makeProfessional(response);
    }
    
    // Level 1: Friendly filter
    if (banterLevel === 1) {
      return ResponseFilter.makeFriendly(response);
    }
    
    // Level 2+: Full personality (minimal filtering)
    return response;
  }

  /**
   * Makes response more professional and neutral
   * @param {string} response - Raw response
   * @returns {string} Professional version
   */
  static makeProfessional(response) {
    return response
      .replace(/\b(trash|sucks|terrible|awful)\b/gi, 'challenging')
      .replace(/🔥/g, '👍')
      .replace(/💯/g, '✅')
      .replace(/!/g, '.');
  }

  /**
   * Makes response friendly but not too intense
   * @param {string} response - Raw response
   * @returns {string} Friendly version
   */
  static makeFriendly(response) {
    return response
      .replace(/\b(destroyed|demolished|annihilated)\b/gi, 'defeated')
      .replace(/🔥{2,}/g, '🔥');
  }
}

/**
 * Personality Consistency Manager
 * Ensures Scout maintains consistent personality traits across conversations
 */
class PersonalityConsistency {
  constructor() {
    this.scoutOpinions = {
      favoritePlayStyle: "explosive offense with solid defense",
      preferredConferences: ["SEC", "Big Ten", "Pac-12"],
      personalityTraits: ["passionate", "knowledgeable", "loyal", "entertaining"],
      controversialTakes: {
        playoffs: "Should expand to 12 teams",
        recruiting: "NIL has changed everything",
        traditions: "Respect the old ways while embracing change"
      }
    };
  }

  /**
   * Gets Scout's consistent opinion on a topic
   * @param {string} topic - Topic to get opinion on
   * @returns {string|null} Scout's established opinion
   */
  getScoutOpinion(topic) {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('playoff')) {
      return this.scoutOpinions.controversialTakes.playoffs;
    }
    
    if (topicLower.includes('nil') || topicLower.includes('recruiting')) {
      return this.scoutOpinions.controversialTakes.recruiting;
    }
    
    if (topicLower.includes('tradition')) {
      return this.scoutOpinions.controversialTakes.traditions;
    }
    
    return null;
  }

  /**
   * Ensures response aligns with Scout's established personality
   * @param {string} response - Generated response
   * @param {string} topic - Topic being discussed
   * @returns {string} Personality-aligned response
   */
  alignWithPersonality(response, topic) {
    const scoutOpinion = this.getScoutOpinion(topic);
    
    if (scoutOpinion && !response.toLowerCase().includes(scoutOpinion.toLowerCase())) {
      return `${response}\n\nFor what it's worth, I think ${scoutOpinion.toLowerCase()}.`;
    }
    
    return response;
  }
}

module.exports = {
  BanterMeter,
  ResponseFilter,
  PersonalityConsistency
};
