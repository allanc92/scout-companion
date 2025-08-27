// Scout - College Football Discord Bot with Feature Flags
require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { OpenAI } = require('openai');
const axios = require('axios');

// 🎯 FEATURE FLAGS CONFIGURATION
const FEATURES = {
  connectionResilience: process.env.ENABLE_RESILIENCE === 'true',
  debugMode: process.env.DEBUG_MODE === 'true',
  testingMode: process.env.TESTING_MODE === 'true',
  healthEndpoint: process.env.ENABLE_HEALTH_ENDPOINT === 'true',
  enhancedLogging: process.env.ENHANCED_LOGGING === 'true',
  featureBranch: process.env.FEATURE_BRANCH || 'main',
  
  // 🔍 INTEGRATION FEATURES (Phase by Phase)
  webSearch: process.env.ENABLE_WEB_SEARCH === 'true',
  realTimeData: process.env.ENABLE_REAL_TIME_DATA === 'true',
  collegeFootball: process.env.ENABLE_COLLEGE_FOOTBALL === 'true'
};

// Log feature flag status
console.log('🎯 SCOUT FEATURE FLAGS:');
Object.entries(FEATURES).forEach(([key, value]) => {
  console.log(`   ${key}: ${value} ${value === true ? '✅' : value === false ? '❌' : '�'}`);
});

console.log(`�🚀 Starting Scout Discord Bot (${FEATURES.featureBranch} branch)...`);

// Conditionally load connection manager for resilience features
let ScoutConnectionManager = null;
if (FEATURES.connectionResilience) {
  try {
    ScoutConnectionManager = require('./connection-manager');
    console.log('🛡️ Connection resilience module loaded');
  } catch (error) {
    console.warn('⚠️ Connection manager not found, resilience features disabled');
    FEATURES.connectionResilience = false;
  }
}

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

// 🔍 INTEGRATION CONFIGURATIONS (Modular & Separate)
// Each integration lives in its own segment to prevent code intertwining

// Phase 1: Web Search Integration
const WEB_SEARCH_CONFIG = {
  enabled: FEATURES.webSearch,
  provider: 'bing',
  apiKey: process.env.BING_SEARCH_API_KEY,
  endpoint: process.env.BING_SEARCH_ENDPOINT || 'https://api.bing.microsoft.com/v7.0/search',
  maxResults: 5,
  safeSearch: 'Moderate'
};

// Phase 2: Real-time Data Integration  
const REAL_TIME_DATA_CONFIG = {
  enabled: FEATURES.realTimeData,
  sources: {
    sports: {
      provider: 'espn',
      apiKey: process.env.ESPN_API_KEY,
      endpoint: process.env.ESPN_API_ENDPOINT
    },
    news: {
      provider: 'newsapi',
      apiKey: process.env.NEWS_API_KEY,
      endpoint: process.env.NEWS_API_ENDPOINT
    },
    weather: {
      provider: 'openweather',
      apiKey: process.env.WEATHER_API_KEY,
      endpoint: process.env.WEATHER_API_ENDPOINT
    }
  }
};

// Phase 3: College Football Integration
const COLLEGE_FOOTBALL_CONFIG = {
  enabled: FEATURES.collegeFootball,
  sources: {
    collegeCFB: {
      provider: 'collegefootballdata',
      apiKey: process.env.CFB_DATA_API_KEY,
      endpoint: process.env.CFB_DATA_ENDPOINT
    },
    espnCollege: {
      provider: 'espn_college',
      endpoint: process.env.ESPN_COLLEGE_ENDPOINT
    }
  },
  conferences: ['SEC', 'Big Ten', 'ACC', 'Big 12', 'Pac-12'],
  favoriteTeams: process.env.FAVORITE_TEAMS?.split(',') || []
};

