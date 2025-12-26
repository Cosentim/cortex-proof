// ============================================================================
// CONTEXT BUILDER V2
// Bridge between v1 memories and v2 CORTEX Protocol
// ============================================================================

import { Memory, cognitiveProfile, operatingInstructions } from '../memories';
import {
  encodeProtocol,
  buildSystemPrompt,
  estimateTokens,
  compareEncodings,
  PROTOCOL_DECODER,
} from './protocol/cortex-protocol';
import { analyzeQuery } from './cognitive/query-analyzer';
import type {
  ProtocolContext,
  ProtocolIdentity,
  ProtocolKnowledge,
  ProtocolBehavioral,
  ProtocolResponseSpec,
  CognitiveLayer,
  QueryIntent,
  CognitiveProfileV2,
} from '../types/cognitive';
import { LEGACY_CATEGORY_TO_LAYER, LEGACY_CATEGORY_TO_TYPE } from '../types/cognitive';

// ----------------------------------------------------------------------------
// PROFILE CONVERSION
// ----------------------------------------------------------------------------

/**
 * Converts v1 cognitive profile to v2 format
 */
export function convertProfileToV2(): CognitiveProfileV2 {
  return {
    name: 'Mikey',
    role: 'Entrepreneur and builder (tech, real estate, creative production)',
    timezone: 'America/New_York',
    signature: cognitiveProfile.signature,
    expertiseDomains: [
      'Commercial real estate development',
      'Technology and AI architecture',
      'Content production (robotics, real-time viz)',
      'Systems integration and cross-domain mapping',
      'Energy infrastructure and incentives',
    ],
    strengths: cognitiveProfile.strengths,
    learningStyle: cognitiveProfile.learningStyle,
    learningPipeline: cognitiveProfile.learningPipeline,
    decisionStyle: cognitiveProfile.decisionStyle,
    blindSpots: cognitiveProfile.blindSpots,
    coreValues: [
      'Truth and clarity',
      'Loyalty and genuineness',
      'Mastery and competence',
      'Building something meaningful and lasting',
      'Autonomy and control',
    ],
    motivations: cognitiveProfile.motivations,
    communicationStyle: 'Direct, substantive, structured. High density. Prefers frameworks, concrete examples, and constraint-driven reasoning.',
    preferredFormat: 'structured',
    verbosity: 'concise',
    alwaysDo: operatingInstructions.alwaysDo,
    neverDo: operatingInstructions.neverDo,
    responseContract: operatingInstructions.defaultResponseContract,
    router: operatingInstructions.router,
    stopRules: operatingInstructions.stopRules,
  };
}

// ----------------------------------------------------------------------------
// MEMORY TO KNOWLEDGE CONVERSION
// ----------------------------------------------------------------------------

/**
 * Converts v1 memories to v2 knowledge entries
 */
export function memoriesToKnowledge(
  memories: { memory: Memory; score: number }[]
): ProtocolKnowledge[] {
  return memories.map(({ memory, score }, idx) => {
    const layer = LEGACY_CATEGORY_TO_LAYER[memory.category] || 'knowledge';
    
    return {
      id: `k${idx + 1}`,
      content: memory.content,
      entities: memory.tags || [],
      confidence: Math.min(score + 0.5, 1.0), // Boost confidence from similarity score
      layer: layer as CognitiveLayer,
    };
  });
}

// ----------------------------------------------------------------------------
// PROTOCOL CONTEXT BUILDING
// ----------------------------------------------------------------------------

/**
 * Builds protocol context from query and memories
 */
