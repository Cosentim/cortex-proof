// ============================================================================
// CORTEX COGNITIVE TYPES - V3 MVP
// ============================================================================

export type CognitiveLayer = 
  | 'identity'
  | 'preferences'
  | 'knowledge'
  | 'relational'
  | 'temporal';

export type MemoryType =
  // Identity
  | 'core_value' | 'belief' | 'personality_trait' | 'background' | 'goal' | 'self_description'
  // Preferences
  | 'communication_style' | 'aesthetic_preference' | 'tool_preference' | 'learning_style' | 'work_style'
  // Knowledge
  | 'skill' | 'expertise' | 'domain_knowledge' | 'methodology' | 'project_context'
  // Relational
  | 'relationship' | 'social_preference' | 'collaboration_style'
  // Temporal
  | 'life_event' | 'milestone' | 'recurring_pattern';

export type TemporalScope = 'permanent' | 'current' | 'dated' | 'expired';

export type MemorySource = 'conversation' | 'teach' | 'onboarding' | 'manual' | 'extracted' | 'inferred';

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
  source: MemorySource;
  confidence: number;
  metadata: Record<string, unknown>;
  access_count: number;
  retrieval_boost: number;
  is_active: boolean;
  is_pinned: boolean;
  last_accessed_at: string | null;
  created_at: string;
  updated_at: string;
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

export interface CognitiveProfile {
  summary?: string;
  communication_style?: string;
  expertise_areas?: string[];
  core_values?: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  cognitive_profile: CognitiveProfile;
  preferences: {
    model?: ModelStrength;
    theme?: 'light' | 'dark' | 'system';
  };
  onboarding_progress: Record<string, { completed: boolean; timestamp: string }>;
  created_at: string;
  updated_at: string;
}

// Protocol types
export interface ProtocolContext {
  fullContext: string;
  tokenEstimate: number;
  includedLayers: CognitiveLayer[];
  memoryCount: number;
}
