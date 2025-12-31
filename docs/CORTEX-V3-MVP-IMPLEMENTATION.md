# CORTEX V3: MVP Implementation Guide

## From Proof-of-Concept to Deployed Product

**Document Version:** 3.0  
**Created:** December 2024  
**Goal:** Deploy a working product that real users can try  
**Timeline:** 4-6 weeks  
**Stack:** Next.js 14 + Supabase + Vercel

---

## Document Relationships

You have multiple CORTEX documents. Here's how they relate:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DOCUMENT HIERARCHY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CORTEX-V3-MVP-IMPLEMENTATION.md  ◀── THIS DOCUMENT                        │
│  ════════════════════════════════                                           │
│  PURPOSE: What to build NOW                                                  │
│  USE: Hand to AI coding agent to build the deployable MVP                   │
│  CONTAINS: Everything needed for a working product                           │
│                                                                              │
│                           │                                                  │
│                           ▼                                                  │
│                                                                              │
│  CORTEX-COGNITIVE-ARCHITECTURE-V2-COMPLETE.md                               │
│  ────────────────────────────────────────────                               │
│  PURPOSE: Reference for FUTURE features (V3.5+)                             │
│  USE: When implementing connectors, MCP server, advanced retrieval          │
│  CONTAINS: Full architecture spec, connector code, self-improving loop      │
│                                                                              │
│                           │                                                  │
│                           ▼                                                  │
│                                                                              │
│  Original docs (CORTEX-QUICKSTART.md, cortex-implementation-guide.md)       │
│  ─────────────────────────────────────────────────────────────────          │
│  PURPOSE: Historical context only                                            │
│  STATUS: Superseded by V3 MVP                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**For AI Coding Agent:** Start with THIS document. It contains everything needed to build and deploy the MVP. Only reference the V2 Architecture document if implementing advanced features not covered here.

---

## What's In vs. What's Deferred