console.log('🔧 Integration configs loaded:');
console.log(`   🔍 Web Search: ${WEB_SEARCH_CONFIG.enabled ? '✅' : '❌'}`);
console.log(`   📊 Real-time Data: ${REAL_TIME_DATA_CONFIG.enabled ? '✅' : '❌'}`);
console.log(`   🏈 College Football: ${COLLEGE_FOOTBALL_CONFIG.enabled ? '✅' : '❌'}`);

// 🔍 PHASE 1: INTELLIGENT WEB SEARCH INTEGRATION
class WebSearchIntegration {
  constructor() {
    this.config = WEB_SEARCH_CONFIG;
    this.isAvailable = this.config.enabled && this.config.apiKey;
    if (this.isAvailable) {
      console.log('🔍 Intelligent Web Search integration initialized');
    }
  }

  // Intelligent decision engine - determines if web search is needed
  shouldSearchWeb(message, context = {}) {
    if (!this.isAvailable) return false;

    const content = message.toLowerCase();
    
    // Time-sensitive keywords that likely need current information
    const timeSensitiveKeywords = [
      'latest', 'recent', 'current', 'today', 'yesterday', 'this week', 'now',
      'breaking', 'news', 'update', 'happened', 'score', 'result', 'winner',
      'rankings', 'standings', 'schedule', 'injury report', 'transfer portal',
      'recruiting', 'coaching changes', 'playoff', 'bowl games'
    ];

    // Current events and real-time data requests
    const realTimeIndicators = [
      'who won', 'what happened', 'final score', 'game result', 'live score',
      'injury update', 'roster changes', 'coaching news', 'transfer news',
      'recruitment', 'commit', 'decommit', 'portal', 'draft', 'nfl'
    ];

    // Questions that likely need factual verification
    const factualQuestions = [
      'what is', 'who is', 'when did', 'where is', 'how many', 'did they',
      'has he', 'have they', 'is it true', 'fact check', 'verify'
    ];

    // College football specific real-time needs
    const cfbRealTime = [
      'college football playoff', 'cfp', 'sec championship', 'big ten championship',
      'heisman', 'all american', 'coach of the year', 'bowl selection',
      'conference standings', 'playoff rankings', 'ap poll', 'coaches poll'
    ];

    // Check for time-sensitive content
    const hasTimeSensitive = timeSensitiveKeywords.some(keyword => content.includes(keyword));
    const hasRealTime = realTimeIndicators.some(indicator => content.includes(indicator));
    const hasFactual = factualQuestions.some(question => content.includes(question));
    const hasCFBRealTime = cfbRealTime.some(term => content.includes(term));

    // Scoring system for search necessity
    let searchScore = 0;
    if (hasTimeSensitive) searchScore += 3;
    if (hasRealTime) searchScore += 4;
    if (hasFactual) searchScore += 2;
    if (hasCFBRealTime) searchScore += 3;

    // Additional context scoring
    if (content.includes('?')) searchScore += 1; // Questions more likely to need search
    if (content.length > 50) searchScore += 1; // Longer queries often need real data

    // Decision threshold
    const shouldSearch = searchScore >= 3;

    if (FEATURES.enhancedLogging && shouldSearch) {
      console.log(`🧠 Web search decision: YES (score: ${searchScore})`);
      console.log(`   Time-sensitive: ${hasTimeSensitive}, Real-time: ${hasRealTime}, Factual: ${hasFactual}, CFB: ${hasCFBRealTime}`);
    }

    return shouldSearch;
  }

  // Extract optimal search query from user message
  extractSearchQuery(message) {
    const content = message.toLowerCase();
    
    // Remove conversational elements and extract core query
    const cleanQuery = content
      .replace(/^(hey scout|scout|hi|hello|yo)\s*[,:]?\s*/i, '')
      .replace(/\b(please|can you|could you|would you|tell me|let me know)\b/gi, '')
      .replace(/\b(about|regarding|concerning)\b/gi, '')
      .replace(/[?!.]+$/, '')
      .trim();

    // For college football, enhance the query with relevant context
    if (this.isCFBRelated(content)) {
      return this.enhanceCFBQuery(cleanQuery);
    }

    return cleanQuery || message; // Fallback to original if cleaning went too far
  }

