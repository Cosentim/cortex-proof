// ============================================================================
// QUERY ANALYZER
// Classifies user intent and determines which cognitive layers to query
// Lightweight heuristic version for proof of concept
// ============================================================================

import type {
  QueryAnalysis,
  QueryIntent,
  QueryComplexity,
  CognitiveLayer,
  ModelStrength,
} from '../../types/cognitive';

// ----------------------------------------------------------------------------
// INTENT KEYWORDS
// ----------------------------------------------------------------------------

const INTENT_KEYWORDS: Record<QueryIntent, string[]> = {
  factual: [
    'what is', 'who is', 'how does', 'explain', 'tell me about', 'define',
    'what are', 'describe', 'how do', 'why does', 'when did', 'where is'
  ],
  decision: [
    'should i', 'what should', 'which is better', 'help me decide', 'pros and cons',
    'trade-off', 'tradeoff', 'recommend', 'advice', 'choose between', 'compare'
  ],
  creative: [
    'write', 'draft', 'create', 'generate', 'brainstorm', 'ideas for',
    'come up with', 'design', 'compose', 'imagine', 'suggest'
  ],
  task: [
    'help me', 'fix', 'implement', 'build', 'code', 'do', 'make',
    'complete', 'finish', 'debug', 'solve', 'calculate', 'analyze'
  ],
  reflection: [
    'about me', 'about myself', 'my style', 'how do i', 'what do i',
    'my strengths', 'my weaknesses', 'my pattern', 'tell me about myself'
  ],
  continuation: [
    'continue', 'as we discussed', 'earlier', 'last time', 'you mentioned',
    'following up', 'back to', 'regarding our', 'as i said'
  ],
};

// ----------------------------------------------------------------------------
// LAYER RELEVANCE BY INTENT
// ----------------------------------------------------------------------------

const INTENT_LAYER_WEIGHTS: Record<QueryIntent, Record<CognitiveLayer, number>> = {
  factual: {
    identity: 0.3,
    knowledge: 0.9,
    behavioral: 0.2,
    project: 0.4,
    episodic: 0.3,
  },
  decision: {
    identity: 0.7,
    knowledge: 0.6,
    behavioral: 0.8,
    project: 0.7,
    episodic: 0.4,
  },
  creative: {
    identity: 0.6,
    knowledge: 0.5,
    behavioral: 0.7,
    project: 0.5,
    episodic: 0.3,
  },
  task: {
    identity: 0.4,
    knowledge: 0.7,
    behavioral: 0.5,
    project: 0.9,
    episodic: 0.3,
  },
  reflection: {
    identity: 0.95,
    knowledge: 0.4,
    behavioral: 0.9,
    project: 0.3,
    episodic: 0.7,
  },
  continuation: {
    identity: 0.4,
    knowledge: 0.5,
    behavioral: 0.4,
    project: 0.8,
    episodic: 0.9,
  },
};

// ----------------------------------------------------------------------------
// COMPLEXITY INDICATORS
// ----------------------------------------------------------------------------

const COMPLEXITY_INDICATORS = {
  simple: ['quick', 'simple', 'just', 'only', 'brief', 'short', 'one'],
  complex: [
    'comprehensive', 'detailed', 'thorough', 'analyze', 'deep dive',
    'everything', 'all aspects', 'complete', 'full', 'extensive'
  ],
};

// ----------------------------------------------------------------------------
// TOKEN BUDGETS BY COMPLEXITY
// ----------------------------------------------------------------------------

const TOKEN_BUDGETS: Record<QueryComplexity, number> = {
  simple: 500,
  moderate: 1000,
  complex: 2000,
};

const LAYER_BUDGET_WEIGHTS: Record<CognitiveLayer, number> = {
  identity: 0.15,
  knowledge: 0.30,
  behavioral: 0.15,
  project: 0.25,
  episodic: 0.15,
};

// ----------------------------------------------------------------------------
// ENTITY EXTRACTION (Simple)
// ----------------------------------------------------------------------------

/**
 * Simple entity extraction using patterns
 */
