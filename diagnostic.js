// Load environment variables
require('dotenv').config();

console.log('🚀 DIAGNOSTIC STARTING - Azure App Service Debug');
console.log('='.repeat(50));

// Diagnostic script for Azure App Service
console.log('🔍 DIAGNOSTIC: Environment Variables Check');
console.log('==========================================');
console.log('DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? `Set (${process.env.DISCORD_TOKEN.length} chars)` : 'MISSING ❌');
console.log('CLIENT_ID:', process.env.CLIENT_ID || 'MISSING ❌');
console.log('GUILD_ID:', process.env.GUILD_ID || 'MISSING ❌');
console.log('==========================================');
console.log('Extra variables:');
console.log('AZURE_OPENAI_API_KEY:', process.env.AZURE_OPENAI_API_KEY ? 'Set' : 'Not set');
console.log('AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT || 'Not set');
console.log('AZURE_OPENAI_DEPLOYMENT:', process.env.AZURE_OPENAI_DEPLOYMENT || 'Not set');
console.log('PORT:', process.env.PORT || 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('==========================================');

// Check if all required Discord variables are present
const hasDiscordToken = !!process.env.DISCORD_TOKEN;
const hasClientId = !!process.env.CLIENT_ID;
const hasGuildId = !!process.env.GUILD_ID;

console.log('🎯 DISCORD READINESS CHECK:');
console.log('- All required variables present:', hasDiscordToken && hasClientId && hasGuildId ? '✅ YES' : '❌ NO');

if (!hasDiscordToken || !hasClientId || !hasGuildId) {
  console.log('❌ CRITICAL: Missing Discord environment variables!');
  console.log('📋 Required variables: DISCORD_TOKEN, CLIENT_ID, GUILD_ID');
  console.log('🔧 Please set these in Azure App Service → Settings → Environment variables');
} else {
  console.log('✅ All Discord variables are present - Scout should be able to connect!');
}

console.log('✅ Diagnostic complete - Scout should start normally now');

// Add a simple HTTP server so Azure doesn't think the app crashed
const http = require('http');
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Scout diagnostic running - check logs for environment variables');
});

server.listen(port, () => {
  console.log(`🌐 Diagnostic server listening on port ${port}`);
});