  isCFBRelated(content) {
    const cfbTerms = [
      'college football', 'cfb', 'ncaa football', 'sec', 'big ten', 'acc', 'big 12', 'pac-12',
      'alabama', 'georgia', 'texas', 'michigan', 'ohio state', 'clemson', 'notre dame',
      'heisman', 'playoff', 'bowl game', 'championship', 'recruiting', 'transfer portal'
    ];
    return cfbTerms.some(term => content.includes(term));
  }

  enhanceCFBQuery(query) {
    // Add college football context to improve search results
    if (!query.includes('college football') && !query.includes('cfb')) {
      return `${query} college football 2025`;
    }
    return query;
  }

  async searchWeb(query, options = {}) {
    if (!this.isAvailable) {
      return { error: 'Web search not available', results: [] };
    }

    try {
      const searchParams = new URLSearchParams({
        q: query,
        count: options.maxResults || 8, // Get more results for ranking
        safeSearch: options.safeSearch || this.config.safeSearch,
        responseFilter: 'webPages',
        textFormat: 'Raw'
      });

      const response = await axios.get(`${this.config.endpoint}?${searchParams}`, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.apiKey,
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      const data = response.data;
      const rawResults = data.webPages?.value || [];

      // Apply intelligent ranking
      const rankedResults = this.rankSearchResults(rawResults, query);

      return {
        success: true,
        query: query,
        results: rankedResults,
        totalResults: data.webPages?.totalEstimatedMatches || 0
      };

    } catch (error) {
      console.error('🔍 Web search error:', error);
      return { 
        error: `Search failed: ${error.message}`, 
        results: [] 
      };
    }
  }

  // Intelligent result ranking system
  rankSearchResults(results, originalQuery) {
    const queryTerms = originalQuery.toLowerCase().split(' ').filter(term => term.length > 2);
    
    return results.map(result => {
      let relevanceScore = 0;
      const title = result.name?.toLowerCase() || '';
      const snippet = result.snippet?.toLowerCase() || '';
      const url = result.url?.toLowerCase() || '';

      // Scoring factors
      queryTerms.forEach(term => {
        // Title matches (highest weight)
        if (title.includes(term)) relevanceScore += 5;
        
        // Snippet matches (medium weight)
        if (snippet.includes(term)) relevanceScore += 3;
        
        // URL matches (lower weight)
        if (url.includes(term)) relevanceScore += 1;
      });

      // Bonus for authoritative sources
      const authoritativeDomains = [
        'espn.com', 'sports.yahoo.com', 'si.com', 'bleacherreport.com',
        'cbssports.com', 'foxsports.com', 'nfl.com', 'ncaa.com',
        'sec.com', 'bigten.org', 'acc.org', 'big12sports.com'
      ];
      
      if (authoritativeDomains.some(domain => url.includes(domain))) {
        relevanceScore += 4;
      }

      // Bonus for recent content indicators
      const recentIndicators = ['2025', '2024', 'latest', 'breaking', 'update'];
      if (recentIndicators.some(indicator => title.includes(indicator) || snippet.includes(indicator))) {
        relevanceScore += 2;
      }

      return {
        ...result,
        relevanceScore,
        title: result.name,
        snippet: result.snippet
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3); // Return top 3 most relevant results
  }

  // Format search results for Scout's response
  formatSearchResults(searchResponse, integrateWithResponse = true) {
    if (searchResponse.error) {
      return null; // Let Scout handle without search results
    }

    if (!searchResponse.results || searchResponse.results.length === 0) {
      return null; // No results found, let Scout respond normally
    }

    const topResults = searchResponse.results.slice(0, 3);
    let formattedInfo = '';

    topResults.forEach((result, index) => {
      formattedInfo += `**${result.title}**\n${result.snippet}\n`;
      if (index < topResults.length - 1) formattedInfo += '\n';
    });

    return {
      searchInfo: formattedInfo,
      sources: topResults.map(r => r.url),
      query: searchResponse.query
    };
  }
}

// 📊 PHASE 2: REAL-TIME DATA INTEGRATION HANDLERS (Coming Soon)
class RealTimeDataIntegration {
  constructor() {
    this.config = REAL_TIME_DATA_CONFIG;
    this.isAvailable = this.config.enabled;
    // Implementation will be added in Phase 2
  }
}

// 🏈 PHASE 3: COLLEGE FOOTBALL INTEGRATION HANDLERS (Coming Soon)  
class CollegeFootballIntegration {
  constructor() {
    this.config = COLLEGE_FOOTBALL_CONFIG;
    this.isAvailable = this.config.enabled;
    // Implementation will be added in Phase 3
  }
}

// Initialize integration modules
const webSearch = new WebSearchIntegration();
const realTimeData = new RealTimeDataIntegration();
const collegeFootball = new CollegeFootballIntegration();

// WhatsApp-style Message Monitor with Optional Resilience Features
class WhatsAppMonitor {
  constructor(client) {
    this.client = client;
    this.lastResponse = null;
    this.responseCount = 0;
    this.cooldownUntil = 0;
    this.maxResponsesPerHour = 50;
    this.cooldownSeconds = 3;
    
    // Resilience features (enabled by feature flag)
    if (FEATURES.connectionResilience) {
      this.consecutiveErrors = 0;
      this.maxConsecutiveErrors = 3;
      console.log('🛡️ WhatsApp monitoring with enhanced error handling enabled');
    }
    
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
      
      // Enhanced error checking (feature flag)
      if (FEATURES.connectionResilience && this.consecutiveErrors >= this.maxConsecutiveErrors) {
        if (FEATURES.enhancedLogging) {
          console.warn(`⚠️ In error recovery mode (${this.consecutiveErrors} consecutive errors)`);
        }
        return;
      }
      
      const content = message.content.toLowerCase();
      const shouldRespond = this.shouldRespond(content);
      
      if (shouldRespond) {
        if (FEATURES.enhancedLogging) {
          console.log(`👂 WhatsApp trigger detected: "${message.content}"`);
        }
        
        try {
          if (FEATURES.connectionResilience) {
            // Enhanced version with timeouts
            await this.handleResponseWithResilience(message);
          } else {
            // Standard version (current production behavior)
            await this.handleResponseStandard(message);
          }
          
          // Reset error counter on success (resilience feature)
          if (FEATURES.connectionResilience) {
            this.consecutiveErrors = 0;
          }
          
        } catch (error) {
          if (FEATURES.connectionResilience) {
            this.handleResponseError(error, message);
          } else {
            // Standard error handling
            console.error('❌ WhatsApp response error:', error);
            await this.sendFallbackResponse(message);
          }
        }
      }
    });
    
    // Reset hourly counter
    setInterval(() => {
      this.responseCount = 0;
      if (FEATURES.enhancedLogging) {
        console.log('🔄 WhatsApp monitoring: Hourly counter reset');
      }
    }, 3600000);
  }
  
  async handleResponseStandard(message) {
    // Show typing indicator
    await message.channel.sendTyping();
    
    // Get AI response
    const response = await this.getAIResponse(message.content, message.author.displayName);
    
    // Reply to the message
    await message.reply(response);
    
    // Update tracking
    this.lastResponse = Date.now();
    this.responseCount++;
    this.cooldownUntil = Date.now() + (this.cooldownSeconds * 1000);
    
    if (FEATURES.enhancedLogging) {
      console.log(`✅ WhatsApp AI response sent! (${this.responseCount}/${this.maxResponsesPerHour} this hour)`);
    }
  }
  
  async handleResponseWithResilience(message) {
    // Show typing indicator with timeout
    const typingPromise = message.channel.sendTyping();
    const typingTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Typing timeout')), 5000)
    );
    await Promise.race([typingPromise, typingTimeout]);
    
    // Get AI response with timeout
    const responsePromise = this.getAIResponse(message.content, message.author.displayName);
    const aiTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI response timeout')), 15000)
    );
    const response = await Promise.race([responsePromise, aiTimeout]);
    
