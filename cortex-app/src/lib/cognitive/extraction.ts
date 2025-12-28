import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { CognitiveLayer, MemoryType } from '../types/cognitive';

const ExtractionSchema = z.object({
  memories: z.array(z.object({
    layer: z.enum(['identity', 'preferences', 'knowledge', 'relational', 'temporal']),
    type: z.string(),
    content: z.string().describe('The extracted memory content, phrased clearly and concisely'),
    importance: z.number().min(0.1).max(1).describe('How important is this memory? 0.1-1.0'),
    reasoning: z.string().describe('Brief explanation of why this is worth remembering'),
  })),
  summary: z.string().describe('Brief summary of what was extracted'),
});

export type ExtractedMemory = {
  layer: CognitiveLayer;
  type: MemoryType;
  content: string;
  importance: number;
  reasoning: string;
};

export type ExtractionResult = {
  memories: ExtractedMemory[];
  summary: string;
};

export async function extractMemories(
  text: string,
  context?: string
): Promise<ExtractionResult> {
  const prompt = `Analyze this content and extract distinct, valuable memories about the user.

${context ? `Context about the user: ${context}\n` : ''}
Content to analyze:
"""
${text}
"""

Extract memories across these cognitive layers:
- **identity**: Core traits, values, beliefs, background, self-descriptions
- **preferences**: Likes, dislikes, communication styles, aesthetic preferences
- **knowledge**: Skills, expertise, professional knowledge, education
- **relational**: Relationships, social connections, people they mention
- **temporal**: Events, milestones, schedules, time-based information

Memory types include:
- identity: core_value, belief, personality_trait, background, goal, self_description
- preferences: communication_style, aesthetic_preference, tool_preference, learning_style, work_style
- knowledge: skill, expertise, domain_knowledge, methodology, project_context
- relational: relationship, social_preference, collaboration_style
- temporal: life_event, milestone, recurring_pattern

Guidelines:
1. Extract SPECIFIC, ACTIONABLE information (not vague generalizations)
2. Each memory should be self-contained and clear
3. Prioritize information that would be useful in future conversations
4. Assign higher importance to identity/core beliefs (0.7-1.0)
5. Assign moderate importance to preferences/knowledge (0.4-0.7)
6. Assign lower importance to temporal/contextual info (0.2-0.5)
7. If content seems personal or revealing, be respectful in extraction`;

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: ExtractionSchema,
    prompt,
    temperature: 0.3,
  });

  return {
    memories: object.memories as ExtractedMemory[],
    summary: object.summary,
  };
}

export async function suggestMemoryUpdate(
  existingContent: string,
  newInformation: string
): Promise<{ shouldUpdate: boolean; newContent?: string; reason: string }> {
  const UpdateSchema = z.object({
    shouldUpdate: z.boolean(),
    newContent: z.string().optional(),
    reason: z.string(),
  });

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: UpdateSchema,
    prompt: `Compare these two pieces of information and determine if an update is needed.

Existing memory:
"${existingContent}"

New information:
"${newInformation}"

Decide:
1. If new info contradicts existing: recommend UPDATE with merged/corrected content
2. If new info adds detail: recommend UPDATE with enhanced content
3. If new info is redundant: recommend NO UPDATE
4. If new info is unrelated: recommend NO UPDATE

Return shouldUpdate, optional newContent (if updating), and reason.`,
    temperature: 0.2,
  });

  return object;
}
