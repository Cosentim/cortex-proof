# CORTEX Cognitive Architecture v2.0

## Implementation Guide for AI Coding Assistants

**Document Version:** 2.0  
**Created:** December 2024  
**Purpose:** Complete implementation specification for CORTEX's cognitive layer, memory navigation, CORTEX Protocol, and connector integrations.

---

## Git Strategy Recommendation

**CREATE A NEW BRANCH.** This is a significant architectural evolution.

```bash
git checkout -b feature/cognitive-architecture-v2
```

Rationale:
- Schema changes require migration (breaking change)
- New modules can be developed in isolation
- Allows parallel testing against v1
- Clean rollback path if needed

Merge strategy:
1. Complete all modules on feature branch
2. Test thoroughly
3. Create migration script for existing data
4. Merge to main with squash commit

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema v2](#2-database-schema-v2)
3. [Type Definitions](#3-type-definitions)
4. [CORTEX Protocol Specification](#4-cortex-protocol-specification)
5. [Query Analysis & Navigation](#5-query-analysis--navigation)
6. [Hierarchical Retrieval System](#6-hierarchical-retrieval-system)
7. [Extraction System](#7-extraction-system)
8. [Connector Integration](#8-connector-integration)
9. [Self-Improving Loop](#9-self-improving-loop)
10. [Migration Guide](#10-migration-guide)

---

## 1. Architecture Overview

### System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INPUT                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         QUERY ANALYZER                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ Intent Classify │  │ Entity Extract  │  │ Layer Relevance │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      HIERARCHICAL RETRIEVAL                                  │
│                                                                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│   │ IDENTITY │  │KNOWLEDGE │  │BEHAVIORAL│  │ PROJECT  │  │ EPISODIC │    │
│   │  Layer   │  │  Layer   │  │  Layer   │  │  Layer   │  │  Layer   │    │
│   │ (cached) │  │ (vector) │  │ (vector) │  │ (active) │  │ (recent) │    │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│        │             │             │             │             │            │
│        └─────────────┴─────────────┴─────────────┴─────────────┘            │
│                                    │                                         │
│                          Cross-Layer Synthesis                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PROTOCOL ENCODER                                       │
│  Converts retrieved context → CORTEX Protocol format                         │
│  Target: 60-70% token reduction vs natural language                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MODEL ROUTER                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │      FAST       │  │    BALANCED     │  │      DEEP       │             │
│  │  Haiku / Mini   │  │ Sonnet / GPT-4o │  │  Opus / o1      │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RESPONSE                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OBSERVER                                             │
│  Extract learnings → Update cognitive model → Log analytics                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Layered Memory**: Different types of information serve different purposes
2. **Smart Navigation**: Query analysis determines which layers to search
3. **Token Efficiency**: CORTEX Protocol minimizes context size
4. **Continuous Learning**: Every interaction improves the cognitive model
5. **User Control**: All memories visible, editable, deletable

---

## 2. Cognitive Layers

### Layer Definitions

| Layer | Purpose | Retrieval Strategy | Update Frequency |
|-------|---------|-------------------|------------------|
| **Identity** | Core stable info (name, values, expertise) | Cached, always included | Rare |
| **Knowledge** | Facts, entities, relationships | Vector similarity | As learned |
| **Behavioral** | Patterns, preferences, tendencies | Vector + recency | Observed |
| **Project** | Active work context | Active project filter | Per session |
| **Episodic** | Time-bound experiences | Recency weighted | Each interaction |

---

## 3. Type Definitions

### Cognitive Types

```typescript
export type CognitiveLayer = 
  | 'identity'
  | 'knowledge'
  | 'behavioral'
  | 'project'
  | 'episodic';

export type MemoryType =
  // Identity
  | 'core_value'
  | 'self_concept'
  | 'expertise_domain'
  | 'communication_pref'
  // Knowledge
  | 'fact'
  | 'entity'
  | 'relationship'
  | 'mental_model'
  | 'domain_knowledge'
  // Behavioral
  | 'decision_pattern'
  | 'cognitive_bias'
  | 'workflow_habit'
  | 'preference'
  // Project
  | 'active_goal'
  | 'constraint'
  | 'decision'
  | 'open_question'
  | 'milestone'
  // Episodic
  | 'event'
  | 'conversation_summary'
  | 'insight'
  | 'outcome';

export type TemporalScope = 
  | 'permanent'
  | 'current'
  | 'dated'
  | 'expired';

export type MemorySource =
  | 'user_explicit'
  | 'user_implicit'
  | 'extracted'
  | 'inferred'
  | 'connector';

export type QueryIntent =
  | 'factual'
  | 'decision'
  | 'creative'
  | 'task'
  | 'reflection'
  | 'continuation';

export type QueryComplexity = 'simple' | 'moderate' | 'complex';
export type ModelStrength = 'fast' | 'balanced' | 'deep';
```

---

## 4. CORTEX Protocol Specification

The CORTEX Protocol is a structured, token-efficient format for AI-to-AI context communication.

### Protocol Header (Decoder Instructions)

```
CORTEX/1.0 - Protocol version identifier

@SYS - System settings
@ID - User identity (stable)
@K - Knowledge entries (relevant facts)
@E - Entities (people, companies, projects)
@B - Behavioral patterns
@P - Active project context
@H - Relevant history
@Q - The actual query
@R - How to respond
```

### Key Benefits
- 60-70% token reduction vs natural language
- Structured for reliable parsing
- Human-readable for debugging
- Extensible for new block types

---

## 5. Implementation Order

For this proof of concept, we'll implement in phases:

### Phase 1: Type System & Protocol (Current Focus)
1. Add type definitions
2. Implement CORTEX Protocol encoder
3. Integrate with existing context builder

### Phase 2: Query Analysis
1. Intent classification
2. Layer relevance scoring
3. Token budget allocation

### Phase 3: Enhanced Retrieval
1. Migrate memories to layered structure
2. Implement per-layer retrieval
3. Cross-layer synthesis

### Phase 4: Learning Loop
1. Interaction logging
2. Memory consolidation
3. Pattern extraction

---

## Quick Reference

### File Structure (Target)

```
src/
├── types/
│   └── cognitive.ts              # All type definitions
├── lib/
│   ├── protocol/
│   │   └── cortex-protocol.ts    # Protocol encoder/decoder
│   ├── cognitive/
│   │   ├── query-analyzer.ts     # Intent classification
│   │   └── retrieval.ts          # Hierarchical retrieval
│   └── utils/
│       └── tokens.ts             # Token estimation utilities
├── memories.ts                   # Memory store (enhanced)
├── context-builder.ts            # Context assembly
├── embeddings.ts                 # Embedding generation
├── compare.ts                    # Comparison tool
└── index.ts                      # Entry point
```

---

**This document serves as the north star for CORTEX evolution.**
