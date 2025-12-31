import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import type { QueryAnalysis, QueryIntent, CognitiveLayer } from '../types/cognitive';

const QueryAnalysisSchema = z.object({
  intent: z.enum(['factual', 'decision', 'creative', 'task', 'reflection', 'continuation']),
  complexity: z.enum(['simple', 'moderate', 'complex']),
  layers: z.object({
    identity: z.number().min(0).max(1),
    preferences: z.number().min(0).max(1),
    knowledge: z.number().min(0).max(1),
    relational: z.number().min(0).max(1),
    temporal: z.number().min(0).max(1),
  }),
});

const ANALYSIS_PROMPT = `Analyze this user query for cognitive routing.

OUTPUT JSON with:
- intent: factual|decision|creative|task|reflection|continuation
- complexity: simple|moderate|complex  
- layers: relevance score 0-1 for each cognitive layer

LAYERS:
- identity: values, beliefs, who they are, background
- preferences: likes, dislikes, communication style, work style
- knowledge: skills, expertise, domain knowledge
- relational: relationships, people they know
- temporal: events, milestones, time-based info

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
      identity: 0, preferences: 0, knowledge: 0, relational: 0, temporal: 0
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
  } catch {
    // Fallback to defaults
    return {
      input,
      intent: 'task',
      complexity: 'moderate',
      layerRelevance: { identity: 0.3, preferences: 0.3, knowledge: 0.5, relational: 0.2, temporal: 0.2 },
      suggestedBudget: { identity: 150, preferences: 150, knowledge: 400, relational: 100, temporal: 100 },
    };
  }
}
