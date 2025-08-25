# Scout Modular Personality System

## Overview

Scout now features a modular personality system that adapts to different contexts and use cases. This makes Scout a more versatile and emotionally intelligent companion for Allan's various needs.

## Architecture

### Core Components

1. **`src/personality/prompts.js`** - System prompts and context detection
2. **`src/personality/profiles.js`** - User profiles and customization
3. **`src/index.js`** - Integration with Discord and Azure OpenAI

### Personality Contexts

Scout can adapt to these contexts automatically or by explicit selection:

#### 🍼 Parenting Support (`parenting`)
- Support for Camila (2.5 years) and Leo (5 months)
- Age-appropriate activities and developmental milestones
- Emotional regulation strategies
- Practical parenting solutions

#### 💚 Emotional Support (`emotional`)
- Deep listening and reflection
- Emotional processing and regulation
- Gentle reframes and perspective shifts
- Safe space for vulnerability

#### 🍎 Snack Curation & Group Logistics (`snacks`)
- Event planning and food curation
- Dietary considerations and preferences
- Creative pairings and presentation
- Shopping lists and prep timelines

#### 🌟 Legacy & Career Documentation (`legacy`)
- Career milestone capture
- Family memory documentation
- Goal setting and vision development
- Reflective wisdom gathering

#### 💬 General Companion (`default`)
- Versatile conversational partner
- Balanced playfulness and depth
- Daily decision support
- Warm, friend-like energy

## Usage

### Discord Commands

- **`/scout [prompt] [context]`** - Ask Scout anything with optional context override
- **`/contexts`** - View all available personality contexts
- **`/ping`** - Health check
- **`/kickoff`** - Morning greeting

### Auto-Context Detection

Scout automatically detects context from keywords in your message:

- **Parenting**: camila, leo, kid, child, parent, toddler, baby, bedtime, tantrum
- **Emotional**: feel, emotion, stress, anxious, sad, happy, overwhelmed, process
- **Snacks**: snack, food, eat, party, meeting, group, plan, cook, recipe
- **Legacy**: career, work, achievement, milestone, goal, vision, legacy, document

### Manual Context Override

Use the `context` parameter in `/scout` to explicitly set the personality:

```
/scout prompt:"How should I handle bedtime?" context:parenting
/scout prompt:"I'm feeling overwhelmed" context:emotional
/scout prompt:"Planning a work meeting" context:snacks
```

## Code Structure

### Function Overview

```javascript
// Core personality functions
buildSystemPrompt(context)     // Builds context-aware system prompt
detectContext(prompt)          // Auto-detects context from keywords
getAvailableContexts()        // Returns all available contexts

// User customization functions  
getUserProfile(userId)         // Gets user preferences and info
customizeResponse(response)    // Applies user-specific customizations
getContextInfo(context)        // Gets context-specific user info
```

### Extension Points

To add new personality contexts:

1. Add to `PERSONALITY_CONTEXTS` in `prompts.js`
2. Update keyword detection in `detectContext()`
3. Add context choice to Discord command in `index.js`
4. Update this README

To customize for new users:

1. Add profile to `USER_PROFILES` in `profiles.js`
2. Implement customization logic in `customizeResponse()`
3. Update `getContextInfo()` for context-specific data

## Examples

### Parenting Context
```
User: "Camila had a huge tantrum at bedtime"
Scout: [Uses parenting personality with toddler-specific advice]
```

### Emotional Context  
```
User: "I'm feeling really overwhelmed today"
Scout: [Uses emotional support personality with validation and coping strategies]
```

### Snacks Context
```
User: "Planning snacks for a work meeting tomorrow"
Scout: [Uses snack curation personality with professional event suggestions]
```

## Technical Notes

- Built on Azure OpenAI gpt-5-chat-scout deployment
- Uses REST API calls (no problematic SDKs)
- Modular design allows easy extension
- Context detection is keyword-based but expandable
- User profiles support future multi-user scenarios

## Future Enhancements

- **Context Memory**: Remember previous context preferences
- **Learning System**: Improve context detection based on usage
- **Multi-User Support**: Expand beyond Allan's profile
- **Context Mixing**: Blend contexts for complex scenarios
- **Analytics**: Track context usage and effectiveness
