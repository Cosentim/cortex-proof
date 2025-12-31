import { createClient } from '../supabase/server';
import { extractMemories } from './extraction';
import { generateEmbedding } from '../ai/embeddings';
import type { CognitiveLayer, MemoryType } from '../types/cognitive';

interface OnboardingQuestion {
  id: string;
  question: string;
  layer: CognitiveLayer;
  expectedTypes: MemoryType[];
  followUps?: string[];
}

const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'intro',
    question: "Tell me a bit about yourself - what do you do, what are you passionate about?",
    layer: 'identity',
    expectedTypes: ['core_value', 'background', 'goal'],
    followUps: ["What drives you in your work?", "What's a goal you're working toward?"]
  },
  {
    id: 'work_style',
    question: "How do you like to work? Are you more of a planner or do you go with the flow?",
    layer: 'preferences',
    expectedTypes: ['work_style', 'communication_style'],
    followUps: ["Do you prefer detailed explanations or quick summaries?"]
  },
  {
    id: 'expertise',
    question: "What are your areas of expertise or things you're learning about?",
    layer: 'knowledge',
    expectedTypes: ['skill', 'expertise', 'domain_knowledge'],
    followUps: ["What tools or technologies do you use regularly?"]
  },
  {
    id: 'communication',
    question: "How do you prefer to communicate? Formal, casual, technical, creative?",
    layer: 'preferences',
    expectedTypes: ['communication_style', 'aesthetic_preference'],
  },
  {
    id: 'context',
    question: "Is there anything specific you'd like me to always keep in mind when helping you?",
    layer: 'identity',
    expectedTypes: ['core_value', 'belief', 'self_description'],
  }
];

export async function processOnboardingResponse(
  userId: string,
  questionId: string,
  response: string
): Promise<{ memoriesCreated: number; summary: string }> {
  const supabase = await createClient();
  const question = ONBOARDING_QUESTIONS.find(q => q.id === questionId);
  
  if (!question) {
    throw new Error(`Unknown onboarding question: ${questionId}`);
  }

  // Extract memories from the response
  const extraction = await extractMemories(response, `Responding to: "${question.question}"`);
  
  // Create memories in database
  let created = 0;
  for (const mem of extraction.memories) {
    const embedding = await generateEmbedding(mem.content);
    
    const { error } = await supabase.from('memories').insert({
      user_id: userId,
      layer: mem.layer,
      memory_type: mem.type,
      content: mem.content,
      embedding,
      confidence: mem.importance,
      source: 'onboarding',
      metadata: {
        questionId,
        reasoning: mem.reasoning,
      },
    });
    
    if (!error) created++;
  }

  // Mark question as completed in user profile
  await supabase.from('user_profiles').update({
    onboarding_progress: {
      [`${questionId}`]: { completed: true, timestamp: new Date().toISOString() }
    }
  }).eq('id', userId);

  return {
    memoriesCreated: created,
    summary: extraction.summary,
  };
}

export function getOnboardingQuestions(): OnboardingQuestion[] {
  return ONBOARDING_QUESTIONS;
}

export function getNextQuestion(completedIds: string[]): OnboardingQuestion | null {
  return ONBOARDING_QUESTIONS.find(q => !completedIds.includes(q.id)) || null;
}

export async function checkOnboardingComplete(userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('user_profiles')
    .select('onboarding_progress')
    .eq('id', userId)
    .single();
  
  if (!data?.onboarding_progress) return false;
  
  const completed = Object.keys(data.onboarding_progress);
  return ONBOARDING_QUESTIONS.every(q => completed.includes(q.id));
}
