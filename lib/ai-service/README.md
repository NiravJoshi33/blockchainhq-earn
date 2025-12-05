# AI Skill Matching Service

An intelligent AI-powered service that matches blockchain opportunities with suitable candidates and notifies them via Telegram.

## Features

- 🤖 **AI-Powered Matching**: Uses OpenAI's GPT-4 to analyze candidate profiles and opportunity requirements
- 🎯 **Smart Scoring**: Calculates match scores (0-100) based on skills, experience, and opportunity type
- 📱 **Telegram Integration**: Sends personalized notifications to matched candidates
- 🔍 **Advanced Filtering**: Query candidates by skills, experience level, and more
- 📊 **Detailed Analytics**: Get insights into match quality and reasoning

## 📊 How AI Scoring Works

The AI evaluates candidates using **6 key metrics**:

1. **Direct Skill Matches** ⭐⭐⭐⭐⭐ - Exact required skills ("Solidity" = "Solidity")
2. **Related Skills** ⭐⭐⭐⭐ - Complementary tech ("Next.js" relates to "React")
3. **Difficulty Alignment** ⭐⭐⭐⭐ - Experience level fits (Expert for expert role)
4. **Skill Depth** ⭐⭐⭐ - Number + quality of skills
5. **Domain Alignment** ⭐⭐⭐ - Tags/industry match (DeFi for DeFi role)
6. **Opportunity Type** ⭐⭐ - Job/bounty/hackathon fit

**Score Ranges:**

- 90-100: 🔥 Exceptional Match (all skills + perfect alignment)
- 80-89: ⭐ Excellent Match (most skills + good alignment)
- 70-79: ✨ Strong Match (several skills + acceptable fit) ← **Default threshold**
- 60-69: 💫 Good Match (some skills + transferable)
- 0-59: ❌ Filtered out

**📖 For detailed metrics explanation, see [METRICS.md](./METRICS.md) or [METRICS-SUMMARY.md](./METRICS-SUMMARY.md)**

## Setup

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_ASSISTANT_ID=asst_your-assistant-id-here  # Optional: Will be auto-created

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here

# Application URL (for opportunity links in notifications)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Or your production URL
```

### 2. Create a Telegram Bot & Set Up Webhooks

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow the instructions
3. Copy the bot token and add it to your `.env.local`
4. Send `/setdescription` to add a description for your bot
5. Deploy your app and set webhook (see below)

**📖 For complete Telegram setup including webhooks, chat ID management, and troubleshooting, see [TELEGRAM-SETUP.md](./TELEGRAM-SETUP.md)**

### 3. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Add it to your `.env.local`

### 4. Add Telegram ID Field to Database

Run this SQL migration in your Supabase database:

```sql
-- Add telegram_id column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS telegram_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_telegram_id
ON users(telegram_id);
```

### 5. How Users Should Add Their Telegram Info

Users can provide their Telegram information in **any of these formats**:

**Option 1: Telegram Username (Recommended)**

```
telegram_id: "username"      // Without @ symbol
telegram_id: "@username"     // With @ symbol (both work!)
```

To find: Open Telegram → Settings → Username (e.g., @johndoe)

**Option 2: Numeric Chat ID**

```
telegram_id: "123456789"     // Pure numeric ID
```

To find:

1. Start a chat with [@userinfobot](https://t.me/userinfobot)
2. It will reply with your numeric ID

**Important:** Users MUST start a chat with your bot before they can receive messages!

**Example SQL to update:**

```sql
UPDATE users
SET telegram_id = 'NJonBlockchain'  -- Just the username, no @ needed
WHERE email = 'user@example.com';
```

## Usage

### Basic Example: Match Candidates for an Opportunity

```typescript
import { matchCandidatesForOpportunity } from "@/lib/ai-service";

// After creating an opportunity
const opportunity = {
  id: "opp-123",
  title: "Smart Contract Developer",
  organization: "Web3 Startup",
  description: "Build DeFi protocols using Solidity",
  type: "job",
  amount: 80000,
  currency: "USD",
  deadline: "2024-12-31T23:59:59Z",
  required_skills: ["Solidity", "Web3.js", "Smart Contracts"],
  tags: ["DeFi", "Ethereum", "Remote"],
  difficulty_level: "intermediate",
};

// Find and notify matching candidates
const result = await matchCandidatesForOpportunity(opportunity, {
  minMatchScore: 70, // Only candidates with 70%+ match
  maxCandidates: 10, // Top 10 candidates
  sendNotifications: true, // Send Telegram notifications
});

console.log(`Found ${result.totalCandidatesFound} potential candidates`);
console.log(`Matched ${result.matchedCandidates.length} candidates`);
console.log(`Sent ${result.notificationsSent} notifications`);
```

### Advanced: Use the Agent Directly

```typescript
import { skillMatchingAgent } from "@/lib/ai-service";

// Get match details for a specific candidate
const match = await skillMatchingAgent.getMatchDetails(
  opportunity,
  "candidate-id-123"
);

if (match) {
  console.log(`Match Score: ${match.matchScore}%`);
  console.log(`Reasoning: ${match.reasoning}`);
  console.log(`Matching Skills: ${match.matchingSkills.join(", ")}`);
  console.log(`Suggested Message: ${match.suggestedMessage}`);
}
```

### Database Queries

```typescript
import {
  getHuntersBySkills,
  getCandidatesWithTelegram,
  searchCandidates,
} from "@/lib/ai-service";

