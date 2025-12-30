import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';
import { analyzeQuery } from '@/lib/cognitive/query-analyzer';
import { retrieveMemories, getUserProfile, trackMemoryAccess } from '@/lib/cognitive/retrieval';
import { encodeContext, buildSystemPrompt } from '@/lib/cognitive/cortex-protocol';

// Model metadata for provider detection
const MODEL_PROVIDERS: Record<string, 'openai' | 'anthropic'> = {
  'gpt-4o-mini': 'openai',
  'gpt-4o': 'openai',
  'gpt-4-turbo': 'openai',
  'claude-sonnet-4-20250514': 'anthropic',
  'claude-3-5-haiku-20241022': 'anthropic',
  'claude-opus-4-20250514': 'anthropic',
};

const DEFAULT_MODEL_SETTINGS = {
  temperature: 0.7,
  maxTokens: 4096,
  tuningPrompt: '',
};

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages, modelId = 'gpt-4o-mini' } = await request.json();
  
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response('Messages required', { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== 'user') {
    return new Response('Last message must be from user', { status: 400 });
  }

  const query = lastMessage.content;
  
  // Analyze the query
  const analysis = await analyzeQuery(query);
  
  // Retrieve relevant memories
  const { memories } = await retrieveMemories(user.id, query, analysis);
  
  // Get user profile (includes preferences)
  const profile = await getUserProfile(user.id);
  
  // Get model-specific settings from user preferences
  const modelPrefs = profile?.preferences?.modelSettings?.models?.[modelId] || {};
  const temperature = modelPrefs.temperature ?? DEFAULT_MODEL_SETTINGS.temperature;
  const maxTokens = modelPrefs.maxTokens ?? DEFAULT_MODEL_SETTINGS.maxTokens;
  const tuningPrompt = modelPrefs.tuningPrompt || '';
  
  // Encode context using CORTEX Protocol
  const protocolContext = encodeContext(memories, profile, analysis);
  
  // Build system prompt with optional tuning
  let systemPrompt = buildSystemPrompt(protocolContext);
  if (tuningPrompt) {
    systemPrompt = `${systemPrompt}\n\n## Custom Instructions\n${tuningPrompt}`;
  }
  
  // Track memory access
  await trackMemoryAccess(memories.map(m => m.memory.id));

  // Determine provider and create model
  const provider = MODEL_PROVIDERS[modelId] || 'openai';
  const model = provider === 'anthropic'
    ? anthropic(modelId)
    : openai(modelId);

  // Stream the response
  const result = streamText({
    model,
    system: systemPrompt,
    messages,
    temperature,
    maxOutputTokens: maxTokens,
    onFinish: async ({ usage }) => {
      // Log usage for analytics
      await supabase.from('chat_logs').insert({
        user_id: user.id,
        model_id: modelId,
        query_tokens: usage.inputTokens,
        response_tokens: usage.outputTokens,
        context_tokens: protocolContext.tokenEstimate,
        memory_count: memories.length,
        layers_used: protocolContext.includedLayers,
      });
    },
  });

  return result.toTextStreamResponse();
}
