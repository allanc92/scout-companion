// MINIMAL Scout for Azure - No external dependencies
// This version works without dotenv or personality modules

const { Client, GatewayIntentBits } = require('discord.js');

console.log('🚀 MINIMAL Scout starting...');

// Get environment variables directly (Azure sets these)
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;

if (!DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN not found in environment variables');
  process.exit(1);
}

// Create Discord client
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});

// Simple Azure OpenAI function
async function getSimpleResponse(prompt) {
  if (!AZURE_OPENAI_API_KEY) {
    return "🏈 I'm here and ready to chat about college football! (Azure OpenAI not configured)";
  }

  try {
    const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-01`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_API_KEY
      },
      body: JSON.stringify({
        messages: [
          { 
            role: "system", 
            content: "You are Scout, a college football enthusiast. Keep responses under 100 words and casual." 
          },
          { role: "user", content: prompt }
        ],
        max_completion_tokens: 150
      })
    });

    if (!response.ok) {
      return "🏈 I'm having trouble with my playbook right now, but I'm here!";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "🏈 Ready to talk football!";
  } catch (error) {
    console.error('Azure OpenAI error:', error);
    return "🏈 I'm here and ready to chat about college football!";
  }
}

// WhatsApp-style message monitoring
client.on('messageCreate', async (message) => {
  // Skip bot messages
  if (message.author.bot) return;
  
  const content = message.content.toLowerCase();
  console.log(`📨 Message: "${content}" from ${message.author.username}`);
  
  // Check for triggers
  const shouldRespond = content.includes('scout') || 
                       content.includes('who\'s winning') ||
                       content.includes('what\'s the score') ||
                       content.includes('thoughts?') ||
                       content.includes('college football');
  
  if (shouldRespond) {
    console.log(`🎯 RESPONDING to: "${message.content}"`);
    
    try {
      await message.channel.sendTyping();
      const response = await getSimpleResponse(message.content);
      await message.reply(response);
      console.log('✅ Response sent');
    } catch (error) {
      console.error('❌ Error responding:', error);
    }
  }
});

// When ready
client.once('ready', () => {
  console.log(`✅ MINIMAL Scout online as ${client.user.tag}`);
  console.log('🎯 WhatsApp monitoring active!');
});

// Error handling
client.on('error', (error) => {
  console.error('Discord error:', error);
});

// Start
client.login(DISCORD_TOKEN)
  .then(() => console.log('🔑 Login successful'))
  .catch(error => {
    console.error('❌ Login failed:', error);
    process.exit(1);
  });
