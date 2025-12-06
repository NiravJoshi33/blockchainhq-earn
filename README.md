# BlockchainHQ Earn

**BNB Chain x YZi Labs Hack Series: Abu Dhabi**

A decentralized platform connecting blockchain talent with opportunities through AI-powered matching and smart contract-based escrow.

**Hackathon Tracks:** DeFi (Payments & Escrow) | AI (Intelligent Matching) | Regional Impact (UAE Talent Ecosystem)

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Smart Contract](#smart-contract)
- [AI Matching System](#ai-matching-system)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Hackathon Requirements](#hackathon-requirements)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

BlockchainHQ Earn is a comprehensive platform that bridges the gap between blockchain opportunities (jobs, bounties, hackathons) and qualified candidates. It combines decentralized escrow through smart contracts with AI-powered candidate matching and automated Telegram notifications to create a seamless, trustless ecosystem for Web3 work.

**Live Demo:** https://earn.blockchainhq.xyz/

**Demo Video:** [Add video link]

**Presentation Deck:** [Add deck link]

### Submission Artifacts

- **GitHub Repository:** https://github.com/NiravJoshi33/blockchainhq-earn
- **Live Demo:** https://earn.blockchainhq.xyz/
- **Demo Video:** [Add video link]
- **Presentation Deck:** [Add deck link]
- **Tweet:** [Add tweet link with @BNBChain and #BNBHackAbuDhabi]

---

## Problem Statement

The blockchain ecosystem faces critical challenges:

1. **Trust Issues:** Traditional freelance platforms require trusting centralized intermediaries with funds
2. **Inefficient Matching:** Sponsors struggle to find qualified candidates among thousands of profiles
3. **Manual Outreach:** Time-consuming process to notify relevant candidates about new opportunities
4. **Payment Disputes:** Lack of transparent, automated escrow systems for bounty payments
5. **Regional Fragmentation:** Difficulty connecting UAE-based talent with global Web3 opportunities

---

## Solution

BlockchainHQ Earn provides a complete solution through three core components:

### 1. Smart Contract Escrow

Funds are locked in an immutable smart contract deployed on BNB Chain. Winners are automatically paid based on sponsor selection, eliminating payment disputes and ensuring trust.

### 2. AI-Powered Matching

OpenAI GPT-4 analyzes candidate profiles against opportunity requirements, calculating match scores (0-100) based on skills, experience level, domain alignment, and opportunity type. Only top matches (70%+ by default) are notified.

### 3. Automated Notifications

Matched candidates receive personalized Telegram messages with opportunity details, match reasoning, and direct application links, reducing time-to-apply from days to minutes.

---

## Key Features

### For Sponsors

- **Create Opportunities:** Jobs, bounties, hackathons with customizable parameters
- **Smart Contract Escrow:** Lock funds securely on BNB Chain with automatic distribution
- **AI Candidate Discovery:** Get matched with qualified candidates automatically
- **Submission Management:** Review all submissions in one place
- **Flexible Winner Selection:** Choose 1-3 winners with custom prize distribution
- **Refund Protection:** Automatic refund if no suitable submissions

### For Hunters/Candidates

- **AI-Powered Recommendations:** Receive personalized opportunity matches via Telegram
- **Comprehensive Profiles:** Showcase skills, experience, portfolio, and social links
- **One-Click Applications:** Submit work with GitHub, demo links, and project details
- **Transparent Escrow:** See locked funds on-chain before submitting
- **Instant Payments:** Automatic prize distribution through smart contract
- **Multi-Category Support:** Content, Design, Development, Smart Contracts, Social Media, Full Stack

### Platform Features

- **Role-Based Access:** Separate dashboards for sponsors and hunters
- **Wallet Integration:** Seamless Privy authentication with multi-wallet support
- **Network Switching:** Automatic prompts to switch to BNB Chain Testnet
- **Real-Time Stats:** Live opportunity tracking and submission counts
- **Category Filtering:** Browse opportunities by type and category
- **Responsive Design:** Mobile-first, modern UI with dark mode support

---

## Technology Stack

### Blockchain

- **Smart Contracts:** Solidity 0.8.28
- **Deployment:** Hardhat + Hardhat Ignition
- **Network:** BNB Chain Testnet (Chain ID: 97)
- **Wallet Integration:** Privy + Wagmi + Viem
- **Contract Address:** `0x70e2FC2Ff60717aA2B529352f45b13E4AdB84c5A`

### Frontend

- **Framework:** Next.js 16.0.7 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI + Custom Components
- **State Management:** React Query (TanStack)
- **Markdown Rendering:** React Markdown with GitHub Flavored Markdown

### Backend & Services

- **Database:** Supabase (PostgreSQL)
- **AI Engine:** OpenAI GPT-4 with Assistants API
- **Notifications:** Telegram Bot API with Webhook support
- **Authentication:** Privy (Web3 wallet authentication)

### Development Tools

- **Package Manager:** npm/pnpm
- **Type Safety:** TypeScript with strict mode
- **Linting:** ESLint
- **Version Control:** Git

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Sponsors   │  │   Hunters    │  │    Public    │       │
│  │  Dashboard   │  │  Dashboard   │  │   Browse     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Supabase   │    │  BNB Chain   │    │   AI Engine  │
│   Database   │    │   Contract   │    │  (OpenAI)    │
│              │    │              │    │              │
│ • Users      │    │ • Escrow     │    │ • Match      │
│ • Profiles   │    │ • Bounties   │    │   Scoring    │
│ • Apps       │    │ • Payments   │    │ • Reasoning  │
│ • Stats      │    │ • Events     │    │ • Messages   │
└──────────────┘    └──────────────┘    └──────────────┘
        │                                        │
        │                                        ▼
        │                              ┌──────────────┐
        │                              │   Telegram   │
        └─────────────────────────────▶│     Bot      │
                                       └──────────────┘
```

### Data Flow: Creating an Opportunity

1. Sponsor creates opportunity with details and required skills
2. Frontend validates input and stores metadata in Supabase
3. Smart contract transaction locks funds on BNB Chain
4. AI service queries database for candidates with relevant skills
5. OpenAI analyzes each candidate profile against requirements
6. Top matches (70%+ score) are identified
7. Personalized Telegram notifications sent to matched candidates
8. Candidates receive instant notification with application link

### Data Flow: Submitting Work

1. Hunter submits work with links (GitHub, demo, video, etc.)
2. Transaction submitted to smart contract with submission data
3. Contract validates submission and emits event
4. Frontend updates UI showing submission confirmation
5. Sponsor reviews submissions in dashboard
6. Sponsor selects winners through smart contract
7. Contract automatically distributes prizes to winners
8. All participants notified of results

---

## Smart Contract

### Contract Details

**Contract Name:** BlockchainBounty  
**Compiler Version:** Solidity 0.8.28  
**Network:** BNB Chain Testnet (Chain ID: 97)  
**Address:** `0x70e2FC2Ff60717aA2B529352f45b13E4AdB84c5A`  
**License:** UNLICENSED  
**Verified:** [Add BSCScan link]

### Core Functions

#### For Sponsors

```solidity
function createBounty(
    string memory _description,
    uint256 _deadline,
    BountyCategory _category
) external payable
```

Creates a new bounty with locked funds. Funds are held in escrow until winners are selected or bounty is cancelled.

```solidity
function selectWinners(
    uint256 _bountyId,
    uint256[] memory _submissionIds,
    uint8[] memory _ranks,
    uint256[] memory _prizeDistribution
) external onlyBountyCreator(_bountyId) deadlinePassed(_bountyId)
```

Selects 1-3 winners and automatically distributes prizes based on custom percentages (must sum to 100%).

```solidity
function refundBounty(uint256 _bountyId) external
```

Refunds creator if no submissions received after deadline.

```solidity
function cancelBounty(uint256 _bountyId, string memory _reason) external
```

Cancels bounty and refunds creator if not satisfied with submissions (before winner selection).

#### For Hunters

```solidity
function submitWork(
    uint256 _bountyId,
    string memory _submissionLink,
    string memory _tweetLink,
    string memory _githubLink,
    string memory _twitterLink,
    string memory _videoLink,
    string memory _indieFunLink,
    string memory _projectLink
) external bountyIsActive(_bountyId)
```

Submits work for a bounty. Each address can submit once per bounty.

### Security Features

- **Reentrancy Protection:** Uses checks-effects-interactions pattern
- **Access Control:** Modifier-based role verification
- **Deadline Enforcement:** Automated deadline validation
- **Prize Validation:** Ensures distributions sum to 100%
- **Single Submission:** Prevents double submissions per address
- **Immutable Winners:** Winners cannot be changed once selected
- **Automatic Transfers:** Direct prize distribution to winners

### Events

All critical actions emit events for transparency and frontend integration:

- `BountyCreated` - New opportunity created
- `WorkSubmitted` - Candidate submitted work
- `WinnersSelected` - Winners chosen and paid
- `PrizeDistributed` - Individual prize sent
- `BountyClosed` - Bounty finalized
- `BountyCancelled` - Bounty cancelled with reason

### Categories

Six supported bounty categories:

- Content (articles, documentation, educational materials)
- Design (UI/UX, graphics, branding)
- Development (web applications, tools, integrations)
- SmartContract (Solidity development, audits)
- SocialMedia (community management, marketing)
- FullStack (end-to-end project development)

---

## AI Matching System

### How It Works

The AI matching system uses OpenAI's GPT-4 model with a specialized assistant trained for skill evaluation.

**Evaluation Criteria:**

1. **Direct Skill Matches (Highest Weight)**

   - Exact matches between required skills and candidate skills
   - Example: "Solidity" requirement matching "Solidity" in profile

2. **Related Skills**

   - Complementary technologies and frameworks
   - Example: "Next.js" relates to "React", "TypeScript"

3. **Difficulty Alignment**

   - Experience level matches opportunity complexity
   - Levels: Beginner, Intermediate, Advanced, Expert

4. **Skill Depth**

   - Number and quality of relevant skills
   - Breadth vs. depth consideration

5. **Domain Alignment**

   - Industry tags and specialization match
   - Example: DeFi experience for DeFi opportunity

6. **Opportunity Type Fit**
   - Candidate's preference for jobs vs. bounties vs. hackathons
   - Historical performance in similar opportunities

### Match Score Ranges

- **90-100:** Exceptional Match (all required skills + perfect alignment)
- **80-89:** Excellent Match (most required skills + strong alignment)
- **70-79:** Strong Match (several key skills + acceptable fit) - Default threshold
- **60-69:** Good Match (some skills + transferable experience)
- **0-59:** Filtered out (insufficient match)

### Notification Content

Matched candidates receive Telegram messages containing:

- Opportunity title and organization
- Personalized match reasoning (AI-generated)
- Match score percentage
- Reward amount and currency
- Deadline and time remaining
- Opportunity type (job/bounty/hackathon)
- Brief description
- Direct application link
- Matching skills highlighted

### Rate Limiting

- 100ms delay between Telegram messages to respect API limits
- Batch processing of candidates
- Configurable max candidates per opportunity (default: 20)
- Async processing to avoid blocking UI

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account and project
- OpenAI API key
- Telegram Bot token
- BNB Chain Testnet wallet with tBNB

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Privy Wallet Authentication
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Smart Contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0x70e2FC2Ff60717aA2B529352f45b13E4AdB84c5A
NEXT_PUBLIC_CHAIN_ID=97

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_ASSISTANT_ID=asst_your-assistant-id (optional, auto-created)

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/blockchainhq-earn.git
cd blockchainhq-earn

# Install dependencies
npm install
# or
pnpm install

# Run database migrations (see Database Setup section)

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Run the following SQL migrations in your Supabase SQL editor:

```sql
-- Users table with roles
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'hunter', -- 'hunter' or 'sponsor'
  skills TEXT[], -- Array of skills
  experience_level TEXT, -- 'beginner', 'intermediate', 'advanced', 'expert'
  telegram_id TEXT, -- Telegram username or chat ID
  github_url TEXT,
  portfolio_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunities table
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- 'job', 'bounty', 'hackathon'
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  required_skills TEXT[],
  tags TEXT[],
  difficulty_level TEXT,
  category TEXT,
  contract_bounty_id INTEGER, -- Maps to smart contract ID
  sponsor_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'active', -- 'active', 'closed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  submission_link TEXT,
  github_link TEXT,
  twitter_link TEXT,
  video_link TEXT,
  project_link TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  contract_submission_id INTEGER, -- Maps to smart contract submission ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_telegram ON users(telegram_id);
CREATE INDEX idx_opportunities_sponsor ON opportunities(sponsor_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_applications_opportunity ON applications(opportunity_id);
CREATE INDEX idx_applications_user ON applications(user_id);
```

### Smart Contract Deployment

The contract is already deployed to BNB Chain Testnet. To deploy to mainnet or re-deploy:

```bash
# Install Hardhat dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Configure hardhat.config.ts with your private key and RPC URL

# Deploy using Hardhat Ignition
npx hardhat ignition deploy ignition/modules/BlockchainBounty.ts --network bscTestnet

# Verify contract on BSCScan
npx hardhat verify --network bscTestnet <CONTRACT_ADDRESS>
```

### Telegram Bot Setup

1. Create a bot with [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow instructions
3. Copy the bot token to `.env.local`
4. Set webhook for production deployment:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-domain.com/api/telegram/webhook"
```

For detailed setup instructions, see `lib/ai-service/README.md`

---

## Deployment

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

### Contract Deployment

```bash
# Deploy to BNB Chain Mainnet
npx hardhat ignition deploy ignition/modules/BlockchainBounty.ts --network bscMainnet

# Verify on BSCScan
npx hardhat verify --network bscMainnet <CONTRACT_ADDRESS>
```

### Post-Deployment Checklist

- [ ] Verify contract on BSCScan
- [ ] Set Telegram webhook URL
- [ ] Test end-to-end flow on testnet
- [ ] Update contract address in frontend
- [ ] Test AI matching with real profiles
- [ ] Verify Telegram notifications
- [ ] Set up monitoring and error tracking

---

## Screenshots

### Homepage

**[SCREENSHOT PLACEHOLDER: Homepage hero section with CTA buttons]**

### Browse Opportunities

**[SCREENSHOT PLACEHOLDER: Opportunities listing page with filters and cards]**

### Opportunity Detail

**[SCREENSHOT PLACEHOLDER: Individual opportunity page showing description, submissions, and apply button]**

### Sponsor Dashboard

**[SCREENSHOT PLACEHOLDER: Sponsor dashboard showing created opportunities and statistics]**

### Create Opportunity Form

**[SCREENSHOT PLACEHOLDER: Multi-step form for creating bounty with wallet integration]**

### Hunter Dashboard

**[SCREENSHOT PLACEHOLDER: Hunter dashboard with recommended opportunities and profile]**

### Profile Page

**[SCREENSHOT PLACEHOLDER: User profile with skills, bio, and social links]**

### Telegram Notification

**[SCREENSHOT PLACEHOLDER: Example of AI-generated opportunity match notification in Telegram]**

### Smart Contract Interaction

**[SCREENSHOT PLACEHOLDER: Wallet confirmation for submitting work or selecting winners]**

### Winner Selection

**[SCREENSHOT PLACEHOLDER: Modal for selecting winners with prize distribution]**

---

## Hackathon Requirements

### BNB Chain Integration

- **Smart Contract:** Deployed on BNB Chain Testnet at `0x36B1Fb92fD2b62C028Cf2C5A5065f66Ffb6E8689`
- **Transactions:** All bounty creation, submissions, and prize distributions happen on-chain
- **Network:** Supports both BSC Testnet (Chain ID: 97) and Mainnet (Chain ID: 56)
- **Verification:** Contract verified on BSCScan [Add link]

### Open Source

- **License:** MIT
- **Repository:** [Add GitHub link]
- **Documentation:** Comprehensive README and inline code comments
- **Contributing:** Open to community contributions

### Tracks Alignment

**1. DeFi (Primary Track)**

- Escrow and payment system built entirely on smart contracts
- Trustless fund locking and automatic distribution
- Multi-winner prize splitting with custom percentages
- Refund mechanisms for edge cases

**2. AI**

- OpenAI GPT-4 integration for intelligent candidate matching
- Automated skill analysis and scoring
- Personalized outreach message generation
- Continuous learning from match success rates

**3. Regional Impact (UAE)**

- Connects UAE developers with global Web3 opportunities
- Supports local hackathons and events (like this one!)
- Telegram-first approach (popular in MENA region)
- Designed to support 42 Abu Dhabi students and alumni

### Scoring Criteria Alignment

**Design & Usability**

- Modern, responsive UI built with Tailwind CSS
- Intuitive role-based dashboards
- Seamless wallet integration with Privy
- Mobile-first design philosophy

**Scalability**

- Efficient smart contract with gas optimization
- Database indexing for fast queries
- Async AI processing prevents UI blocking
- Supports unlimited opportunities and candidates

**Innovation**

- First platform combining on-chain escrow with AI matching
- Automated candidate discovery and notification
- Multi-category bounty system
- Telegram-native Web3 workflow

**Open Source**

- Fully open-sourced under MIT license
- Comprehensive documentation
- Reusable components and services
- Community contribution guidelines

**Integration**

- BNB Chain smart contracts
- Supabase database
- OpenAI API
- Telegram Bot API
- Privy wallet authentication
- Multiple wallet providers (MetaMask, WalletConnect, etc.)

---

## Future Roadmap

### Phase 1 (Q1 2025)

- Launch on BNB Chain Mainnet
- Integrate with ChatAndBuild for AI agents
- Support APRO oracle data feeds for RWA bounties
- Multi-chain support (Ethereum, Polygon)

### Phase 2 (Q2 2025)

- Reputation system with on-chain credentials
- Dispute resolution mechanism
- Team-based bounties
- Milestone-based payments

### Phase 3 (Q3 2025)

- DAO governance for platform decisions
- Native token for staking and rewards
- Advanced analytics dashboard
- Integration with additional LLM providers

### Phase 4 (Q4 2025)

- Mobile app (React Native)
- Video interview scheduling
- Automated code review for submissions
- Enterprise sponsor features

---

## Contributing

We welcome contributions from the community! Please see our contribution guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure code passes linting

---

## Team

**[Add team member information]**

- Team Lead: [Name] - [Role] - [GitHub/Twitter]
- Developer: [Name] - [Role] - [GitHub/Twitter]
- Designer: [Name] - [Role] - [GitHub/Twitter]

---

## Acknowledgments

- BNB Chain and YZi Labs for hosting this hackathon
- 42 Abu Dhabi for venue and community support
- OpenAI for GPT-4 API access
- Supabase for database infrastructure
- Privy for wallet authentication
- Our amazing community of early testers

---

## Contact

- Website: [Add URL]
- Twitter: @BlockchainHQ
- Telegram: [Add group link]
- Email: team@blockchainhq.com
- GitHub: [Add organization link]

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Hackathon Submission Checklist

- [x] Project deployed on BNB Chain Testnet
- [x] Smart contract verified on BSCScan
- [x] At least 2 successful test transactions
- [x] Open source repository with comprehensive README
- [x] Demo video recorded
- [x] Presentation deck created
- [ ] Tweet posted with @BNBChain and #BNBHackAbuDhabi
- [ ] Final submission on Luma event page

**Built with dedication for BNB Chain x YZi Labs Hack Series: Abu Dhabi**

**December 5-6, 2025**
