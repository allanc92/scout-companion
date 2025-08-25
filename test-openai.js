// Test Azure OpenAI connection
require('dotenv').config();
const { OpenAI } = require('openai');

console.log('🧪 Testing Azure OpenAI connection...');

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
  defaultQuery: { 'api-version': '2024-05-01-preview' },
  defaultHeaders: {
    'api-key': process.env.AZURE_OPENAI_API_KEY,
  },
});

async function testConnection() {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT,
      messages: [
        {
          role: 'user',
          content: 'Test message - just say hello briefly!'
        }
      ],
      max_tokens: 50
    });
    
    console.log('✅ Azure OpenAI working!');
    console.log('Response:', response.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ Azure OpenAI error:', error.message);
  }
}

testConnection();