export function buildProtocolContext(
  userQuery: string,
  relevantMemories: { memory: Memory; score: number }[],
  options: {
    includeFullProfile?: boolean;
  } = {}
): ProtocolContext {
  const { includeFullProfile = true } = options;
  const profile = convertProfileToV2();
  const analysis = analyzeQuery(userQuery);
  
  // Build identity block
  const identity: ProtocolIdentity = {
    name: profile.name || 'User',
    role: profile.role,
    expertise: profile.expertiseDomains.slice(0, 4),
    values: profile.coreValues.slice(0, 4),
    style: profile.communicationStyle,
  };
  
  // Convert memories to knowledge
  const knowledge = memoriesToKnowledge(relevantMemories);
  
  // Build behavioral block
  const behavioral: ProtocolBehavioral = {
    preferences: includeFullProfile ? profile.alwaysDo : profile.alwaysDo.slice(0, 2),
    avoidances: includeFullProfile ? profile.neverDo : profile.neverDo.slice(0, 2),
    patterns: includeFullProfile 
      ? [...profile.decisionStyle.slice(0, 2), ...profile.learningStyle.slice(0, 2)]
      : profile.decisionStyle.slice(0, 2),
  };
  
  // Build response spec
  const responseSpec: ProtocolResponseSpec = {
    format: profile.preferredFormat,
    length: profile.verbosity,
    include: getIncludes(analysis.intent),
    avoid: profile.neverDo.slice(0, 2),
  };
  
  return {
    system: {
      role: 'cognitive-assistant',
      version: '1.0',
      userId: 'mikey',
    },
    identity,
    knowledge,
    entities: [], // Could extract from memories if needed
    behavioral,
    project: undefined, // Could be added if project context is detected
    history: [], // Could be added from conversation history
    query: {
      input: userQuery,
      intent: analysis.intent,
    },
    responseSpec,
  };
}

/**
 * Gets include items based on intent
 */
function getIncludes(intent: QueryIntent): string[] {
  switch (intent) {
    case 'decision':
      return ['tradeoffs', 'risks', 'recommendations'];
    case 'task':
      return ['next_steps', 'verification'];
    case 'creative':
      return ['alternatives', 'rationale'];
    case 'reflection':
      return ['patterns', 'growth_areas'];
    case 'factual':
      return ['sources', 'caveats'];
    default:
      return ['actionable_items'];
  }
}

// ----------------------------------------------------------------------------
// CONTEXT PACK (V2)
// ----------------------------------------------------------------------------

export interface ContextPackV2 {
  // Natural language version (current approach)
  naturalPrompt: string;
  naturalTokens: number;
  
  // Protocol version (new approach)
  protocolPrompt: string;
  protocolTokens: number;
  
  // Comparison
  tokenSavings: number;
  savingsPercent: number;
  
  // Metadata
  memoriesUsed: number;
  queryAnalysis: ReturnType<typeof analyzeQuery>;
}

/**
 * Builds both natural language and protocol context for comparison
 */
export function buildDualContextPack(
  userQuery: string,
  relevantMemories: { memory: Memory; score: number }[],
  naturalSystemPrompt: string
): ContextPackV2 {
  const analysis = analyzeQuery(userQuery);
  const protocolContext = buildProtocolContext(userQuery, relevantMemories);
  
  // Build protocol prompt
  const protocolPrompt = buildSystemPrompt(protocolContext);
  const protocolTokens = estimateTokens(protocolPrompt);
  
  // Measure natural prompt
  const naturalTokens = estimateTokens(naturalSystemPrompt);
  
  // Calculate savings
  const tokenSavings = naturalTokens - protocolTokens;
  const savingsPercent = Math.round((tokenSavings / naturalTokens) * 100);
  
  return {
    naturalPrompt: naturalSystemPrompt,
    naturalTokens,
    protocolPrompt,
    protocolTokens,
    tokenSavings,
    savingsPercent,
    memoriesUsed: relevantMemories.length,
    queryAnalysis: analysis,
  };
}

// ----------------------------------------------------------------------------
// STANDALONE PROTOCOL PROMPT
// ----------------------------------------------------------------------------

/**
 * Builds a standalone protocol-based system prompt
 */
export function buildProtocolSystemPrompt(
  userQuery: string,
  relevantMemories: { memory: Memory; score: number }[]
): string {
  const protocolContext = buildProtocolContext(userQuery, relevantMemories);
  return buildSystemPrompt(protocolContext);
}

export default {
  convertProfileToV2,
  memoriesToKnowledge,
  buildProtocolContext,
  buildDualContextPack,
  buildProtocolSystemPrompt,
};