    // Reply with timeout
    const replyPromise = message.reply(response);
    const replyTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Reply timeout')), 10000)
    );
    await Promise.race([replyPromise, replyTimeout]);
    
    // Update tracking
    this.lastResponse = Date.now();
    this.responseCount++;
    this.cooldownUntil = Date.now() + (this.cooldownSeconds * 1000);
    
    if (FEATURES.enhancedLogging) {
      console.log(`✅ WhatsApp AI response sent with resilience! (${this.responseCount}/${this.maxResponsesPerHour} this hour)`);
    }
  }
  
  handleResponseError(error, message) {
    this.consecutiveErrors++;
    console.error(`❌ WhatsApp response error (${this.consecutiveErrors}/${this.maxConsecutiveErrors}):`, error.message);
    
    // Try fallback if not too many errors
    if (this.consecutiveErrors < this.maxConsecutiveErrors) {
      this.sendFallbackResponse(message);
    } else {
      console.warn(`🛑 Too many consecutive errors, entering recovery mode for 5 minutes`);
      setTimeout(() => {
        this.consecutiveErrors = 0;
        console.log(`🔄 Error recovery mode ended, resuming normal operation`);
      }, 300000); // 5 minutes
    }
  }
  
  async sendFallbackResponse(message) {
    try {
      const fallbackResponse = this.getFallbackResponse();
      await message.reply(fallbackResponse);
      
      this.lastResponse = Date.now();
      this.responseCount++;
      this.cooldownUntil = Date.now() + (this.cooldownSeconds * 1000);
      
      if (FEATURES.enhancedLogging) {
        console.log(`⚠️ Fallback response sent due to AI error`);
      }
    } catch (fallbackError) {
      console.error('❌ Even fallback failed:', fallbackError);
    }
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
      // Phase 1: Intelligent Web Search Integration
      let searchContext = '';
      let searchSources = [];
      
      if (FEATURES.webSearch && webSearch.shouldSearchWeb(message)) {
        if (FEATURES.enhancedLogging) {
          console.log('🧠 AI determined web search is needed');
        }
        
        const searchQuery = webSearch.extractSearchQuery(message);
        const searchResponse = await webSearch.searchWeb(searchQuery);
        const searchResults = webSearch.formatSearchResults(searchResponse);
        
        if (searchResults) {
          searchContext = `\n\nCURRENT WEB INFORMATION for "${searchQuery}":\n${searchResults.searchInfo}`;
          searchSources = searchResults.sources;
          
          if (FEATURES.enhancedLogging) {
            console.log(`🔍 Web search completed: ${searchResponse.results?.length || 0} results integrated`);
          }
        }
      }

      const completion = await openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT,
        messages: [
          {
            role: "system",
            content: `You are Scout, a friendly college football enthusiast who loves chatting about CFB in Discord. You're responding naturally in a group chat like WhatsApp - keep it casual, fun, and friend-like. Use emojis, be enthusiastic about college football, and respond as if you're just hanging out with friends.

IMPORTANT: If you receive current web information, integrate it naturally into your response without explicitly mentioning "web search" or "I searched." Present the information as if you naturally know it. Keep responses concise (1-3 sentences max for casual chat, longer if detailed analysis is requested).

The user's name is ${userName}.${searchContext}`
          },
          {
            role: "user", 
            content: message
          }
        ],
        max_tokens: searchContext ? 250 : 150, // More tokens when we have search context
        temperature: 0.8
      });
      
      let response = completion.choices[0].message.content.trim();
      
      // If we used web search and have authoritative sources, subtly reference them
      if (searchSources.length > 0 && response.length > 100) {
        const hasNewsSource = searchSources.some(url => 
          url.includes('espn.com') || url.includes('sports.yahoo.com') || 
          url.includes('si.com') || url.includes('cbssports.com')
        );
        
        if (hasNewsSource && !response.includes('📰') && !response.includes('🔗')) {
          response += ' 📰';
        }
      }
      
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
    const baseStats = {
      lastResponse: this.lastResponse ? new Date(this.lastResponse).toLocaleTimeString() : 'Never',
      hourlyResponses: this.responseCount,
      maxPerHour: this.maxResponsesPerHour,
      cooldownRemaining: Math.max(0, this.cooldownUntil - Date.now()),
      cooldownSeconds: this.cooldownSeconds,
      features: {
        resilience: FEATURES.connectionResilience,
        debugging: FEATURES.debugMode,
        testing: FEATURES.testingMode
      }
    };
    
    // Add resilience stats if feature is enabled
    if (FEATURES.connectionResilience) {
      baseStats.consecutiveErrors = this.consecutiveErrors || 0;
      baseStats.errorRecoveryMode = (this.consecutiveErrors || 0) >= this.maxConsecutiveErrors;
    }
    
    return baseStats;
  }
}

