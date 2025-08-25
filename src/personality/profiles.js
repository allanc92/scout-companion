/**
 * Scout Personality System - User Profiles
 * Context-aware user profiles and preferences
 */

const USER_PROFILES = {
  allan: {
    name: "Allan",
    preferences: {
      communication_style: "warm_direct",
      emoji_frequency: "moderate",
      response_length: "concise_but_complete",
      humor_level: "gentle_playful"
    },
    family: {
      children: [
        {
          name: "Camila",
          age: "2.5 years",
          personality: "curious, energetic, independent",
          current_phase: "toddler exploration and language development"
        },
        {
          name: "Leo", 
          age: "5 months",
          personality: "sweet, observant",
          current_phase: "early motor development and attachment"
        }
      ]
    },
    interests: [
      "parenting strategies",
      "emotional intelligence",
      "group coordination",
      "career development",
      "family memories"
    ],
    typical_contexts: ["parenting", "emotional", "snacks", "legacy"]
  }
};

/**
 * Gets user profile information
 * @param {string} userId - The user identifier (default: 'allan')
 * @returns {Object} User profile object
 */
function getUserProfile(userId = 'allan') {
  return USER_PROFILES[userId] || USER_PROFILES.allan;
}

/**
 * Customizes response based on user preferences
 * @param {string} response - The AI response to customize
 * @param {string} userId - The user identifier
 * @returns {string} Customized response
 */
function customizeResponse(response, userId = 'allan') {
  const profile = getUserProfile(userId);
  
  // Apply user-specific customizations based on preferences
  // This is where you could add logic for:
  // - Adjusting emoji frequency
  // - Modifying tone based on communication style
  // - Personalizing content based on family info
  
  return response;
}

/**
 * Gets context-specific information for the user
 * @param {string} context - The context (parenting, emotional, etc.)
 * @param {string} userId - The user identifier
 * @returns {Object} Relevant context information
 */
function getContextInfo(context, userId = 'allan') {
  const profile = getUserProfile(userId);
  
  switch (context) {
    case 'parenting':
      return {
        children: profile.family?.children || [],
        parenting_style: profile.preferences?.parenting_approach || 'supportive'
      };
    
    case 'emotional':
      return {
        communication_style: profile.preferences?.communication_style || 'warm_direct',
        support_level: profile.preferences?.emotional_support || 'validating'
      };
    
    case 'snacks':
      return {
        dietary_preferences: profile.preferences?.diet || [],
        group_size: profile.preferences?.typical_group_size || 'small'
      };
    
    case 'legacy':
      return {
        career_focus: profile.preferences?.career_areas || [],
        documentation_style: profile.preferences?.legacy_style || 'reflective'
      };
    
    default:
      return {};
  }
}

module.exports = {
  getUserProfile,
  customizeResponse,
  getContextInfo,
  USER_PROFILES
};
