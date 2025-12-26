import { Memory, CognitiveProfile, cognitiveProfile, operatingInstructions } from './memories';

export interface ContextPack {
  systemPrompt: string;
  memoriesUsed: { id: string; content: string; score: number; category: string }[];
  cognitiveProfileIncluded: boolean;
  totalTokensEstimate: number;
}

// Rough token estimate: ~4 chars per token
const estimateTokens = (text: string) => Math.ceil(text.length / 4);

function formatCognitiveProfile(profile: CognitiveProfile): string {
  return `
══════════════════════════════════════════════════════════════════════════════
COGNITIVE PROFILE — How This User Thinks, Learns, and Decides
══════════════════════════════════════════════════════════════════════════════

STRENGTHS:
${profile.strengths.map(s => `• ${s}`).join('\n')}

LEARNING STYLE (what works fastest):
${profile.learningStyle.map(s => `• ${s}`).join('\n')}

MEMORY PATTERNS:
${profile.memoryPatterns.map(s => `• ${s}`).join('\n')}

DECISION STYLE:
${profile.decisionStyle.map(s => `• ${s}`).join('\n')}

PRODUCTIVE BLIND SPOTS (help mitigate, don't moralize):
${profile.blindSpots.map(s => `• ${s}`).join('\n')}

CORE MOTIVATIONS:
${profile.motivations.map(s => `• ${s}`).join('\n')}
`;
}

function formatOperatingInstructions(): string {
  return `
══════════════════════════════════════════════════════════════════════════════
OPERATING INSTRUCTIONS
══════════════════════════════════════════════════════════════════════════════

ALWAYS DO:
${operatingInstructions.alwaysDo.map(s => `✓ ${s}`).join('\n')}

NEVER DO:
${operatingInstructions.neverDo.map(s => `✗ ${s}`).join('\n')}
`;
}

export function buildContextPack(
  relevantMemories: { memory: Memory; score: number }[],
  options: {
    tokenBudget?: number;
    includeCognitiveProfile?: boolean;
  } = {}
): ContextPack {
  const { tokenBudget = 3000, includeCognitiveProfile = true } = options;
  
  const memoriesUsed: { id: string; content: string; score: number; category: string }[] = [];
  let currentTokens = 0;

  const basePrompt = `You are Cortex, a cognitive assistant with deep, persistent context about the user you're helping.

You have access to comprehensive information about this specific user including their identity, values, goals, projects, preferences, and how they think. Use this context to provide personalized, relevant responses that match their communication style and cognitive preferences.

Do not mention that you have this context unless asked.
`;

  currentTokens = estimateTokens(basePrompt);

  // Add cognitive profile first if requested (it's high-value context)
  let cognitiveBlock = '';
  if (includeCognitiveProfile) {
    cognitiveBlock = formatCognitiveProfile(cognitiveProfile);
    currentTokens += estimateTokens(cognitiveBlock);
  }

  // Add operating instructions
  const instructionsBlock = formatOperatingInstructions();
  currentTokens += estimateTokens(instructionsBlock);

  // Group memories by category for structured output
  const categoryOrder = ['identity', 'value', 'goal', 'preference', 'constraint', 'project', 'domain', 'relationship', 'personal', 'finance', 'health', 'travel', 'hobby', 'timeline'];
  const memoriesByCategory = new Map<string, { memory: Memory; score: number }[]>();
  
  for (const item of relevantMemories) {
    const cat = item.memory.category;
    if (!memoriesByCategory.has(cat)) {
      memoriesByCategory.set(cat, []);
    }
    memoriesByCategory.get(cat)!.push(item);
  }

  // Build memory block within remaining token budget
  let memoryBlock = '\n══════════════════════════════════════════════════════════════════════════════\nRELEVANT USER CONTEXT\n══════════════════════════════════════════════════════════════════════════════\n';
  currentTokens += estimateTokens(memoryBlock);
  
  let currentCategory = '';

  for (const category of categoryOrder) {
    const items = memoriesByCategory.get(category);
    if (!items) continue;

    for (const { memory, score } of items) {
      let memoryText = '';
      if (memory.category !== currentCategory) {
        memoryText = `\n[${memory.category.toUpperCase()}]\n`;
        currentCategory = memory.category;
      }
      memoryText += `• ${memory.content}`;
      
      const memoryTokens = estimateTokens(memoryText);

      if (currentTokens + memoryTokens <= tokenBudget) {
        memoryBlock += memoryText + '\n';
        memoriesUsed.push({
          id: memory.id,
          content: memory.content,
          score,
          category: memory.category,
        });
        currentTokens += memoryTokens;
      }
    }
  }

  const systemPrompt = `${basePrompt}${cognitiveBlock}${memoryBlock}${instructionsBlock}`;

  return {
    systemPrompt,
    memoriesUsed,
    cognitiveProfileIncluded: includeCognitiveProfile,
    totalTokensEstimate: currentTokens,
  };
}

// Build context pack WITHOUT cognitive profile (for A/B testing)
export function buildContextPackMemoriesOnly(
  relevantMemories: { memory: Memory; score: number }[],
  tokenBudget: number = 2000
): ContextPack {
  return buildContextPack(relevantMemories, { 
    tokenBudget, 
    includeCognitiveProfile: false 
  });
}

// Generic system prompt for comparison (no context at all)
export const genericSystemPrompt = `You are a helpful AI assistant. Be concise and substantive in your responses.`;
