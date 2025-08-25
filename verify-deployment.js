// Deployment Verification Script
console.log('🔍 Scout Deployment Verification');
console.log('================================');
console.log();

console.log('📊 Environment Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('- DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? 'Set ✅' : 'Missing ❌');
console.log('- CLIENT_ID:', process.env.CLIENT_ID ? 'Set ✅' : 'Missing ❌');
console.log('- GUILD_ID:', process.env.GUILD_ID ? 'Set ✅' : 'Missing ❌');
console.log();

console.log('📦 Package Information:');
const package = require('./package.json');
console.log('- Name:', package.name);
console.log('- Version:', package.version);
console.log('- Main:', package.main);
console.log('- Start Script:', package.scripts.start);
console.log();

console.log('📁 File Check:');
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'index.js',
  'package.json',
  '.env',
  'src/index.js'
];

filesToCheck.forEach(file => {
  try {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`- ${file}:`, exists ? 'Exists ✅' : 'Missing ❌');
    
    if (exists && file === 'index.js') {
      const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
      const lines = content.split('\n').length;
      console.log(`  Lines: ${lines}`);
      console.log(`  Contains "Starting Scout Discord Bot":`, content.includes('Starting Scout Discord Bot') ? 'Yes ✅' : 'No ❌');
    }
  } catch (error) {
    console.log(`- ${file}: Error checking (${error.message})`);
  }
});

console.log();
console.log('🕒 Timestamp:', new Date().toISOString());
console.log('🚀 Ready for Azure deployment verification!');
