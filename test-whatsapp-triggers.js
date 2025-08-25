// WhatsApp Monitoring Test Script
console.log('🧪 Testing WhatsApp Trigger Detection');
console.log('=====================================');

// Simulate the trigger detection logic
function shouldRespond(content) {
  content = content.toLowerCase();
  
  // Direct Scout mentions
  if (content.includes('scout')) {
    return 'Direct Scout mention';
  }
  
  // Football conversation triggers
  const footballTriggers = [
    'who\'s winning', 'who is winning', 'whats the score', 'what\'s the score',
    'thoughts?', 'any thoughts', 'what do you think',
    'college football', 'cfb', 'football game',
    'which team', 'best team', 'favorite team',
    'playoff', 'bowl game', 'championship'
  ];
  
  for (const trigger of footballTriggers) {
    if (content.includes(trigger)) {
      return `Football trigger: "${trigger}"`;
    }
  }
  
  return null;
}

// Test cases
const testMessages = [
  "Scout, what do you think about the game?",
  "Who's winning this weekend?",
  "Any thoughts on college football?",
  "What's the score?",
  "Which team is the best?",
  "Hello everyone!",
  "I love pizza",
  "CFB is awesome",
  "What do you think about the playoff?",
  "Hey scout, how are you?"
];

console.log('\n📝 Test Results:');
console.log('----------------');

testMessages.forEach((message, index) => {
  const result = shouldRespond(message);
  const status = result ? '✅ TRIGGER' : '⚪ NO TRIGGER';
  console.log(`${index + 1}. "${message}"`);
  console.log(`   ${status}${result ? ` (${result})` : ''}`);
  console.log();
});

console.log('🎯 Trigger Summary:');
console.log('- Direct "Scout" mentions = Instant response');
console.log('- Football keywords = Contextual response');
console.log('- Other messages = No response (keeps chat natural)');
console.log();
console.log('✅ Ready for Discord testing!');
