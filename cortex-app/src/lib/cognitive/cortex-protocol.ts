import type { 
  Memory, 
  UserProfile, 
  QueryAnalysis, 
  CognitiveLayer, 
  ProtocolContext 
} from '../types/cognitive';

const LAYER_EMOJI: Record<CognitiveLayer, string> = {
  identity: '🎭',
  preferences: '⚙️',
  knowledge: '📚',
  relational: '👥',
  temporal: '📅',
};

export function encodeContext(
  memories: Array<{ memory: Memory; score: number; similarity: number }>,
  profile: UserProfile | null,
  analysis: QueryAnalysis
): ProtocolContext {
  // Group memories by layer
  const byLayer = memories.reduce((acc, m) => {
    const layer = m.memory.layer;
    if (!acc[layer]) acc[layer] = [];
    acc[layer].push(m);
    return acc;
  }, {} as Record<CognitiveLayer, typeof memories>);

  // Build sections for each active layer
  const sections: string[] = [];
  const includedLayers: CognitiveLayer[] = [];
  
  // Add profile section if available
  if (profile?.cognitive_profile) {
    const cp = profile.cognitive_profile;
    sections.push(`## USER PROFILE
Display Name: ${profile.display_name || 'Unknown'}
${cp.summary ? `Summary: ${cp.summary}` : ''}`);
  }

  // Process each layer based on analysis priority
  const layerOrder: CognitiveLayer[] = ['identity', 'preferences', 'knowledge', 'relational', 'temporal'];
  
  for (const layer of layerOrder) {
    const layerMemories = byLayer[layer];
    if (!layerMemories || layerMemories.length === 0) continue;
    
    const budget = analysis.suggestedBudget[layer] || 0;
    if (budget < 50) continue;
    
    includedLayers.push(layer);
    const emoji = LAYER_EMOJI[layer];
    
    // Format memories for this layer
    const formatted = layerMemories
      .sort((a, b) => b.score - a.score)
      .map(m => {
        const mem = m.memory;
        const typeLabel = mem.memory_type.replace(/_/g, ' ');
        const pinned = mem.is_pinned ? '📌 ' : '';
        return `- ${pinned}[${typeLabel}] ${mem.content}`;
      })
      .join('\n');
    
    sections.push(`## ${emoji} ${layer.toUpperCase()}
${formatted}`);
  }

  const header = `<CORTEX version="1.0" query="${analysis.intent}">`;
  const footer = '</CORTEX>';
  
  const fullContext = `${header}
${sections.join('\n\n')}
${footer}`;

  return {
    fullContext,
    tokenEstimate: Math.ceil(fullContext.length / 4),
    includedLayers,
    memoryCount: memories.length,
  };
}

export function buildSystemPrompt(protocolContext: ProtocolContext): string {
  return `You are a highly personalized AI assistant with deep knowledge of the user. Use the CORTEX context to tailor your responses to their specific needs, communication style, and preferences.

${protocolContext.fullContext}

INSTRUCTIONS:
1. Reference the user's context naturally without explicitly quoting it
2. Adapt your tone and style to match their preferences
3. Leverage their knowledge and expertise - don't over-explain things they know
4. Be mindful of their relationships and social context
5. Consider temporal context (events, schedules) when relevant
6. If the user corrects you or provides new information, acknowledge it gracefully

Remember: The goal is to feel like a knowledgeable assistant who truly knows them, not a system reading from a database.`;
}

export function formatVerbosity(
  content: string,
  verbosity: 'concise' | 'balanced' | 'detailed'
): string {
  // Simple verbosity formatting hints
  switch (verbosity) {
    case 'concise':
      return content; // Let the model naturally be concise with less context
    case 'detailed':
      return content + '\n\n[Provide thorough, detailed responses with examples where helpful]';
    default:
      return content;
  }
}