// Create Discord client with optional enhancements
const clientConfig = { 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
};

// Enhanced client config for resilience features
if (FEATURES.connectionResilience) {
  clientConfig.ws = {
    properties: {
      browser: 'scout-cfb-bot'
    }
  };
  console.log('🔧 Discord client configured with enhanced WebSocket properties');
}

const client = new Client(clientConfig);

// Initialize connection manager and WhatsApp monitor
let connectionManager;
let whatsappMonitor;

// Enhanced slash commands with feature-specific commands
const baseCommands = [
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
];

// Add feature-specific commands
if (FEATURES.connectionResilience) {
  baseCommands.push(
    new SlashCommandBuilder()
      .setName('connection')
      .setDescription('Check Scout\'s connection status and health')
  );
}

if (FEATURES.debugMode || FEATURES.testingMode) {
  baseCommands.push(
    new SlashCommandBuilder()
      .setName('features')
      .setDescription('Show current feature flag status')
  );
}

const commands = baseCommands.map(cmd => cmd.toJSON());

// Register commands with optional retry logic
async function registerCommands() {
  const maxRetries = FEATURES.connectionResilience ? 3 : 1;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (FEATURES.enhancedLogging) {
        console.log(`📝 Registering commands (attempt ${attempt}/${maxRetries})...`);
      } else {
        console.log('📝 Registering commands...');
      }
      
      const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      
      console.log('✅ Commands registered');
      return;
      
    } catch (error) {
      console.error(`❌ Command registration attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) throw error;
      
      if (FEATURES.connectionResilience) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
      }
    }
  }
}

// When Scout is ready (using clientReady for Discord.js v14+)
client.once('clientReady', () => {
  console.log(`✅ Scout is ONLINE! Logged in as ${client.user.tag}`);
  console.log(`🏰 Connected to ${client.guilds.cache.size} servers`);
  
  if (FEATURES.enhancedLogging) {
    console.log(`📡 WebSocket ping: ${client.ws.ping}ms`);
    client.guilds.cache.forEach(guild => {
      console.log(`📍 Server: ${guild.name} (ID: ${guild.id})`);
    });
  }
  
  // Initialize connection manager (feature flag)
  if (FEATURES.connectionResilience && ScoutConnectionManager) {
    connectionManager = new ScoutConnectionManager(client);
    console.log('🛡️ Connection resilience manager active');
  }
  
  // Initialize WhatsApp-style monitoring
  whatsappMonitor = new WhatsAppMonitor(client);
  console.log('👂 WhatsApp-style monitoring ACTIVE!');
  console.log('💬 Just mention "Scout" or ask football questions naturally!');
  
  // Feature status summary
  if (FEATURES.debugMode || FEATURES.testingMode) {
    console.log('🎯 Feature flags status:');
    Object.entries(FEATURES).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        console.log(`   ${key}: ${value ? '✅ ON' : '❌ OFF'}`);
      }
    });
  }
});

// Handle slash commands with optional enhancements
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (FEATURES.enhancedLogging) {
    console.log(`📢 Command: ${interaction.commandName} from ${interaction.user.tag}`);
  } else {
    console.log(`📢 Command: ${interaction.commandName}`);
  }

  try {
    if (interaction.commandName === 'ping') {
      const pingInfo = FEATURES.enhancedLogging ? `\n🏓 Ping: ${client.ws.ping}ms` : '';
      await interaction.reply(`💚 Scout reporting for duty! Ready to talk college football! 🏈${pingInfo}`);
    }

    if (interaction.commandName === 'kickoff') {
      const betaNotice = FEATURES.testingMode ? '\n\n🧪 **Beta Testing Mode Active** - You\'re seeing new features!' : '';
      await interaction.reply(
        `🏈 **Welcome to Scout with WhatsApp-style monitoring!**\n\n` +
        `I'm your college football companion, ready to chat about games, teams, and everything CFB!\n\n` +
        `**Two ways to chat with me:**\n` +
        `• Use \`/scout\` commands\n` +
        `• Just mention "Scout" or ask football questions naturally in chat!\n\n` +
        `Try saying: "Scout, what do you think about college football?" 🌟${betaNotice}`
      );
    }

    if (interaction.commandName === 'monitoring') {
      const stats = whatsappMonitor?.getStats() || { error: 'Not initialized' };
      
      let statusText = '✅ ACTIVE';
      if (FEATURES.connectionResilience && stats.errorRecoveryMode) {
        statusText = '🔄 Recovery Mode';
      }
      if (FEATURES.testingMode) {
        statusText += ' (Testing)';
      }
      
      const resilienceInfo = FEATURES.connectionResilience ? 
        `**Consecutive Errors:** ${stats.consecutiveErrors || 0}\n` : '';
        
      const featureInfo = FEATURES.debugMode ? 
        `**Features:** Resilience: ${stats.features?.resilience ? 'ON' : 'OFF'}, Debug: ${stats.features?.debugging ? 'ON' : 'OFF'}\n` : '';
      
      await interaction.reply(
        `📊 **WhatsApp-Style Monitoring Status:**\n\n` +
        `**Status:** ${statusText}\n` +
        `**Last Response:** ${stats.lastResponse}\n` +
        `**Responses This Hour:** ${stats.hourlyResponses}/${stats.maxPerHour}\n` +
        `**Cooldown:** ${Math.ceil((stats.cooldownRemaining || 0) / 1000)}s\n` +
        `${resilienceInfo}${featureInfo}\n` +
        `**Natural Triggers:**\n` +
        `• "Scout" mentions\n` +
        `• "Who's winning?" / "Thoughts?"\n` +
        `• College football keywords\n\n` +
        `💬 Just chat naturally - I'll join in!`
      );
    }

    // Feature-specific commands
    if (interaction.commandName === 'connection' && FEATURES.connectionResilience) {
      const connStatus = connectionManager?.getConnectionStatus() || { status: 'unknown' };
      const uptime = connStatus.uptime ? Math.floor(connStatus.uptime / 1000 / 60) : 0;
      
      await interaction.reply(
        `🔌 **Scout Connection Status:**\n\n` +
        `**Status:** ${connStatus.status === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}\n` +
        `**Uptime:** ${uptime} minutes\n` +
        `**Ping:** ${connStatus.ping || client.ws.ping || 'N/A'}ms\n` +
        `**Reconnect Attempts:** ${connStatus.reconnectAttempts || 0}\n` +
        `**Is Reconnecting:** ${connStatus.isReconnecting ? 'Yes' : 'No'}\n` +
        `**Feature Status:** Resilience ${FEATURES.connectionResilience ? '✅' : '❌'}\n\n` +
        `${connStatus.status === 'connected' ? '✅ All systems operational!' : '⚠️ Connection issues detected'}`
      );
    }

    if (interaction.commandName === 'features' && (FEATURES.debugMode || FEATURES.testingMode)) {
      const featureList = Object.entries(FEATURES)
        .map(([key, value]) => {
          if (typeof value === 'boolean') {
            return `**${key}:** ${value ? '✅ Enabled' : '❌ Disabled'}`;
          } else {
            return `**${key}:** \`${value}\``;
          }
        })
        .join('\n');
        
      await interaction.reply(
        `🎯 **Scout Feature Flags Status:**\n\n` +
        `${featureList}\n\n` +
        `💡 Features can be toggled via environment variables in Azure App Service configuration.`
      );
    }

    if (interaction.commandName === 'scout') {
      await interaction.deferReply();
      const prompt = interaction.options.getString('prompt');
      
      if (FEATURES.enhancedLogging) {
        console.log(`🎯 Scout command: "${prompt}"`);
      }
      
      try {
        if (FEATURES.connectionResilience) {
          // Enhanced AI call with timeout protection
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
          
        } else {
          // Standard AI call (current production behavior)
          const completion = await openai.chat.completions.create({
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
          
          const response = completion.choices[0].message.content.trim();
          await interaction.editReply(response);
        }
        
        if (FEATURES.enhancedLogging) {
          console.log(`✅ AI slash command response sent`);
        }
        
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

// Enhanced error handling with feature flags
if (FEATURES.connectionResilience) {
  process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
  });

  process.on('uncaughtException', (error) => {
    console.error('💀 Uncaught exception:', error);
    process.exit(1);
  });

  // Graceful shutdown handlers
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
} else {
  // Standard error handling
  client.on('error', (error) => {
    console.error('❌ Discord client error:', error);
  });

  process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
  });
}

