// ============================================================================
// CORTEX COGNITIVE ARCHITECTURE - TYPE DEFINITIONS
// v2.0 - Layered Memory System
// ============================================================================

// ----------------------------------------------------------------------------
// COGNITIVE LAYER TYPES
// ----------------------------------------------------------------------------

/**
 * The five cognitive layers that organize memory and context
 */
export type CognitiveLayer = 
  | 'identity'    // Core stable information about the user
  | 'knowledge'   // Facts, entities, relationships
  | 'behavioral'  // Patterns, preferences, tendencies
  | 'project'     // Active work context
  | 'episodic';   // Time-bound experiences

/**
 * Specific memory types within each layer
 */
export type MemoryType =
  // Identity layer types
  | 'core_value'
  | 'self_concept'
  | 'expertise_domain'
  | 'communication_pref'
  // Knowledge layer types
  | 'fact'
  | 'entity'
  | 'relationship'
  | 'mental_model'
  | 'domain_knowledge'
  // Behavioral layer types
  | 'decision_pattern'
  | 'cognitive_bias'
  | 'workflow_habit'
  | 'preference'
  // Project layer types
  | 'active_goal'
  | 'constraint'
  | 'decision'
  | 'open_question'
  | 'milestone'
  // Episodic layer types
  | 'event'
  | 'conversation_summary'
  | 'insight'
  | 'outcome';

/**
 * Temporal scope of a memory
 */
export type TemporalScope = 
  | 'permanent'  // Unlikely to change (values, expertise)
  | 'current'    // True now, may change (projects, preferences)
  | 'dated'      // Specific to a time period
  | 'expired';   // No longer valid

/**
 * Source of a memory
 */
export type MemorySource =
  | 'user_explicit'   // User directly stated
  | 'user_implicit'   // Extracted from user's messages
  | 'extracted'       // Extracted from connected sources
  | 'inferred'        // AI inferred from patterns
  | 'connector';      // From external connector

// ----------------------------------------------------------------------------
// QUERY ANALYSIS TYPES
// ----------------------------------------------------------------------------

/**
 * Classified intent of a user query
 */
export type QueryIntent =
  | 'factual'      // Asking for information
  | 'decision'     // Making a choice
  | 'creative'     // Generating content
  | 'task'         // Completing work
  | 'reflection'   // Thinking about self/past
  | 'continuation'; // Continuing previous context

/**
 * Complexity level of a query
 */
export type QueryComplexity = 'simple' | 'moderate' | 'complex';

/**
 * Model strength/tier for routing
 */
export type ModelStrength = 'fast' | 'balanced' | 'deep';

/**
 * Result of query analysis
 */
export interface QueryAnalysis {
  input: string;
  intent: QueryIntent;
  complexity: QueryComplexity;
  entities: string[];
  layerRelevance: Record<CognitiveLayer, number>;
  suggestedModel: ModelStrength;
  suggestedBudget: Record<CognitiveLayer, number>;
}

// ----------------------------------------------------------------------------
// MEMORY TYPES (V2)
// ----------------------------------------------------------------------------

/**
 * Entity reference within a memory
 */
export interface EntityReference {
  type: 'person' | 'company' | 'project' | 'concept' | 'place';
  name: string;
  id?: string;
  role?: string;
}

/**
 * Enhanced memory structure for v2
 */
export interface MemoryV2 {
  id: string;
  content: string;
  layer: CognitiveLayer;
  memoryType: MemoryType;
  temporalScope: TemporalScope;
  source: MemorySource;
  confidence: number; // 0-1
  entities: EntityReference[];
  embedding?: number[];
  
  // Metadata
  accessCount: number;
  lastAccessed?: string;
  retrievalBoost: number; // 0.1-10.0
  isPinned: boolean;
  isActive: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  validFrom?: string;
  validUntil?: string;
}

/**
 * Memory with retrieval score
 */
export interface ScoredMemory {
  memory: MemoryV2;
  score: number;
  components: {
    semantic: number;
    recency: number;
    frequency: number;
    confidence: number;
    entityMatch: number;
    boost: number;
  };
}

// ----------------------------------------------------------------------------
// RETRIEVAL TYPES
// ----------------------------------------------------------------------------

/**
 * Result from querying a single layer
 */
export interface LayerRetrievalResult {
  layer: CognitiveLayer;
  memories: ScoredMemory[];
  tokenBudget: number;
  totalTokens: number;
}

/**
 * Complete layered context from retrieval
 */
export interface LayeredContext {
  identity: LayerRetrievalResult | null;
  knowledge: LayerRetrievalResult | null;
  behavioral: LayerRetrievalResult | null;
  project: LayerRetrievalResult | null;
  episodic: LayerRetrievalResult | null;
}

// ----------------------------------------------------------------------------
// PROTOCOL TYPES
// ----------------------------------------------------------------------------

/**
 * Identity block for protocol
 */
export interface ProtocolIdentity {
  name: string;
  role?: string;
  expertise: string[];
  values: string[];
  style: string;
}

