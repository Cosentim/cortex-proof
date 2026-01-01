# Cortex

An AI chat application with cognitive memory that learns and adapts to you over time.

## Features

- **🧠 Cognitive Memory System** - Cortex learns from your conversations and builds a personalized cognitive profile
- **💬 AI Chat Interface** - Clean, centered chat layout with streaming responses
- **🎓 Teach Your Cortex** - Interactive prompts across 6 science-backed categories to help Cortex understand you
- **📊 Cortex Strength Meter** - Visual indicator of how well Cortex knows you
- **🔐 Google OAuth Authentication** - Secure login via Supabase Auth
- **🤖 Multiple AI Models** - Support for OpenAI and Anthropic models with Deep Research toggle

## Tech Stack

- **Framework**: Next.js 16 with App Router & Turbopack
- **Database**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS
- **AI**: Vercel AI SDK with OpenAI & Anthropic providers
- **Deployment**: Vercel

## Project Structure

```
cortex-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   │   ├── chat/           # Chat completion endpoint
│   │   │   ├── cortex/stats/   # Cortex profile stats
│   │   │   ├── memories/       # Memory CRUD operations
│   │   │   ├── teach/          # Teaching endpoint
│   │   │   └── ...
│   │   ├── auth/               # Auth callback
│   │   ├── login/              # Login page
│   │   ├── settings/           # User settings
│   │   └── page.tsx            # Main chat/cortex page
│   ├── components/
│   │   ├── auth/               # Authentication components
│   │   ├── chat/               # Chat interface components
│   │   ├── cortex/             # Cortex brain visualization
│   │   ├── memory/             # Memory management
│   │   ├── settings/           # Settings components
│   │   └── ui/                 # Shared UI components
│   ├── hooks/                  # React hooks
│   └── lib/                    # Utilities (Supabase client, etc.)
├── supabase/
│   ├── schema.sql              # Database schema
│   ├── migration.sql           # Safe migration for existing DBs
│   └── diagnostics.sql         # Debug queries
└── ...
```

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- OpenAI and/or Anthropic API keys

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for server-side)
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key

### Database Setup

1. Go to your Supabase project's SQL Editor
2. Run `supabase/schema.sql` for a fresh setup, or `supabase/migration.sql` if you have existing tables

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Deployment

Deployed on Vercel at: https://cortex-app-rosy.vercel.app

### Vercel Setup

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy from `feature/cognitive-architecture-v2` branch

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/chat` | POST | Stream chat completions |
| `/api/cortex/stats` | GET | Get user's cortex profile stats |
| `/api/memories` | GET/POST | List or create memories |
| `/api/memories/[id]` | DELETE | Delete a memory |
| `/api/teach` | POST | Submit teaching responses |
| `/api/profile` | GET | Get user profile |
| `/api/settings/models` | GET | Get available AI models |

## Database Schema

### Tables

- **user_profiles** - User settings and preferences
- **memories** - Learned facts about users
- **conversations** - Chat history
- **cognitive_profiles** - Aggregated user cognitive data
- **teaching_sessions** - Responses from TeachCortex prompts

## License

Private - Quantum Theory
