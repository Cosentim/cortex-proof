import type { QueryAnalysis, QueryIntent, CognitiveLayer } from '../types/cognitive';

// Fast heuristic-based analysis (no API call needed)
function quickAnalyze(input: string): QueryAnalysis {
  const lower = input.toLowerCase();
  const words = lower.split(/\s+/);
  const wordCount = words.length;
  
  // Determine complexity by length
  const complexity = wordCount < 10 ? 'simple' : wordCount < 30 ? 'moderate' : 'complex';
  
  // Determine intent by keywords
  let intent: QueryIntent = 'task';
  if (lower.includes('what do you know') || lower.includes('tell me about me') || lower.includes('remember')) {
    intent = 'reflection';
  } else if (lower.includes('should i') || lower.includes('which') || lower.includes('recommend')) {
    intent = 'decision';
  } else if (lower.includes('write') || lower.includes('create') || lower.includes('generate') || lower.includes('story')) {
    intent = 'creative';
  } else if (lower.includes('what is') || lower.includes('how does') || lower.includes('explain')) {
    intent = 'factual';
  }
  
  // Determine layer relevance by keywords
  const layers = {
    identity: 0.2,
    preferences: 0.2,
    knowledge: 0.3,
    relational: 0.1,
    temporal: 0.1,
  };
  
  // Boost layers based on keywords
  if (lower.includes('i ') || lower.includes('my ') || lower.includes('me ') || lower.includes('about me')) {
    layers.identity = 0.6;
    layers.preferences = 0.5;
  }
  if (lower.includes('like') || lower.includes('prefer') || lower.includes('favorite') || lower.includes('style')) {
    layers.preferences = 0.7;
  }
  if (lower.includes('know') || lower.includes('skill') || lower.includes('work') || lower.includes('expert')) {
    layers.knowledge = 0.7;
  }
  if (lower.includes('friend') || lower.includes('family') || lower.includes('team') || lower.includes('colleague')) {
    layers.relational = 0.6;
  }
  if (lower.includes('schedule') || lower.includes('when') || lower.includes('today') || lower.includes('tomorrow') || lower.includes('deadline')) {
    layers.temporal = 0.6;
  }
  
  // Calculate budget
  const totalBudget = complexity === 'simple' ? 800 : complexity === 'moderate' ? 1500 : 2500;
  const totalRelevance = Object.values(layers).reduce((a, b) => a + b, 0);
  
  const suggestedBudget: Record<CognitiveLayer, number> = {
    identity: 0, preferences: 0, knowledge: 0, relational: 0, temporal: 0
  };
  
  for (const [layer, score] of Object.entries(layers)) {
    suggestedBudget[layer as CognitiveLayer] = Math.floor((score / totalRelevance) * totalBudget);
  }
  
  return {
    input,
    intent,
    complexity,
    layerRelevance: layers,
    suggestedBudget,
  };
}

export async function analyzeQuery(input: string): Promise<QueryAnalysis> {
  // Use fast heuristic analysis - no API call needed
  // This reduces latency by ~500-1000ms per request
  return quickAnalyze(input);
}