/**
 * Knowledge entry for protocol
 */
export interface ProtocolKnowledge {
  id: string;
  content: string;
  entities: string[];
  confidence: number;
  layer: CognitiveLayer;
}

/**
 * Entity for protocol
 */
export interface ProtocolEntity {
  id: string;
  type: string;
  name: string;
  attributes: Record<string, string>;
  relationships: Array<{ type: string; target: string }>;
}

/**
 * Behavioral patterns for protocol
 */
export interface ProtocolBehavioral {
  preferences: string[];   // +items (do this)
  avoidances: string[];    // -items (don't do this)
  patterns: string[];      // ~items (tendencies)
}

/**
 * Project context for protocol
 */
export interface ProtocolProject {
  id: string;
  name: string;
  status: string;
  goals: string[];
  constraints: string[];
  decisions: string[];
  openQuestions: string[];
}

/**
 * History entry for protocol
 */
export interface ProtocolHistory {
  timestamp: string;
  summary: string;
}

/**
 * Query block for protocol
 */
export interface ProtocolQuery {
  input: string;
  intent: QueryIntent;
  context?: string;
}

/**
 * Response specification for protocol
 */
export interface ProtocolResponseSpec {
  format: 'structured' | 'prose' | 'code' | 'mixed';
  length: 'brief' | 'standard' | 'detailed';
  include: string[];
  avoid: string[];
}

/**
 * System settings for protocol
 */
export interface ProtocolSystem {
  role: string;
  version: string;
  userId: string;
}

/**
 * Complete protocol context
 */
export interface ProtocolContext {
  system: ProtocolSystem;
  identity: ProtocolIdentity;
  knowledge: ProtocolKnowledge[];
  entities: ProtocolEntity[];
  behavioral: ProtocolBehavioral;
  project?: ProtocolProject;
  history: ProtocolHistory[];
  query: ProtocolQuery;
  responseSpec: ProtocolResponseSpec;
}

// ----------------------------------------------------------------------------
// COGNITIVE PROFILE (ENHANCED)
// ----------------------------------------------------------------------------

/**
 * Enhanced cognitive profile with v2 structure
 */
export interface CognitiveProfileV2 {
  // Identity
  name?: string;
  role?: string;
  timezone?: string;
  
  // Expertise
  expertiseDomains: string[];
  
  // Cognitive style
  strengths: string[];
  learningStyle: string[];
  decisionStyle: string[];
  blindSpots: string[];
  
  // Values and motivations
  coreValues: string[];
  motivations: string[];
  
  // Communication
  communicationStyle: string;
  preferredFormat: 'structured' | 'prose' | 'mixed';
  verbosity: 'brief' | 'standard' | 'detailed';
  
  // Operating instructions
  alwaysDo: string[];
  neverDo: string[];
}

// ----------------------------------------------------------------------------
// LAYER MAPPING
// ----------------------------------------------------------------------------

/**
 * Maps memory types to their parent layers
 */
export const MEMORY_TYPE_TO_LAYER: Record<MemoryType, CognitiveLayer> = {
  // Identity
  core_value: 'identity',
  self_concept: 'identity',
  expertise_domain: 'identity',
  communication_pref: 'identity',
  // Knowledge
  fact: 'knowledge',
  entity: 'knowledge',
  relationship: 'knowledge',
  mental_model: 'knowledge',
  domain_knowledge: 'knowledge',
  // Behavioral
  decision_pattern: 'behavioral',
  cognitive_bias: 'behavioral',
  workflow_habit: 'behavioral',
  preference: 'behavioral',
  // Project
  active_goal: 'project',
  constraint: 'project',
  decision: 'project',
  open_question: 'project',
  milestone: 'project',
  // Episodic
  event: 'episodic',
  conversation_summary: 'episodic',
  insight: 'episodic',
  outcome: 'episodic',
};

/**
 * Maps legacy categories to cognitive layers
 */
export const LEGACY_CATEGORY_TO_LAYER: Record<string, CognitiveLayer> = {
  identity: 'identity',
  value: 'identity',
  goal: 'project',
  preference: 'behavioral',
  constraint: 'project',
  project: 'project',
  domain: 'knowledge',
  relationship: 'knowledge',
  personal: 'identity',
  timeline: 'episodic',
  health: 'knowledge',
  finance: 'knowledge',
  travel: 'episodic',
  hobby: 'knowledge',
};

/**
 * Maps legacy categories to memory types
 */
export const LEGACY_CATEGORY_TO_TYPE: Record<string, MemoryType> = {
  identity: 'self_concept',
  value: 'core_value',
  goal: 'active_goal',
  preference: 'preference',
  constraint: 'constraint',
  project: 'active_goal',
  domain: 'domain_knowledge',
  relationship: 'relationship',
  personal: 'self_concept',
  timeline: 'event',
  health: 'fact',
  finance: 'fact',
  travel: 'event',
  hobby: 'preference',
};