// Environment check
console.log('📊 Environment check:');
console.log('- DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? 'Set ✅' : 'Missing ❌');
console.log('- CLIENT_ID:', process.env.CLIENT_ID ? 'Set ✅' : 'Missing ❌');
console.log('- GUILD_ID:', process.env.GUILD_ID ? 'Set ✅' : 'Missing ❌');
console.log('- AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT ? 'Set ✅' : 'Missing ❌');
console.log('- AZURE_OPENAI_API_KEY:', process.env.AZURE_OPENAI_API_KEY ? 'Set ✅' : 'Missing ❌');
console.log('- AZURE_OPENAI_DEPLOYMENT:', process.env.AZURE_OPENAI_DEPLOYMENT ? 'Set ✅' : 'Missing ❌');

// Start Scout with enhanced error handling
console.log('🔑 Starting Scout with feature flags...');
registerCommands()
  .then(() => {
    if (FEATURES.enhancedLogging) {
      console.log('🚀 Logging into Discord...');
    }
    return client.login(process.env.DISCORD_TOKEN);
  })
  .catch(error => {
    console.error('❌ Failed to start Scout:', error);
    process.exit(1);
  });

// Optional health check endpoint (feature flag)
if (FEATURES.healthEndpoint && (process.env.NODE_ENV === 'production' || FEATURES.testingMode)) {
  const http = require('http');
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      const status = client.readyAt ? 200 : 503;
      const health = {
        status: client.readyAt ? 'healthy' : 'unhealthy',
        uptime: client.uptime,
        ping: client.ws.ping,
        guilds: client.guilds.cache.size,
        features: FEATURES,
        monitoring: whatsappMonitor?.getStats() || null,
        connection: connectionManager?.getConnectionStatus() || null
      };
      
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(health, null, 2));
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
