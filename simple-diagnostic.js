// Ultra-simple diagnostic that won't crash
try {
  console.log('🚀 CRASH-PROOF DIAGNOSTIC STARTING');
  console.log('Node version:', process.version);
  console.log('Platform:', process.platform);
  
  // Check environment variables without requiring anything
  console.log('='.repeat(40));
  console.log('ENVIRONMENT VARIABLES:');
  console.log('DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? `Present (${process.env.DISCORD_TOKEN.length} chars)` : 'MISSING ❌');
  console.log('CLIENT_ID:', process.env.CLIENT_ID ? 'Present' : 'MISSING ❌');
  console.log('GUILD_ID:', process.env.GUILD_ID ? 'Present' : 'MISSING ❌');
  console.log('PORT:', process.env.PORT || 'Not set');
  console.log('='.repeat(40));
  
  const missing = [];
  if (!process.env.DISCORD_TOKEN) missing.push('DISCORD_TOKEN');
  if (!process.env.CLIENT_ID) missing.push('CLIENT_ID');
  if (!process.env.GUILD_ID) missing.push('GUILD_ID');
  
  if (missing.length > 0) {
    console.log('❌ CRITICAL ERROR: Missing environment variables:', missing.join(', '));
    console.log('🔧 FIX: Add these in Azure Portal → App Service → Settings → Environment variables');
  } else {
    console.log('✅ All required environment variables are present!');
  }
  
} catch (error) {
  console.log('❌ Diagnostic crashed:', error.message);
}

// Keep the app alive
console.log('💓 Keeping app alive...');
setInterval(() => {
  console.log('💓 Heartbeat:', new Date().toISOString());
}, 30000);