function extractEntities(input: string): string[] {
  const entities: string[] = [];
  
  // Capitalized words (potential proper nouns)
  const capitalizedPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g;
  const matches = input.match(capitalizedPattern);
  if (matches) {
    entities.push(...matches.filter(m => m.length > 2));
  }
  
  // Quoted strings
  const quotedPattern = /"([^"]+)"|'([^']+)'/g;
  let match;
  while ((match = quotedPattern.exec(input)) !== null) {
    entities.push(match[1] || match[2]);
  }
  
  return [...new Set(entities)]; // Deduplicate
}

// ----------------------------------------------------------------------------
// INTENT CLASSIFICATION
// ----------------------------------------------------------------------------

/**
 * Classifies intent using keyword matching
 */
function classifyIntent(input: string): QueryIntent {
  const lowerInput = input.toLowerCase();
  
  // Check each intent's keywords
  const scores: Record<QueryIntent, number> = {
    factual: 0,
    decision: 0,
    creative: 0,
    task: 0,
    reflection: 0,
    continuation: 0,
  };
  
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerInput.includes(keyword)) {
        scores[intent as QueryIntent] += 1;
      }
    }
  }
  
  // Find highest scoring intent
  let maxScore = 0;
  let maxIntent: QueryIntent = 'task'; // Default
  
  for (const [intent, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxIntent = intent as QueryIntent;
    }
  }
  
  return maxIntent;
}

/**
 * Determines complexity from input
 */
function classifyComplexity(input: string): QueryComplexity {
  const lowerInput = input.toLowerCase();
  
  // Check for complexity indicators
  for (const indicator of COMPLEXITY_INDICATORS.simple) {
    if (lowerInput.includes(indicator)) return 'simple';
  }
  
  for (const indicator of COMPLEXITY_INDICATORS.complex) {
    if (lowerInput.includes(indicator)) return 'complex';
  }
  
  // Default based on length
  if (input.length < 50) return 'simple';
  if (input.length > 200) return 'complex';
  
  return 'moderate';
}

/**
 * Suggests model based on complexity and intent
 */
function suggestModel(complexity: QueryComplexity, intent: QueryIntent): ModelStrength {
  if (complexity === 'simple' && intent === 'factual') return 'fast';
  if (complexity === 'complex') return 'deep';
  if (intent === 'decision' || intent === 'creative') return 'balanced';
  return 'balanced';
}

/**
 * Calculates token budgets per layer
 */
function calculateBudgets(
  layerRelevance: Record<CognitiveLayer, number>,
  complexity: QueryComplexity
): Record<CognitiveLayer, number> {
  const totalBudget = TOKEN_BUDGETS[complexity];
  const budgets: Record<CognitiveLayer, number> = {
    identity: 0,
    knowledge: 0,
    behavioral: 0,
    project: 0,
    episodic: 0,
  };
  
  // Calculate weighted budgets
  let totalWeight = 0;
  for (const layer of Object.keys(budgets) as CognitiveLayer[]) {
    totalWeight += layerRelevance[layer] * LAYER_BUDGET_WEIGHTS[layer];
  }
  
  for (const layer of Object.keys(budgets) as CognitiveLayer[]) {
    const weight = layerRelevance[layer] * LAYER_BUDGET_WEIGHTS[layer];
    budgets[layer] = Math.round((weight / totalWeight) * totalBudget);
  }
  
  return budgets;
}

// ----------------------------------------------------------------------------
// MAIN ANALYSIS FUNCTION
// ----------------------------------------------------------------------------

/**
 * Analyzes a query and returns routing information
 */
export function analyzeQuery(input: string): QueryAnalysis {
  const intent = classifyIntent(input);
  const complexity = classifyComplexity(input);
  const entities = extractEntities(input);
  const layerRelevance = INTENT_LAYER_WEIGHTS[intent];
  const suggestedModel = suggestModel(complexity, intent);
  const suggestedBudget = calculateBudgets(layerRelevance, complexity);
  
  return {
    input,
    intent,
    complexity,
    entities,
    layerRelevance,
    suggestedModel,
    suggestedBudget,
  };
}

/**
 * Quick intent check without full analysis
 */
export function quickClassify(input: string): { intent: QueryIntent; complexity: QueryComplexity } {
  return {
    intent: classifyIntent(input),
    complexity: classifyComplexity(input),
  };
}

export default {
  analyzeQuery,
  quickClassify,
  INTENT_KEYWORDS,
  INTENT_LAYER_WEIGHTS,
};