// Get candidates with specific skills
const solanaDevs = await getHuntersBySkills(["Solana", "Rust"]);

// Get candidates who can receive Telegram notifications
const notifiableCandidates = await getCandidatesWithTelegram();

// Advanced search
const candidates = await searchCandidates({
  skills: ["React", "TypeScript"],
  hasTelegram: true,
  hasEmail: true,
});
```

### Send Custom Telegram Notifications

```typescript
import { sendSimpleTelegramMessage } from "@/lib/ai-service";

await sendSimpleTelegramMessage(
  "telegram-user-id",
  "Hello! Check out this new opportunity."
);
```

### Verify Telegram Bot Setup

```typescript
import { verifyTelegramBot } from "@/lib/ai-service";

const verification = await verifyTelegramBot();
if (verification.success) {
  console.log("Bot Info:", verification.botInfo);
} else {
  console.error("Error:", verification.error);
}
```

## API Reference

### Main Functions

#### `matchCandidatesForOpportunity(opportunity, options)`

Finds and optionally notifies suitable candidates for an opportunity.

**Parameters:**

- `opportunity` (object): The opportunity data
- `options` (object, optional):
  - `minMatchScore` (number): Minimum match score (default: 60)
  - `maxCandidates` (number): Maximum candidates to match (default: 20)
  - `sendNotifications` (boolean): Send Telegram notifications (default: false)

**Returns:** `Promise<SkillMatchingResult>`

```typescript
interface SkillMatchingResult {
  opportunityId: string;
  totalCandidatesFound: number;
  matchedCandidates: MatchedCandidate[];
  notificationsSent: number;
}
```

### Types

#### `MatchedCandidate`

```typescript
interface MatchedCandidate {
  candidate: CandidateProfile;
  matchScore: number; // 0-100
  reasoning: string; // AI explanation
  matchingSkills: string[]; // Skills that matched
  suggestedMessage: string; // Personalized outreach
}
```

#### `CandidateProfile`

```typescript
interface CandidateProfile {
  id: string;
  name: string | null;
  email: string | null;
  skills: string[] | null;
  bio: string | null;
  telegram_id: string | null;
  portfolio_url?: string | null;
  github_url?: string | null;
}
```

## Integration Example

### Auto-match when creating an opportunity

```typescript
// In your create opportunity API route or form handler
import { matchCandidatesForOpportunity } from "@/lib/ai-service";

async function handleCreateOpportunity(opportunityData: any) {
  // 1. Save opportunity to database
  const opportunity = await createOpportunityInDB(opportunityData);

  // 2. Find and notify matching candidates (async, don't await)
  matchCandidatesForOpportunity(opportunity, {
    minMatchScore: 70,
    maxCandidates: 15,
    sendNotifications: true,
  }).catch((error) => {
    console.error("Error matching candidates:", error);
  });

  return opportunity;
}
```

## How It Works

1. **Candidate Discovery**: Queries the database for users with the "hunter" role who have relevant skills
2. **AI Analysis**: For each candidate, creates an OpenAI thread and uses the Assistant to:
   - Analyze skill overlap
   - Consider difficulty level alignment
   - Evaluate opportunity type relevance
   - Calculate a match score (0-100)
   - Generate personalized outreach message
3. **Ranking**: Sorts candidates by match score
4. **Filtering**: Applies minimum score threshold and max candidate limit
5. **Notification**: Sends rich Telegram messages to matched candidates with:
   - Opportunity details
   - Match score and reasoning
   - Personalized message
   - Direct link to apply

## Telegram Message Format

Candidates receive beautifully formatted messages like:

```
🎯 New Opportunity Match! ⭐

Smart Contract Developer
Web3 Startup

Your Solidity and Web3.js experience makes you a great fit for this role! The team is looking for someone with your exact skill set to help build their DeFi protocol.

💰 Reward: 80000 USD
📊 Match Score: 85%
📅 Deadline: Dec 31, 2024 (30 days)
🏷️ Type: Job

Build DeFi protocols using Solidity and integrate with Ethereum blockchain...

🔗 View & Apply: https://blockchainhq.com/opportunities/opp-123

This opportunity was matched to your skills using AI. Good luck! 🚀
```

## Best Practices

1. **Async Processing**: Don't block the UI waiting for matches. Run matching in the background.
2. **Rate Limiting**: The service includes built-in rate limiting for Telegram (100ms between messages)
3. **Error Handling**: Wrap calls in try-catch and handle failures gracefully
4. **Minimum Scores**: Use appropriate minimum match scores (60-70 for broad matching, 80+ for high precision)
5. **Testing**: Test with `sendNotifications: false` before sending real notifications
6. **Privacy**: Only send to candidates who have provided their Telegram ID

## Troubleshooting

### "OPENAI_API_KEY not found"

Add your OpenAI API key to `.env.local`

### "TELEGRAM_BOT_TOKEN not set"

Create a bot with @BotFather and add the token to `.env.local`

### "No candidates found"

- Check that users have the "hunter" role in the database
- Ensure candidates have skills listed in their profiles
- Try broader skill matching terms

### Telegram notifications not arriving

- Verify bot token with `verifyTelegramBot()`
- Ensure candidates have `telegram_id` set in the database
- Check that candidates have started a conversation with your bot

## License

MIT