| Feature | V3 MVP (This Doc) | V3.5+ (Future) |
|---------|-------------------|----------------|
| Auth (email + Google) | ✅ | - |
| Chat with context injection | ✅ | - |
| Memory CRUD (view/add/edit/delete) | ✅ | - |
| Layered cognitive model | ✅ | - |
| CORTEX Protocol encoding | ✅ | - |
| Query analysis & routing | ✅ | - |
| Model selection (fast/balanced/deep) | ✅ | - |
| Auto-extraction from chat | ✅ | - |
| "Teach CORTEX" explicit learning | ✅ | - |
| Onboarding flow | ✅ | - |
| Connectors (Gmail, Drive) | ❌ | ✅ |
| CORTEX as MCP Server | ❌ | ✅ |
| Self-improving loop (consolidation) | ❌ | ✅ |
| Multi-agent orchestration | ❌ | Future |

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Project Setup](#2-project-setup)
3. [Database Schema](#3-database-schema)
4. [Core Library Code](#4-core-library-code)
5. [API Routes](#5-api-routes)
6. [UI Components](#6-ui-components)
7. [Authentication](#7-authentication)
8. [Onboarding Flow](#8-onboarding-flow)
9. [Teach CORTEX Feature](#9-teach-cortex-feature)
10. [Migration from POC](#10-migration-from-poc)
11. [Deployment](#11-deployment)
12. [Cost Estimation](#12-cost-estimation)
13. [Post-Launch Checklist](#13-post-launch-checklist)

---

## 1. Overview & Architecture

### What We're Building

A web application where users can:
1. Chat with AI that remembers them across sessions
2. View, edit, and delete their memories
3. See which memories influenced each response
4. Choose model strength (fast/balanced/deep)

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              VERCEL                                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                        NEXT.JS APP                                 │  │
│  │                                                                    │  │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │  │
│  │   │   Pages     │    │ API Routes  │    │  Server     │          │  │
│  │   │  (React)    │───▶│  /api/*     │───▶│  Actions    │          │  │
│  │   └─────────────┘    └─────────────┘    └─────────────┘          │  │
│  │                             │                   │                  │  │
│  └─────────────────────────────┼───────────────────┼──────────────────┘  │
└────────────────────────────────┼───────────────────┼─────────────────────┘
                                 │                   │
                    ┌────────────┴────────────┐      │
                    ▼                         ▼      ▼
         ┌─────────────────┐       ┌─────────────────────┐
         │   SUPABASE      │       │   AI PROVIDERS      │
         │                 │       │                     │
         │  ┌───────────┐  │       │  ┌─────────────┐   │
         │  │  Postgres │  │       │  │   OpenAI    │   │
         │  │ + pgvector│  │       │  └─────────────┘   │
         │  └───────────┘  │       │  ┌─────────────┐   │
         │  ┌───────────┐  │       │  │  Anthropic  │   │
         │  │   Auth    │  │       │  └─────────────┘   │
         │  └───────────┘  │       │                     │
         │  ┌───────────┐  │       └─────────────────────┘
         │  │  Storage  │  │
         │  └───────────┘  │
         └─────────────────┘
```

### Request Flow

```
User sends message
       │
       ▼
┌──────────────────┐
│  POST /api/chat  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Authenticate    │──── Invalid ───▶ 401
│  (Supabase)      │
└────────┬─────────┘
         │ Valid
         ▼
┌──────────────────┐
│  Query Analyzer  │
│  - Intent        │
│  - Complexity    │
│  - Layer weights │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Hierarchical    │
│  Retrieval       │
│  - Per-layer     │
│  - Scored        │
│  - Budgeted      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Protocol        │
│  Encoder         │
│  - Build context │
│  - Minimize      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Model Router    │
│  - Select model  │
│  - Stream call   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Response        │
│  + Observation   │
│  (background)    │
└──────────────────┘
```

---

## 2. Project Setup

### 2.1 Create Project

```bash
# Create Next.js project
npx create-next-app@latest cortex --typescript --tailwind --eslint --app --src-dir --use-npm

cd cortex

# Install dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install ai @ai-sdk/openai @ai-sdk/anthropic
npm install openai
npm install zod
npm install framer-motion
npm install lucide-react
npm install clsx tailwind-merge
npm install date-fns
npm install nanoid

# Dev dependencies
npm install -D @types/node
```

### 2.2 Project Structure

```
cortex/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with providers
│   │   ├── page.tsx                   # Landing page
│   │   ├── globals.css                # Global styles
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx         # Login page
│   │   │   ├── signup/page.tsx        # Signup page
│   │   │   └── callback/route.ts      # OAuth callback
│   │   │
│   │   ├── chat/
│   │   │   └── page.tsx               # Main chat interface
│   │   │
│   │   ├── memories/
│   │   │   └── page.tsx               # Memory management
│   │   │
│   │   └── api/
│   │       ├── chat/route.ts          # Chat endpoint (streaming)
│   │       ├── memories/
│   │       │   ├── route.ts           # GET/POST memories
│   │       │   └── [id]/route.ts      # PATCH/DELETE memory
│   │       └── profile/route.ts       # User cognitive profile
│   │
│   ├── components/
│   │   ├── ui/                        # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   └── dialog.tsx
│   │   │
│   │   ├── chat/
│   │   │   ├── chat-interface.tsx     # Main chat container
│   │   │   ├── message-list.tsx       # Message display
│   │   │   ├── message-item.tsx       # Single message
│   │   │   ├── chat-input.tsx         # Input area
│   │   │   └── model-selector.tsx     # Fast/Balanced/Deep
│   │   │
│   │   ├── memory/
│   │   │   ├── memory-drawer.tsx      # Slide-out panel
│   │   │   ├── memory-list.tsx        # Memory list
│   │   │   ├── memory-item.tsx        # Single memory
│   │   │   ├── memory-editor.tsx      # Edit modal
│   │   │   └── memory-context.tsx     # "X memories used"
│   │   │
│   │   ├── layout/
│   │   │   ├── header.tsx             # Top nav
│   │   │   └── sidebar.tsx            # Side nav (if needed)
│   │   │
│   │   └── providers/
│   │       └── auth-provider.tsx      # Auth context
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser client
│   │   │   ├── server.ts              # Server client
│   │   │   ├── admin.ts               # Service role client
│   │   │   └── middleware.ts          # Auth middleware
│   │   │
│   │   ├── ai/
│   │   │   ├── embeddings.ts          # Generate embeddings
│   │   │   ├── models.ts              # Model configurations
│   │   │   └── router.ts              # Model routing logic
│   │   │
│   │   ├── cognitive/
│   │   │   ├── query-analyzer.ts      # Intent classification
│   │   │   ├── retrieval.ts           # Hierarchical retrieval
│   │   │   ├── extraction.ts          # Memory extraction
│   │   │   └── observer.ts            # Learning from interactions
│   │   │
│   │   ├── protocol/
│   │   │   └── cortex-protocol.ts     # Protocol encoder
│   │   │
│   │   └── types/
│   │       ├── database.ts            # Supabase generated types
│   │       └── cognitive.ts           # Cognitive architecture types
│   │
│   └── hooks/
│       ├── use-chat.ts                # Chat state management
│       ├── use-memories.ts            # Memory CRUD
│       └── use-user.ts                # User/auth state
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql     # Database schema
│
├── .env.local                         # Environment variables
├── middleware.ts                      # Next.js middleware (auth)
└── next.config.js                     # Next.js config
```

### 2.3 Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Database Schema

### File: `supabase/migrations/001_initial_schema.sql`

Run this in Supabase SQL Editor or via CLI.

```sql
-- ============================================================================
-- CORTEX V3 DATABASE SCHEMA
-- ============================================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- ============================================================================
-- ENUMS
-- ============================================================================

create type cognitive_layer as enum (
  'identity',
  'knowledge', 
  'behavioral',
  'project',
  'episodic'
);

create type memory_type as enum (
  -- Identity
  'core_value', 'self_concept', 'expertise_domain', 'communication_pref',
  -- Knowledge
  'fact', 'entity', 'relationship', 'mental_model', 'domain_knowledge',
  -- Behavioral
  'decision_pattern', 'cognitive_bias', 'workflow_habit', 'preference',
  -- Project
  'active_goal', 'constraint', 'decision', 'open_question', 'milestone',
  -- Episodic
  'event', 'conversation_summary', 'insight', 'outcome'
);

create type temporal_scope as enum (
  'permanent',
  'current',
  'dated',
  'expired'
);

create type memory_source as enum (
  'user_explicit',
  'user_implicit',
  'extracted',
  'inferred'
);

create type model_strength as enum (
  'fast',
  'balanced',
  'deep'
);

-- ============================================================================
-- USER PROFILES
-- ============================================================================

create table user_profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  
  -- Cached cognitive profile summary
  expertise text[] default '{}',
  core_values text[] default '{}',
  communication_style text,
  preferences text[] default '{}',
  anti_preferences text[] default '{}',
  patterns text[] default '{}',
  
  -- Settings
  default_model_strength model_strength default 'balanced',
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into user_profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- MEMORIES
-- ============================================================================

create table memories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  
  -- Content
  content text not null,
  content_embedding vector(1536),
  
  -- Classification
  layer cognitive_layer not null,
  memory_type memory_type not null,
  temporal_scope temporal_scope default 'current',
  
  -- Source & Confidence
  source memory_source default 'user_explicit',
  confidence float default 1.0 check (confidence between 0 and 1),
  
  -- Entities (JSONB for flexibility)
  entities jsonb default '[]',
  
  -- Retrieval optimization
  access_count int default 0,
  last_accessed timestamptz,
  retrieval_boost float default 1.0,
  
  -- Flags
  is_active boolean default true,
  is_pinned boolean default false,
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_memories_user on memories(user_id);
create index idx_memories_user_active on memories(user_id) where is_active = true;
create index idx_memories_user_layer on memories(user_id, layer) where is_active = true;
create index idx_memories_user_pinned on memories(user_id) where is_pinned = true and is_active = true;

-- Vector index for semantic search
create index idx_memories_embedding on memories 
  using ivfflat (content_embedding vector_cosine_ops)
  with (lists = 100);

-- ============================================================================
-- CONVERSATIONS
-- ============================================================================

create table conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  
  title text,
  
  -- Last interaction
  last_message_at timestamptz default now(),
  message_count int default 0,
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_conversations_user on conversations(user_id);
create index idx_conversations_recent on conversations(user_id, last_message_at desc);

-- ============================================================================
-- MESSAGES
-- ============================================================================

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations on delete cascade,
  
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  
  -- Model info (for assistant messages)
  model_used text,
  model_strength model_strength,
  
  -- Context info
  memories_used uuid[] default '{}',
  context_tokens int,
  response_tokens int,
  
  -- Timestamp
  created_at timestamptz default now()
);

create index idx_messages_conversation on messages(conversation_id);
create index idx_messages_created on messages(conversation_id, created_at);

-- ============================================================================
-- SEMANTIC SEARCH FUNCTION
-- ============================================================================

create or replace function match_memories(
  query_embedding vector(1536),
  match_user_id uuid,
  match_layer cognitive_layer default null,
  match_threshold float default 0.5,
  match_count int default 20
)
returns table (
  id uuid,
  content text,
  layer cognitive_layer,
  memory_type memory_type,
  confidence float,
  is_pinned boolean,
  access_count int,
  retrieval_boost float,
  similarity float,
  created_at timestamptz
)
language sql stable
as $$
  select
    m.id,
    m.content,
    m.layer,
    m.memory_type,
    m.confidence,
    m.is_pinned,
    m.access_count,
    m.retrieval_boost,
    1 - (m.content_embedding <=> query_embedding) as similarity,
    m.created_at
  from memories m
  where m.user_id = match_user_id
    and m.is_active = true
    and (match_layer is null or m.layer = match_layer)
    and 1 - (m.content_embedding <=> query_embedding) > match_threshold
  order by m.content_embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================================================
-- INCREMENT ACCESS COUNT
-- ============================================================================

create or replace function increment_memory_access(memory_ids uuid[])
returns void language plpgsql as $$
begin
  update memories
  set access_count = access_count + 1,
      last_accessed = now()
  where id = any(memory_ids);
end;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table user_profiles enable row level security;
alter table memories enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- User profiles
create policy "Users can view own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = id);

-- Memories
create policy "Users can view own memories"
  on memories for select
  using (auth.uid() = user_id);

create policy "Users can insert own memories"
  on memories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own memories"
  on memories for update
  using (auth.uid() = user_id);

create policy "Users can delete own memories"
  on memories for delete
  using (auth.uid() = user_id);

-- Conversations
create policy "Users can manage own conversations"
  on conversations for all
  using (auth.uid() = user_id);

-- Messages
create policy "Users can view own messages"
  on messages for select
  using (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  );

create policy "Users can insert own messages"
  on messages for insert
  with check (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  );

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_user_profiles_updated
  before update on user_profiles
  for each row execute function update_updated_at();

create trigger trg_memories_updated
  before update on memories
  for each row execute function update_updated_at();

create trigger trg_conversations_updated
  before update on conversations
  for each row execute function update_updated_at();
```

---

## 4. Core Library Code

### 4.1 Supabase Clients

#### File: `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

#### File: `src/lib/supabase/server.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle in middleware
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle in middleware
          }
        },
      },
    }
  );
}
```

#### File: `src/lib/supabase/admin.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

#### File: `src/lib/supabase/middleware.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}
```

### 4.2 Types

#### File: `src/lib/types/cognitive.ts`

```typescript
// ============================================================================
// CORTEX COGNITIVE TYPES
// ============================================================================

export type CognitiveLayer = 
  | 'identity'
  | 'knowledge'
  | 'behavioral'
  | 'project'
  | 'episodic';

export type MemoryType =
  // Identity
  | 'core_value' | 'self_concept' | 'expertise_domain' | 'communication_pref'
  // Knowledge
  | 'fact' | 'entity' | 'relationship' | 'mental_model' | 'domain_knowledge'
  // Behavioral
  | 'decision_pattern' | 'cognitive_bias' | 'workflow_habit' | 'preference'
  // Project
  | 'active_goal' | 'constraint' | 'decision' | 'open_question' | 'milestone'
  // Episodic
  | 'event' | 'conversation_summary' | 'insight' | 'outcome';

export type TemporalScope = 'permanent' | 'current' | 'dated' | 'expired';

export type MemorySource = 'user_explicit' | 'user_implicit' | 'extracted' | 'inferred';

export type ModelStrength = 'fast' | 'balanced' | 'deep';

export type QueryIntent = 
  | 'factual' 
  | 'decision' 
  | 'creative' 
  | 'task' 
  | 'reflection' 
  | 'continuation';

export interface Memory {
  id: string;
  user_id: string;
  content: string;
  layer: CognitiveLayer;
  memory_type: MemoryType;
  temporal_scope: TemporalScope;
  source: MemorySource;
  confidence: number;
  entities: EntityReference[];
  access_count: number;
  is_active: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface EntityReference {
  type: 'person' | 'company' | 'project' | 'concept';
  name: string;
  role?: string;
}

export interface ScoredMemory {
  memory: Memory;
  score: number;
  similarity: number;
}

export interface QueryAnalysis {
  input: string;
  intent: QueryIntent;
  complexity: 'simple' | 'moderate' | 'complex';
  layerRelevance: Record<CognitiveLayer, number>;
  suggestedBudget: Record<CognitiveLayer, number>;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  expertise: string[];
  core_values: string[];
  communication_style: string | null;
  preferences: string[];
  anti_preferences: string[];
  patterns: string[];
  default_model_strength: ModelStrength;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  last_message_at: string;
  message_count: number;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model_used?: string;
  model_strength?: ModelStrength;
  memories_used: string[];
  context_tokens?: number;
  response_tokens?: number;
  created_at: string;
}

// Protocol types
export interface ProtocolContext {
  system: { role: string; mode: string; userId: string };
  identity: {
    name: string;
    roles: string[];
    expertise: string[];
    values: string[];
    style: string;
  };
  knowledge: Array<{
    id: string;
    content: string;
    entities: string[];
    confidence: number;
  }>;
  behavioral: {
    preferences: string[];
    antiPreferences: string[];
    patterns: string[];
  };
  project?: {
    id: string;
    name: string;
    goals: string[];
    constraints: string[];
  };
  query: {
    input: string;
    intent: QueryIntent;
  };
  responseSpec: {
    format: 'structured' | 'prose' | 'code';
    length: 'concise' | 'moderate' | 'comprehensive';
    include: string[];
    avoid: string[];
  };
}
```

### 4.3 AI Utilities

#### File: `src/lib/ai/embeddings.ts`

```typescript
import OpenAI from 'openai';

const openai = new OpenAI();

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 1536,
  });
  
  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
    dimensions: 1536,
  });
  
  return response.data.map(d => d.embedding);
}
```

#### File: `src/lib/ai/models.ts`

```typescript
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import type { ModelStrength } from '../types/cognitive';

const openai = createOpenAI();
const anthropic = createAnthropic();

export const MODEL_CONFIGS = {
  fast: {
    provider: 'openai',
    model: openai('gpt-4o-mini'),
    name: 'GPT-4o Mini',
    maxTokens: 2048,
  },
  balanced: {
    provider: 'anthropic',
    model: anthropic('claude-sonnet-4-20250514'),
    name: 'Claude Sonnet',
    maxTokens: 4096,
  },
  deep: {
    provider: 'openai',
    model: openai('gpt-4o'),
    name: 'GPT-4o',
    maxTokens: 4096,
  },
} as const;

export function getModelConfig(strength: ModelStrength) {
  return MODEL_CONFIGS[strength];
}
```

### 4.4 Cognitive System

#### File: `src/lib/cognitive/query-analyzer.ts`

```typescript
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import type { QueryAnalysis, QueryIntent, CognitiveLayer } from '../types/cognitive';

const openai = createOpenAI();

const QueryAnalysisSchema = z.object({
  intent: z.enum(['factual', 'decision', 'creative', 'task', 'reflection', 'continuation']),
  complexity: z.enum(['simple', 'moderate', 'complex']),
  layers: z.object({
    identity: z.number().min(0).max(1),
    knowledge: z.number().min(0).max(1),
    behavioral: z.number().min(0).max(1),
    project: z.number().min(0).max(1),
    episodic: z.number().min(0).max(1),
  }),
});

const ANALYSIS_PROMPT = `Analyze this user query for cognitive routing.

OUTPUT JSON with:
- intent: factual|decision|creative|task|reflection|continuation
- complexity: simple|moderate|complex  
- layers: relevance score 0-1 for each cognitive layer

LAYERS:
- identity: values, preferences, who they are
- knowledge: facts, entities, domain info
- behavioral: patterns, habits, decision styles
- project: active work, goals, constraints
- episodic: past conversations, events

QUERY: `;

export async function analyzeQuery(input: string): Promise<QueryAnalysis> {
  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: QueryAnalysisSchema,
      prompt: ANALYSIS_PROMPT + `"${input}"`,
    });
    
    const totalBudget = object.complexity === 'simple' ? 800 
      : object.complexity === 'moderate' ? 1500 
      : 2500;
    
    const totalRelevance = Object.values(object.layers).reduce((a, b) => a + b, 0);
    const suggestedBudget: Record<CognitiveLayer, number> = {
      identity: 0, knowledge: 0, behavioral: 0, project: 0, episodic: 0
    };
    
    if (totalRelevance > 0) {
      for (const [layer, score] of Object.entries(object.layers)) {
        suggestedBudget[layer as CognitiveLayer] = Math.floor((score / totalRelevance) * totalBudget);
      }
    }
    
    return {
      input,
      intent: object.intent as QueryIntent,
      complexity: object.complexity,
      layerRelevance: object.layers as Record<CognitiveLayer, number>,
      suggestedBudget,
    };
  } catch (error) {
    // Fallback to defaults
    return {
      input,
      intent: 'task',
      complexity: 'moderate',
      layerRelevance: { identity: 0.3, knowledge: 0.5, behavioral: 0.3, project: 0.5, episodic: 0.2 },
      suggestedBudget: { identity: 150, knowledge: 400, behavioral: 200, project: 400, episodic: 150 },
    };
  }
}
```

#### File: `src/lib/cognitive/retrieval.ts`

```typescript
import { createClient } from '../supabase/server';
import { generateEmbedding } from '../ai/embeddings';
import type { QueryAnalysis, CognitiveLayer, Memory, ScoredMemory, UserProfile } from '../types/cognitive';

const RECENCY_HALF_LIFE_DAYS = 30;

function calculateRecencyScore(createdAt: string): number {
  const daysSince = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return Math.exp(-daysSince / RECENCY_HALF_LIFE_DAYS);
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function retrieveMemories(
  userId: string,
  query: string,
  analysis: QueryAnalysis
): Promise<{ memories: ScoredMemory[]; totalTokens: number }> {
  const supabase = await createClient();
  const queryEmbedding = await generateEmbedding(query);
  
  // Get all relevant memories across layers
  const allMemories: ScoredMemory[] = [];
  
  for (const [layer, budget] of Object.entries(analysis.suggestedBudget)) {
    if (budget < 50) continue;
    
    const { data: results } = await supabase.rpc('match_memories', {
      query_embedding: queryEmbedding,
      match_user_id: userId,
      match_layer: layer,
      match_threshold: 0.4,
      match_count: 15,
    });
    
    if (results) {
      for (const result of results) {
        const recency = calculateRecencyScore(result.created_at);
        const frequency = Math.min((result.access_count || 0) / 50, 0.2);
        const pinned = result.is_pinned ? 0.15 : 0;
        const boost = (result.retrieval_boost || 1) - 1;
        
        const score = (
          result.similarity * 0.5 +
          recency * 0.15 +
          frequency * 0.05 +
          pinned +
          boost * 0.05 +
          result.confidence * 0.1
        );
        
        allMemories.push({
          memory: result as Memory,
          score,
          similarity: result.similarity,
        });
      }
    }
  }
  
  // Get pinned memories (always include)
  const { data: pinnedMemories } = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('is_pinned', true);
  
  if (pinnedMemories) {
    for (const pinned of pinnedMemories) {
      const alreadyIncluded = allMemories.some(m => m.memory.id === pinned.id);
      if (!alreadyIncluded) {
        allMemories.push({
          memory: pinned as Memory,
          score: 0.9,
          similarity: 0,
        });
      }
    }
  }
  
  // Sort by score and select within total budget
  allMemories.sort((a, b) => b.score - a.score);
  
  const totalBudget = Object.values(analysis.suggestedBudget).reduce((a, b) => a + b, 0);
  const selected: ScoredMemory[] = [];
  let usedTokens = 0;
  
  for (const item of allMemories) {
    const tokens = estimateTokens(item.memory.content);
    if (usedTokens + tokens <= totalBudget) {
      selected.push(item);
      usedTokens += tokens;
    }
  }
  
  return { memories: selected, totalTokens: usedTokens };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || !data) return null;
  return data as UserProfile;
}

export async function trackMemoryAccess(memoryIds: string[]): Promise<void> {
  if (memoryIds.length === 0) return;
  
  const supabase = await createClient();
  await supabase.rpc('increment_memory_access', { memory_ids: memoryIds });
}
```

#### File: `src/lib/protocol/cortex-protocol.ts`

```typescript
import type { ProtocolContext, ScoredMemory, UserProfile, QueryAnalysis } from '../types/cognitive';

// Protocol decoder for the AI model
export const PROTOCOL_DECODER = `You will receive context in CORTEX Protocol format.

@SYS: System settings (role, mode)
@ID: User identity (name, expertise, values, style)
@K: Knowledge entries [id:"content" ^confidence]
@B: Behavioral [+preference, -avoid, ~pattern]
@P: Active project (if any)
@Q: Query (input, intent)
@R: Response spec (format, length, include, avoid)

Respond naturally using this context. Never mention the protocol.

---

`;

function escapeString(str: string): string {
  return str.replace(/"/g, '\\"').replace(/\n/g, ' ');
}

function truncate(str: string, maxLen: number = 150): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 3) + '...';
}

export function encodeProtocol(ctx: ProtocolContext): string {
  const lines: string[] = ['CORTEX/1.0', ''];
  
  // System
  lines.push(`@SYS {role:${ctx.system.role};mode:${ctx.system.mode}}`);
  lines.push('');
  
  // Identity
  lines.push('@ID {');
  lines.push(`  name:${ctx.identity.name}`);
  if (ctx.identity.roles.length) lines.push(`  roles:[${ctx.identity.roles.join(',')}]`);
  if (ctx.identity.expertise.length) lines.push(`  expertise:[${ctx.identity.expertise.join(',')}]`);
  if (ctx.identity.values.length) lines.push(`  values:[${ctx.identity.values.join(',')}]`);
  lines.push(`  style:${ctx.identity.style || 'standard'}`);
  lines.push('}');
  lines.push('');
  
  // Knowledge
  if (ctx.knowledge.length > 0) {
    lines.push('@K [');
    ctx.knowledge.forEach((k, i) => {
      const content = truncate(escapeString(k.content));
      lines.push(`  k${i}:"${content}" ^${k.confidence.toFixed(1)}`);
    });
    lines.push(']');
    lines.push('');
  }
  
  // Behavioral
  if (ctx.behavioral.preferences.length || ctx.behavioral.antiPreferences.length || ctx.behavioral.patterns.length) {
    lines.push('@B [');
    ctx.behavioral.preferences.forEach(p => lines.push(`  +${p}`));
    ctx.behavioral.antiPreferences.forEach(p => lines.push(`  -${p}`));
    ctx.behavioral.patterns.forEach(p => lines.push(`  ~${p}`));
    lines.push(']');
    lines.push('');
  }
  
  // Project
  if (ctx.project) {
    lines.push(`@P ${ctx.project.id} {`);
    lines.push(`  name:${ctx.project.name}`);
    if (ctx.project.goals.length) lines.push(`  goals:[${ctx.project.goals.join(',')}]`);
    if (ctx.project.constraints.length) lines.push(`  constraints:[${ctx.project.constraints.join(',')}]`);
    lines.push('}');
    lines.push('');
  }
  
  // Query
  lines.push('@Q {');
  lines.push(`  input:"${escapeString(ctx.query.input)}"`);
  lines.push(`  intent:${ctx.query.intent}`);
  lines.push('}');
  lines.push('');
  
  // Response spec
  lines.push('@R {');
  lines.push(`  format:${ctx.responseSpec.format}`);
  lines.push(`  length:${ctx.responseSpec.length}`);
  if (ctx.responseSpec.include.length) lines.push(`  include:[${ctx.responseSpec.include.join(',')}]`);
  if (ctx.responseSpec.avoid.length) lines.push(`  avoid:[${ctx.responseSpec.avoid.join(',')}]`);
  lines.push('}');
  
  return lines.join('\n');
}

export function buildSystemPrompt(ctx: ProtocolContext): string {
  return PROTOCOL_DECODER + encodeProtocol(ctx);
}

export function buildProtocolContext(
  profile: UserProfile | null,
  memories: ScoredMemory[],
  analysis: QueryAnalysis
): ProtocolContext {
  return {
    system: {
      role: 'cognitive-assistant',
      mode: analysis.complexity === 'complex' ? 'analytical' : 'standard',
      userId: profile?.id || 'anonymous',
    },
    identity: {
      name: profile?.display_name || 'User',
      roles: [],
      expertise: profile?.expertise || [],
      values: profile?.core_values || [],
      style: profile?.communication_style || 'standard',
    },
    knowledge: memories.map((m, i) => ({
      id: `k${i}`,
      content: m.memory.content,
      entities: (m.memory.entities || []).map(e => e.name),
      confidence: m.memory.confidence,
    })),
    behavioral: {
      preferences: profile?.preferences || [],
      antiPreferences: profile?.anti_preferences || [],
      patterns: profile?.patterns || [],
    },
    query: {
      input: analysis.input,
      intent: analysis.intent,
    },
    responseSpec: {
      format: 'prose',
      length: analysis.complexity === 'simple' ? 'concise' : 'moderate',
      include: analysis.intent === 'decision' ? ['tradeoffs'] : [],
      avoid: profile?.communication_style?.includes('concise') ? ['verbose'] : [],
    },
  };
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
```

#### File: `src/lib/cognitive/extraction.ts`

```typescript
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { createClient } from '../supabase/server';
import { generateEmbedding } from '../ai/embeddings';
import type { CognitiveLayer, MemoryType } from '../types/cognitive';

const openai = createOpenAI();

const ExtractionSchema = z.array(z.object({
  type: z.string(),
  layer: z.enum(['identity', 'knowledge', 'behavioral', 'project', 'episodic']),
  content: z.string(),
  confidence: z.number().min(0).max(1),
}));

const EXTRACTION_PROMPT = `Extract structured memories from this conversation.

For each distinct piece of information, output:
- type: core_value|expertise_domain|fact|preference|active_goal|constraint|decision|insight
- layer: identity|knowledge|behavioral|project|episodic
- content: Dense statement (no filler words)
- confidence: 0-1 (1.0 if explicitly stated)

Only extract clear, specific information. Skip vague or hypothetical statements.

CONVERSATION:
`;

export async function extractFromConversation(
  userId: string,
  userMessage: string,
  assistantResponse: string
): Promise<number> {
  try {
    const { object: extractions } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: ExtractionSchema,
      prompt: EXTRACTION_PROMPT + `User: ${userMessage}\nAssistant: ${assistantResponse}`,
    });
    
    if (!extractions || extractions.length === 0) return 0;
    
    // Only store high-confidence extractions
    const highConfidence = extractions.filter(e => e.confidence >= 0.75);
    
    const supabase = await createClient();
    let stored = 0;
    
    for (const extraction of highConfidence) {
      const embedding = await generateEmbedding(extraction.content);
      
      // Check for duplicates
      const { data: existing } = await supabase.rpc('match_memories', {
        query_embedding: embedding,
        match_user_id: userId,
        match_threshold: 0.9,
        match_count: 1,
      });
      
      if (!existing || existing.length === 0) {
        const { error } = await supabase.from('memories').insert({
          user_id: userId,
          content: extraction.content,
          content_embedding: embedding,
          layer: extraction.layer as CognitiveLayer,
          memory_type: extraction.type as MemoryType,
          source: 'user_implicit',
          confidence: extraction.confidence * 0.9, // Slight discount for implicit
        });
        
        if (!error) stored++;
      }
    }
    
    return stored;
  } catch (error) {
    console.error('Extraction failed:', error);
    return 0;
  }
}
```

---

## 5. API Routes

### 5.1 Chat Endpoint

#### File: `src/app/api/chat/route.ts`

```typescript
import { streamText } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { analyzeQuery } from '@/lib/cognitive/query-analyzer';
import { retrieveMemories, getUserProfile, trackMemoryAccess } from '@/lib/cognitive/retrieval';
import { buildProtocolContext, buildSystemPrompt } from '@/lib/protocol/cortex-protocol';
import { getModelConfig } from '@/lib/ai/models';
import { extractFromConversation } from '@/lib/cognitive/extraction';
import type { ModelStrength } from '@/lib/types/cognitive';

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  
  // Authenticate
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Parse request
  const { 
    message, 
    conversationId, 
    modelStrength = 'balanced' 
  }: { 
    message: string; 
    conversationId?: string;
    modelStrength?: ModelStrength;
  } = await request.json();
  
  if (!message?.trim()) {
    return new Response('Message required', { status: 400 });
  }
  
  try {
    // 1. Analyze query
    const analysis = await analyzeQuery(message);
    
    // 2. Retrieve relevant memories
    const { memories, totalTokens } = await retrieveMemories(user.id, message, analysis);
    
    // 3. Get user profile
    const profile = await getUserProfile(user.id);
    
    // 4. Build protocol context
    const protocolContext = buildProtocolContext(profile, memories, analysis);
    const systemPrompt = buildSystemPrompt(protocolContext);
    
    // 5. Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, title: message.substring(0, 50) })
        .select('id')
        .single();
      convId = newConv?.id;
    }
    
    // 6. Save user message
    if (convId) {
      await supabase.from('messages').insert({
        conversation_id: convId,
        role: 'user',
        content: message,
      });
    }
    
    // 7. Get model config
    const modelConfig = getModelConfig(modelStrength);
    
    // 8. Stream response
    const result = await streamText({
      model: modelConfig.model,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
      maxTokens: modelConfig.maxTokens,
      onFinish: async ({ text, usage }) => {
        // Save assistant message
        if (convId) {
          await supabase.from('messages').insert({
            conversation_id: convId,
            role: 'assistant',
            content: text,
            model_used: modelConfig.name,
            model_strength: modelStrength,
            memories_used: memories.map(m => m.memory.id),
            context_tokens: totalTokens,
            response_tokens: usage?.completionTokens,
          });
          
          // Update conversation
          await supabase
            .from('conversations')
            .update({ 
              last_message_at: new Date().toISOString(),
              message_count: (await supabase
                .from('messages')
                .select('id', { count: 'exact' })
                .eq('conversation_id', convId)).count || 0
            })
            .eq('id', convId);
        }
        
        // Track memory access
        await trackMemoryAccess(memories.map(m => m.memory.id));
        
        // Background: Extract learnings (don't await)
        extractFromConversation(user.id, message, text).catch(console.error);
      },
    });
    
    // Return streaming response with metadata headers
    return result.toDataStreamResponse({
      headers: {
        'X-Conversation-Id': convId || '',
        'X-Memories-Used': memories.length.toString(),
        'X-Model-Used': modelConfig.name,
      },
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    return new Response('Internal error', { status: 500 });
  }
}
```

### 5.2 Memories Endpoints

#### File: `src/app/api/memories/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/ai/embeddings';
import type { CognitiveLayer, MemoryType } from '@/lib/types/cognitive';

// GET - List memories
export async function GET(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const layer = searchParams.get('layer') as CognitiveLayer | null;
  const limit = parseInt(searchParams.get('limit') || '50');
  
  let query = supabase
    .from('memories')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (layer) {
    query = query.eq('layer', layer);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ memories: data });
}

// POST - Create memory
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const { content, layer, memory_type, is_pinned = false } = body;
  
  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content required' }, { status: 400 });
  }
  
  // Generate embedding
  const embedding = await generateEmbedding(content);
  
  const { data, error } = await supabase
    .from('memories')
    .insert({
      user_id: user.id,
      content,
      content_embedding: embedding,
      layer: layer || 'knowledge',
      memory_type: memory_type || 'fact',
      source: 'user_explicit',
      confidence: 1.0,
      is_pinned,
    })
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ memory: data });
}
```

#### File: `src/app/api/memories/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/ai/embeddings';

// PATCH - Update memory
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const updates: any = {};
  
  if (body.content !== undefined) {
    updates.content = body.content;
    updates.content_embedding = await generateEmbedding(body.content);
  }
  if (body.layer !== undefined) updates.layer = body.layer;
  if (body.memory_type !== undefined) updates.memory_type = body.memory_type;
  if (body.is_pinned !== undefined) updates.is_pinned = body.is_pinned;
  
  const { data, error } = await supabase
    .from('memories')
    .update(updates)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ memory: data });
}

// DELETE - Soft delete memory
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { error } = await supabase
    .from('memories')
    .update({ is_active: false })
    .eq('id', params.id)
    .eq('user_id', user.id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}
```

---

## 6. UI Components

### 6.1 Base Components

#### File: `src/components/ui/button.tsx`

```typescript
import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-emerald-600 text-white hover:bg-emerald-700': variant === 'primary',
            'bg-zinc-700 text-zinc-100 hover:bg-zinc-600': variant === 'secondary',
            'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

#### File: `src/components/ui/badge.tsx`

```typescript
import { clsx } from 'clsx';
import type { CognitiveLayer } from '@/lib/types/cognitive';

const LAYER_COLORS: Record<CognitiveLayer, string> = {
  identity: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  knowledge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  behavioral: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  project: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  episodic: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

interface BadgeProps {
  layer: CognitiveLayer;
  className?: string;
}

export function LayerBadge({ layer, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        LAYER_COLORS[layer],
        className
      )}
    >
      {layer}
    </span>
  );
}
```

### 6.2 Chat Components

#### File: `src/components/chat/chat-interface.tsx`

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { ModelSelector } from './model-selector';
import { MemoryDrawer } from '../memory/memory-drawer';
import { Button } from '../ui/button';
import { Menu, X } from 'lucide-react';
import type { ModelStrength, Message } from '@/lib/types/cognitive';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [modelStrength, setModelStrength] = useState<ModelStrength>('balanced');
  const [showMemories, setShowMemories] = useState(false);
  const [lastMemoriesUsed, setLastMemoriesUsed] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  async function handleSend(content: string) {
    if (!content.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: conversationId || '',
      role: 'user',
      content,
      memories_used: [],
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId,
          modelStrength,
        }),
      });
      
      if (!response.ok) throw new Error('Chat failed');
      
      // Get metadata from headers
      const newConvId = response.headers.get('X-Conversation-Id');
      const memoriesUsed = parseInt(response.headers.get('X-Memories-Used') || '0');
      const modelUsed = response.headers.get('X-Model-Used') || '';
      
      if (newConvId && !conversationId) {
        setConversationId(newConvId);
      }
      
      // Stream response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        conversation_id: newConvId || '',
        role: 'assistant',
        content: '',
        model_used: modelUsed,
        model_strength: modelStrength,
        memories_used: [],
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        // Parse SSE format
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('0:')) {
            const text = JSON.parse(line.slice(2));
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: updated[updated.length - 1].content + text,
              };
              return updated;
            });
          }
        }
      }
      
      setLastMemoriesUsed(Array(memoriesUsed).fill(''));
      
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        conversation_id: '',
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        memories_used: [],
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }
  
  function handleNewChat() {
    setMessages([]);
    setConversationId(null);
    setLastMemoriesUsed([]);
  }
  
  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-zinc-100">CORTEX</h1>
            <ModelSelector value={modelStrength} onChange={setModelStrength} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleNewChat}>
              New Chat
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowMemories(!showMemories)}
            >
              {showMemories ? <X size={18} /> : <Menu size={18} />}
              <span className="ml-1">Memories</span>
            </Button>
          </div>
        </header>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-500">
              <p>Start a conversation. CORTEX remembers.</p>
            </div>
          ) : (
            <MessageList 
              messages={messages} 
              memoriesUsed={lastMemoriesUsed.length}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="border-t border-zinc-800 px-4 py-4">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
      
      {/* Memory drawer */}
      <MemoryDrawer isOpen={showMemories} onClose={() => setShowMemories(false)} />
    </div>
  );
}
```

#### File: `src/components/chat/message-list.tsx`

```typescript
import { clsx } from 'clsx';
import type { Message } from '@/lib/types/cognitive';

interface MessageListProps {
  messages: Message[];
  memoriesUsed: number;
}

export function MessageList({ messages, memoriesUsed }: MessageListProps) {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={clsx(
            'flex',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          <div
            className={clsx(
              'max-w-[80%] rounded-2xl px-4 py-3',
              message.role === 'user'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-800 text-zinc-100'
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            
            {/* Model and memories info for assistant messages */}
            {message.role === 'assistant' && (
              <div className="mt-2 pt-2 border-t border-zinc-700 flex items-center gap-3 text-xs text-zinc-400">
                {message.model_used && (
                  <span>{message.model_used}</span>
                )}
                {index === messages.length - 1 && memoriesUsed > 0 && (
                  <span className="text-emerald-400">
                    {memoriesUsed} memories used
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### File: `src/components/chat/chat-input.tsx`

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);
  
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  }
  
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-3 max-w-3xl mx-auto">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message CORTEX..."
        disabled={isLoading}
        rows={1}
        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
      />
      <Button 
        type="submit" 
        disabled={!input.trim() || isLoading}
        className="self-end"
      >
        <Send size={18} />
      </Button>
    </form>
  );
}
```

#### File: `src/components/chat/model-selector.tsx`

```typescript
'use client';

import { clsx } from 'clsx';
import type { ModelStrength } from '@/lib/types/cognitive';

const OPTIONS: { value: ModelStrength; label: string; icon: string }[] = [
  { value: 'fast', label: 'Fast', icon: '⚡' },
  { value: 'balanced', label: 'Balanced', icon: '🎯' },
  { value: 'deep', label: 'Deep', icon: '🧠' },
];

interface ModelSelectorProps {
  value: ModelStrength;
  onChange: (value: ModelStrength) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="flex bg-zinc-800 rounded-lg p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={clsx(
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            value === option.value
              ? 'bg-zinc-700 text-zinc-100'
              : 'text-zinc-400 hover:text-zinc-200'
          )}
        >
          <span className="mr-1">{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
}
```

### 6.3 Memory Components

#### File: `src/components/memory/memory-drawer.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { MemoryList } from './memory-list';
import { MemoryEditor } from './memory-editor';
import type { Memory, CognitiveLayer } from '@/lib/types/cognitive';

interface MemoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MemoryDrawer({ isOpen, onClose }: MemoryDrawerProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterLayer, setFilterLayer] = useState<CognitiveLayer | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      fetchMemories();
    }
  }, [isOpen, filterLayer]);
  
  async function fetchMemories() {
    setIsLoading(true);
    try {
      const params = filterLayer ? `?layer=${filterLayer}` : '';
      const response = await fetch(`/api/memories${params}`);
      const data = await response.json();
      setMemories(data.memories || []);
    } catch (error) {
      console.error('Failed to fetch memories:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleSave(memory: Partial<Memory>) {
    try {
      if (editingMemory) {
        // Update
        await fetch(`/api/memories/${editingMemory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memory),
        });
      } else {
        // Create
        await fetch('/api/memories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memory),
        });
      }
      await fetchMemories();
      setEditingMemory(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to save memory:', error);
    }
  }
  
  async function handleDelete(id: string) {
    try {
      await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      await fetchMemories();
    } catch (error) {
      console.error('Failed to delete memory:', error);
    }
  }
  
  async function handleTogglePin(memory: Memory) {
    try {
      await fetch(`/api/memories/${memory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_pinned: !memory.is_pinned }),
      });
      await fetchMemories();
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-96 bg-zinc-900 border-l border-zinc-800 shadow-2xl z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100">Memories</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsCreating(true)}
              >
                <Plus size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={18} />
              </Button>
            </div>
          </div>
          
          {/* Layer filter */}
          <div className="px-4 py-2 border-b border-zinc-800">
            <select
              value={filterLayer || ''}
              onChange={(e) => setFilterLayer(e.target.value as CognitiveLayer || null)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
            >
              <option value="">All layers</option>
              <option value="identity">Identity</option>
              <option value="knowledge">Knowledge</option>
              <option value="behavioral">Behavioral</option>
              <option value="project">Project</option>
              <option value="episodic">Episodic</option>
            </select>
          </div>
          
          {/* Memory list */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <p className="text-zinc-500 text-center py-8">Loading...</p>
            ) : memories.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">
                No memories yet. Add one above.
              </p>
            ) : (
              <MemoryList
                memories={memories}
                onEdit={setEditingMemory}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
              />
            )}
          </div>
          
          {/* Editor modal */}
          {(editingMemory || isCreating) && (
            <MemoryEditor
              memory={editingMemory || undefined}
              onSave={handleSave}
              onClose={() => {
                setEditingMemory(null);
                setIsCreating(false);
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

#### File: `src/components/memory/memory-list.tsx`

```typescript
'use client';

import { Pin, Edit2, Trash2 } from 'lucide-react';
import { LayerBadge } from '../ui/badge';
import { clsx } from 'clsx';
import type { Memory } from '@/lib/types/cognitive';

interface MemoryListProps {
  memories: Memory[];
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
  onTogglePin: (memory: Memory) => void;
}

export function MemoryList({ memories, onEdit, onDelete, onTogglePin }: MemoryListProps) {
  return (
    <div className="space-y-3">
      {memories.map((memory) => (
        <div
          key={memory.id}
          className="group bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 hover:border-zinc-600 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <LayerBadge layer={memory.layer} />
                {memory.is_pinned && (
                  <Pin size={12} className="text-emerald-400" />
                )}
              </div>
              <p className="text-sm text-zinc-200 break-words">
                {memory.content}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {new Date(memory.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onTogglePin(memory)}
                className={clsx(
                  'p-1.5 rounded hover:bg-zinc-700',
                  memory.is_pinned ? 'text-emerald-400' : 'text-zinc-400'
                )}
              >
                <Pin size={14} />
              </button>
              <button
                onClick={() => onEdit(memory)}
                className="p-1.5 rounded text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => onDelete(memory.id)}
                className="p-1.5 rounded text-zinc-400 hover:bg-zinc-700 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### File: `src/components/memory/memory-editor.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import type { Memory, CognitiveLayer, MemoryType } from '@/lib/types/cognitive';

const LAYER_OPTIONS: CognitiveLayer[] = ['identity', 'knowledge', 'behavioral', 'project', 'episodic'];

const TYPE_OPTIONS: Record<CognitiveLayer, MemoryType[]> = {
  identity: ['core_value', 'self_concept', 'expertise_domain', 'communication_pref'],
  knowledge: ['fact', 'entity', 'relationship', 'mental_model', 'domain_knowledge'],
  behavioral: ['decision_pattern', 'cognitive_bias', 'workflow_habit', 'preference'],
  project: ['active_goal', 'constraint', 'decision', 'open_question', 'milestone'],
  episodic: ['event', 'conversation_summary', 'insight', 'outcome'],
};

interface MemoryEditorProps {
  memory?: Memory;
  onSave: (memory: Partial<Memory>) => void;
  onClose: () => void;
}

export function MemoryEditor({ memory, onSave, onClose }: MemoryEditorProps) {
  const [content, setContent] = useState(memory?.content || '');
  const [layer, setLayer] = useState<CognitiveLayer>(memory?.layer || 'knowledge');
  const [memoryType, setMemoryType] = useState<MemoryType>(memory?.memory_type || 'fact');
  const [isPinned, setIsPinned] = useState(memory?.is_pinned || false);
  
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    
    onSave({
      content,
      layer,
      memory_type: memoryType,
      is_pinned: isPinned,
    });
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-100">
            {memory ? 'Edit Memory' : 'Add Memory'}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="What should CORTEX remember?"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Layer</label>
              <select
                value={layer}
                onChange={(e) => {
                  const newLayer = e.target.value as CognitiveLayer;
                  setLayer(newLayer);
                  setMemoryType(TYPE_OPTIONS[newLayer][0]);
                }}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100"
              >
                {LAYER_OPTIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Type</label>
              <select
                value={memoryType}
                onChange={(e) => setMemoryType(e.target.value as MemoryType)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100"
              >
                {TYPE_OPTIONS[layer].map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/50"
            />
            Pin this memory (always include in context)
          </label>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!content.trim()}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## 7. Authentication

### 7.1 Middleware

#### File: `middleware.ts` (root)

```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### 7.2 Auth Pages

#### File: `src/app/(auth)/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push('/chat');
      router.refresh();
    }
  }
  
  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-zinc-100 text-center mb-8">
          Sign in to CORTEX
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-zinc-500 text-sm">or</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>
        
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleGoogleLogin}
        >
          Continue with Google
        </Button>
        
        <p className="text-center text-zinc-500 text-sm mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-emerald-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

#### File: `src/app/(auth)/callback/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/chat';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
```

### 7.3 Protected Layout

#### File: `src/app/chat/layout.tsx`

```typescript
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return <>{children}</>;
}
```

#### File: `src/app/chat/page.tsx`

```typescript
import { ChatInterface } from '@/components/chat/chat-interface';

export default function ChatPage() {
  return <ChatInterface />;
}
```

---

## 8. Onboarding Flow

### 8.1 Philosophy

Without connectors (Gmail, Drive), onboarding relies on:
1. **First-chat experience** — CORTEX asks about the user
2. **Auto-extraction** — Learns from the first conversation
3. **Manual teaching** — User can explicitly add memories
4. **"Teach CORTEX"** — User can paste content for extraction

### 8.2 First-Chat Detection

When a user has no memories, CORTEX should prompt them to share context.

#### File: `src/lib/cognitive/onboarding.ts`

```typescript
import { createClient } from '../supabase/server';

export async function isNewUser(userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { count } = await supabase
    .from('memories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true);
  
  return (count || 0) < 3;
}

export const ONBOARDING_SYSTEM_PROMPT = `You are CORTEX, a cognitive assistant that builds persistent memory about users.

This is a NEW USER with no context stored yet. Your goal in this first conversation is to learn about them.

Start by warmly introducing yourself, then ask them to share:
1. What they're currently working on
2. Their role or expertise
3. How they prefer to communicate (concise vs detailed, technical vs simple)

Be conversational, not interrogative. Extract information naturally.

After they share, acknowledge what you learned and offer to help with something specific.`;

export const RETURNING_USER_GREETING = `Welcome back. I remember our previous conversations. What would you like to work on today?`;
```

### 8.3 Updated Chat Route (with Onboarding)

#### Update to: `src/app/api/chat/route.ts`

Add this logic at the start of the POST handler:

```typescript
import { isNewUser, ONBOARDING_SYSTEM_PROMPT } from '@/lib/cognitive/onboarding';

// Inside POST handler, after authentication:

// Check if new user (for first-chat experience)
const newUser = await isNewUser(user.id);

// If new user and this is first message, use onboarding prompt
let effectiveSystemPrompt: string;

if (newUser && !conversationId) {
  // First conversation for new user - use onboarding prompt
  effectiveSystemPrompt = ONBOARDING_SYSTEM_PROMPT;
} else {
  // Normal flow - build protocol context
  const protocolContext = buildProtocolContext(profile, memories, analysis);
  effectiveSystemPrompt = buildSystemPrompt(protocolContext);
}

// Use effectiveSystemPrompt instead of systemPrompt in streamText call
```

### 8.4 Onboarding UI State

#### Update to: `src/components/chat/chat-interface.tsx`

Add empty state with onboarding prompt:

```typescript
// In the empty messages state:
{messages.length === 0 ? (
  <div className="flex flex-col items-center justify-center h-full text-center px-4">
    <div className="max-w-md">
      <h2 className="text-2xl font-semibold text-zinc-100 mb-3">
        Welcome to CORTEX
      </h2>
      <p className="text-zinc-400 mb-6">
        I'm your cognitive assistant. I remember our conversations and learn your preferences over time.
      </p>
      <p className="text-zinc-500 text-sm">
        Start by telling me about yourself and what you're working on.
      </p>
    </div>
  </div>
) : (
  <MessageList messages={messages} memoriesUsed={lastMemoriesUsed.length} />
)}
```

---

## 9. Teach CORTEX Feature

### 9.1 Overview

Users can explicitly teach CORTEX by pasting content (emails, notes, documents). CORTEX extracts structured memories and shows them for confirmation.

### 9.2 Teach API Route

#### File: `src/app/api/teach/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { generateEmbedding } from '@/lib/ai/embeddings';

const openai = createOpenAI();

const ExtractionSchema = z.array(z.object({
  type: z.string(),
  layer: z.enum(['identity', 'knowledge', 'behavioral', 'project', 'episodic']),
  content: z.string(),
  confidence: z.number().min(0).max(1),
}));

const TEACH_EXTRACTION_PROMPT = `You are CORTEX's Knowledge Extractor. Analyze this content and extract structured memories.

For each distinct piece of information, output:
- type: The memory type (core_value, expertise_domain, fact, preference, active_goal, constraint, decision, insight, etc.)
- layer: identity | knowledge | behavioral | project | episodic
- content: Dense statement (remove filler words, use noun phrases)
- confidence: 0-1 (1.0 if explicitly stated, lower if inferred)

LAYER GUIDE:
- identity: Core values, expertise, self-concept, communication preferences (stable, rarely changes)
- knowledge: Facts, entities, relationships, domain expertise (grows over time)
- behavioral: Decision patterns, habits, workflow preferences (patterns)
- project: Active goals, constraints, decisions, open questions (current work)
- episodic: Events, conversations, insights, outcomes (time-bound)

EXTRACTION RULES:
1. One concept per memory (split compound statements)
2. Dense content: "Prefers async communication" not "The user mentioned they prefer async"
3. Skip vague or hypothetical statements
4. Higher confidence for explicit statements ("I always..." = 1.0)
5. Lower confidence for implied information (0.6-0.8)

CONTENT TO ANALYZE:
`;

// POST - Extract memories from pasted content
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { content } = await request.json();
  
  if (!content?.trim() || content.length < 20) {
    return NextResponse.json({ error: 'Content too short' }, { status: 400 });
  }
  
  if (content.length > 50000) {
    return NextResponse.json({ error: 'Content too long (max 50k chars)' }, { status: 400 });
  }
  
  try {
    // Extract memories using LLM
    const { object: extractions } = await generateObject({
      model: openai('gpt-4o'),
      schema: ExtractionSchema,
      prompt: TEACH_EXTRACTION_PROMPT + content,
    });
    
    // Return extractions for user confirmation (don't save yet)
    return NextResponse.json({ 
      extractions: extractions || [],
      message: `Found ${extractions?.length || 0} potential memories`
    });
    
  } catch (error) {
    console.error('Extraction failed:', error);
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 });
  }
}

// PUT - Confirm and save selected memories
export async function PUT(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { memories } = await request.json();
  
  if (!Array.isArray(memories) || memories.length === 0) {
    return NextResponse.json({ error: 'No memories to save' }, { status: 400 });
  }
  
  let saved = 0;
  
  for (const memory of memories) {
    try {
      const embedding = await generateEmbedding(memory.content);
      
      const { error } = await supabase.from('memories').insert({
        user_id: user.id,
        content: memory.content,
        content_embedding: embedding,
        layer: memory.layer,
        memory_type: memory.type,
        source: 'user_explicit',
        confidence: memory.confidence || 1.0,
      });
      
      if (!error) saved++;
    } catch (error) {
      console.error('Failed to save memory:', error);
    }
  }
  
  return NextResponse.json({ saved, total: memories.length });
}
```

### 9.3 Teach Modal Component

#### File: `src/components/memory/teach-modal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { LayerBadge } from '../ui/badge';
import { X, Check, Loader2, Sparkles } from 'lucide-react';
import type { CognitiveLayer } from '@/lib/types/cognitive';

interface ExtractedMemory {
  type: string;
  layer: CognitiveLayer;
  content: string;
  confidence: number;
  selected?: boolean;
}

interface TeachModalProps {
  onClose: () => void;
  onComplete: () => void;
}

export function TeachModal({ onClose, onComplete }: TeachModalProps) {
  const [content, setContent] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractions, setExtractions] = useState<ExtractedMemory[]>([]);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'review'>('input');
  
  async function handleExtract() {
    if (!content.trim() || content.length < 20) {
      setError('Please enter more content (at least 20 characters)');
      return;
    }
    
    setIsExtracting(true);
    setError('');
    
    try {
      const response = await fetch('/api/teach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Extraction failed');
      }
      
      if (data.extractions.length === 0) {
        setError('No memories could be extracted. Try adding more specific information.');
        return;
      }
      
      // Pre-select all extractions
      setExtractions(data.extractions.map((e: ExtractedMemory) => ({ ...e, selected: true })));
      setStep('review');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed');
    } finally {
      setIsExtracting(false);
    }
  }
  
  async function handleSave() {
    const selected = extractions.filter(e => e.selected);
    if (selected.length === 0) {
      setError('Select at least one memory to save');
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    try {
      const response = await fetch('/api/teach', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memories: selected }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Save failed');
      }
      
      onComplete();
      onClose();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  }
  
  function toggleSelection(index: number) {
    setExtractions(prev => prev.map((e, i) => 
      i === index ? { ...e, selected: !e.selected } : e
    ));
  }
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="text-emerald-400" size={20} />
            <h3 className="text-lg font-semibold text-zinc-100">Teach CORTEX</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'input' ? (
            <div className="space-y-4">
              <p className="text-zinc-400 text-sm">
                Paste any content — emails, notes, documents, chat logs — and CORTEX will extract memories from it.
              </p>
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder="Paste your content here...

Examples:
- Email threads about a project
- Meeting notes
- Personal reflections
- Technical documentation
- Anything you want CORTEX to remember"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              
              <p className="text-zinc-500 text-xs">
                {content.length} characters • Min 20, Max 50,000
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-zinc-400 text-sm">
                Review extracted memories. Uncheck any you don't want to save.
              </p>
              
              <div className="space-y-2">
                {extractions.map((extraction, index) => (
                  <div
                    key={index}
                    onClick={() => toggleSelection(index)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      extraction.selected 
                        ? 'bg-zinc-800/80 border-emerald-500/50' 
                        : 'bg-zinc-800/30 border-zinc-700/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center ${
                        extraction.selected 
                          ? 'bg-emerald-500 border-emerald-500' 
                          : 'border-zinc-600'
                      }`}>
                        {extraction.selected && <Check size={14} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <LayerBadge layer={extraction.layer} />
                          <span className="text-xs text-zinc-500">
                            {extraction.type.replace(/_/g, ' ')} • {Math.round(extraction.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-sm text-zinc-200">{extraction.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-zinc-500 text-sm">
                {extractions.filter(e => e.selected).length} of {extractions.length} selected
              </p>
            </div>
          )}
          
          {error && (
            <p className="text-red-400 text-sm mt-4">{error}</p>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-zinc-800">
          {step === 'review' && (
            <Button 
              variant="ghost" 
              onClick={() => {
                setStep('input');
                setExtractions([]);
              }}
            >
              ← Back
            </Button>
          )}
          <div className="flex-1" />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {step === 'input' ? (
              <Button onClick={handleExtract} disabled={isExtracting || content.length < 20}>
                {isExtracting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Extracting...
                  </>
                ) : (
                  'Extract Memories'
                )}
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={isSaving || extractions.filter(e => e.selected).length === 0}>
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  `Save ${extractions.filter(e => e.selected).length} Memories`
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 9.4 Add Teach Button to Memory Drawer

#### Update to: `src/components/memory/memory-drawer.tsx`

Add import and state:

```typescript
import { TeachModal } from './teach-modal';

// Add state
const [showTeach, setShowTeach] = useState(false);
```

Add button in header (next to the + button):

```typescript
<Button 
  variant="ghost" 
  size="sm"
  onClick={() => setShowTeach(true)}
  title="Teach CORTEX"
>
  <Sparkles size={16} />
</Button>
```

Add modal render at the bottom:

```typescript
{/* Teach modal */}
{showTeach && (
  <TeachModal 
    onClose={() => setShowTeach(false)}
    onComplete={fetchMemories}
  />
)}
```

---

## 10. Migration from POC

### 10.1 Overview

If you have an existing proof-of-concept with hardcoded memories (in `memories.ts`), this section helps migrate that data to the Supabase database.

### 10.2 Seed Script

#### File: `scripts/seed-memories.ts`

Run with: `npx ts-node scripts/seed-memories.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const USER_EMAIL = 'your-email@example.com'; // Change to your email

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Your existing memories from POC
// Copy your memories array from your proof-of-concept here
const SEED_MEMORIES = [
  // Identity layer
  {
    content: "Solo founder building CORTEX, a cognitive middleware layer",
    layer: "identity",
    memory_type: "self_concept",
  },
  {
    content: "Systems thinker who approaches problems with first principles",
    layer: "identity",
    memory_type: "self_concept",
  },
  {
    content: "Prefers concise technical responses with empirical backing",
    layer: "identity", 
    memory_type: "communication_pref",
  },
  {
    content: "Values being challenged rather than agreed with",
    layer: "identity",
    memory_type: "core_value",
  },
  
  // Knowledge layer
  {
    content: "Context injection meaningfully improves AI output quality (validated)",
    layer: "knowledge",
    memory_type: "fact",
  },
  {
    content: "Memory retrieval quality is the moat, not storage",
    layer: "knowledge",
    memory_type: "insight",
  },
  
  // Project layer
  {
    content: "Building CORTEX MVP with layered cognitive architecture",
    layer: "project",
    memory_type: "active_goal",
  },
  {
    content: "Pre-funding, solo founder constraints",
    layer: "project",
    memory_type: "constraint",
  },
  {
    content: "Chose Supabase + Vercel stack for speed and solo-friendliness",
    layer: "project",
    memory_type: "decision",
  },
  
  // Behavioral layer
  {
    content: "Validates with customers before major pivots",
    layer: "behavioral",
    memory_type: "decision_pattern",
  },
  {
    content: "Prefers to prove concepts before bringing on team",
    layer: "behavioral",
    memory_type: "decision_pattern",
  },
  
  // Add more memories from your POC...
];

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 1536,
  });
  return response.data[0].embedding;
}

async function seed() {
  console.log('Starting seed process...\n');
  
  // Get user by email
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('Failed to list users:', userError);
    return;
  }
  
  const user = users.users.find(u => u.email === USER_EMAIL);
  
  if (!user) {
    console.error(`User not found: ${USER_EMAIL}`);
    console.log('Available users:', users.users.map(u => u.email));
    return;
  }
  
  console.log(`Found user: ${user.email} (${user.id})\n`);
  
  // Clear existing memories (optional)
  const { error: deleteError } = await supabase
    .from('memories')
    .delete()
    .eq('user_id', user.id);
  
  if (deleteError) {
    console.error('Failed to clear existing memories:', deleteError);
  } else {
    console.log('Cleared existing memories\n');
  }
  
  // Insert new memories
  let success = 0;
  let failed = 0;
  
  for (const memory of SEED_MEMORIES) {
    try {
      console.log(`Processing: ${memory.content.substring(0, 50)}...`);
      
      const embedding = await generateEmbedding(memory.content);
      
      const { error } = await supabase.from('memories').insert({
        user_id: user.id,
        content: memory.content,
        content_embedding: embedding,
        layer: memory.layer,
        memory_type: memory.memory_type,
        source: 'user_explicit',
        confidence: 1.0,
        is_active: true,
        is_pinned: false,
      });
      
      if (error) {
        console.error(`  ✗ Failed:`, error.message);
        failed++;
      } else {
        console.log(`  ✓ Saved`);
        success++;
      }
      
      // Rate limit
      await new Promise(r => setTimeout(r, 200));
      
    } catch (err) {
      console.error(`  ✗ Error:`, err);
      failed++;
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Seed complete: ${success} saved, ${failed} failed`);
}

seed().catch(console.error);
```

### 10.3 Running the Seed

```bash
# Install ts-node if needed
npm install -D ts-node

# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export SUPABASE_SERVICE_ROLE_KEY="your-key"
export OPENAI_API_KEY="your-key"

# Run seed
npx ts-node scripts/seed-memories.ts
```

### 10.4 Manual Migration Alternative

If you prefer manual entry:

1. Sign up / log in to your deployed CORTEX
2. Open the Memory Drawer
3. Click "+" to add each memory
4. Or use "Teach CORTEX" to paste your POC memories as text and extract them

---

## 11. Deployment

### 11.1 Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Go to SQL Editor, run `001_initial_schema.sql`
3. Enable Google OAuth in Authentication > Providers
4. Copy API keys from Settings > API

### 11.2 Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - OPENAI_API_KEY
# - ANTHROPIC_API_KEY
```

### 11.3 vercel.json

```json
{
  "functions": {
    "src/app/api/chat/route.ts": {
      "maxDuration": 60
    }
  }
}
```

### 11.4 next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
```

---

## 12. Cost Estimation

### 12.1 API Costs Breakdown

| Service | Cost Basis | Estimate |
|---------|------------|----------|
| **OpenAI Embeddings** | $0.02 / 1M tokens | ~$0.002 per memory stored |
| **GPT-4o-mini** (analysis) | $0.15 / 1M input | ~$0.0001 per query analysis |
| **GPT-4o** (deep mode) | $2.50 / 1M input | ~$0.005 per deep chat |
| **Claude Sonnet** (balanced) | $3.00 / 1M input | ~$0.004 per balanced chat |

### 12.2 Usage Scenarios

| Scenario | Chats/Day | Memories | Monthly API Cost |
|----------|-----------|----------|------------------|
| **Light** (beta testing) | 50 | 200 | ~$15-30 |
| **Medium** (10 active users) | 200 | 1,000 | ~$50-100 |
| **Growth** (50 active users) | 1,000 | 5,000 | ~$200-400 |
| **Scale** (200 active users) | 5,000 | 20,000 | ~$800-1,500 |

### 12.3 Infrastructure Costs

| Service | Free Tier | Pro Tier |
|---------|-----------|----------|
| **Supabase** | 500MB DB, 1GB storage, 2GB bandwidth | $25/mo (8GB DB, 100GB storage) |
| **Vercel** | 100GB bandwidth, serverless functions | $20/mo (1TB bandwidth, more compute) |

### 12.4 Cost Optimization Strategies

1. **Use GPT-4o-mini for analysis** — 10x cheaper than GPT-4o, sufficient for classification
2. **Cache cognitive profiles** — Don't rebuild on every request
3. **Batch embedding generation** — When teaching CORTEX with multiple memories
4. **Token budgeting** — Already implemented, prevents context explosion
5. **Model routing** — Use fast/cheap models for simple queries

### 12.5 Projected Costs for First 6 Months

| Month | Users | API Cost | Infra Cost | Total |
|-------|-------|----------|------------|-------|
| 1 | 10 | $30 | $0 | $30 |
| 2 | 25 | $75 | $0 | $75 |
| 3 | 50 | $150 | $25 | $175 |
| 4 | 100 | $300 | $45 | $345 |
| 5 | 150 | $450 | $45 | $495 |
| 6 | 200 | $600 | $45 | $645 |

**Total 6-month runway needed: ~$1,800** (conservative)

---

## 13. Post-Launch Checklist

### Before Launch

- [ ] Run database migrations
- [ ] Test auth flow (email + Google)
- [ ] Test chat with all model strengths
- [ ] Test memory CRUD
- [ ] Verify streaming works
- [ ] Check mobile responsiveness
- [ ] Set up error monitoring (Sentry optional)

### After Launch

- [ ] Monitor Supabase usage
- [ ] Monitor API costs (OpenAI/Anthropic)
- [ ] Collect user feedback
- [ ] Track: sign-ups, D1/D7 retention, memories created
- [ ] Iterate based on feedback

### Success Metrics (First 30 Days)

| Metric | Target |
|--------|--------|
| Sign-ups | 50+ |
| D7 Retention | >20% |
| Avg memories per user | >5 |
| Chat sessions per user | >3 |

---

## Quick Start for AI Coding Agent

### Initial Setup
```
1. Read this ENTIRE document first to understand the architecture
2. Create Next.js project with dependencies (Section 2.1)
3. Set up file structure (Section 2.2)
4. Create .env.local with required variables (Section 2.3)
```

### Database Setup
```
5. Create Supabase project at supabase.com
6. Run database migration in SQL Editor (Section 3)
7. Enable Google OAuth in Authentication > Providers
8. Copy API keys to .env.local
```

### Implementation Order
```
9. Implement Supabase clients (Section 4.1)
10. Add type definitions (Section 4.2)
11. Implement AI utilities (Section 4.3)
12. Implement cognitive system (Section 4.4)
13. Implement API routes (Section 5)
14. Implement UI components (Section 6)
15. Set up authentication (Section 7)
16. Add onboarding flow (Section 8)
17. Add Teach CORTEX feature (Section 9)
```

### Testing & Deployment
```
18. Test locally: npm run dev
19. Run seed script if migrating from POC (Section 10)
20. Deploy to Vercel (Section 11)
21. Verify all flows work in production
```

### Key Files in Order
```
src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/lib/supabase/admin.ts
src/lib/types/cognitive.ts
src/lib/ai/embeddings.ts
src/lib/ai/models.ts
src/lib/cognitive/query-analyzer.ts
src/lib/cognitive/retrieval.ts
src/lib/cognitive/extraction.ts
src/lib/cognitive/onboarding.ts
src/lib/protocol/cortex-protocol.ts
src/app/api/chat/route.ts
src/app/api/memories/route.ts
src/app/api/memories/[id]/route.ts
src/app/api/teach/route.ts
src/components/ui/*.tsx
src/components/chat/*.tsx
src/components/memory/*.tsx
src/app/(auth)/*.tsx
src/app/chat/page.tsx
middleware.ts
```

### Testing Checklist Before Launch
```
[ ] Auth flow works (signup, login, logout, Google OAuth)
[ ] New user sees onboarding welcome message
[ ] Can create memories manually
[ ] Can use "Teach CORTEX" to extract memories from pasted content
[ ] Chat works with memory context injection
[ ] Model selector changes which model is used
[ ] Memory drawer shows memories with layer badges
[ ] Can pin/edit/delete memories
[ ] Memories used shows in assistant messages
```

---

**This completes the CORTEX V3 MVP Implementation Guide.**
