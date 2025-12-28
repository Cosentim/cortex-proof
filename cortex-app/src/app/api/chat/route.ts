import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';
import { analyzeQuery } from '@/lib/cognitive/query-analyzer';
import { retrieveMemories, getUserProfile, trackMemoryAccess } from '@/lib/cognitive/retrieval';
import { encodeContext, buildSystemPrompt } from '@/lib/cognitive/cortex-protocol';
import { getModelConfig } from '@/lib/ai/models';

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages, modelId = 'balanced' } = await request.json();
  
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
  
  // Get user profile
  const profile = await getUserProfile(user.id);
  
  // Encode context using CORTEX Protocol
  const protocolContext = encodeContext(memories, profile, analysis);
  
  // Build system prompt
  const systemPrompt = buildSystemPrompt(protocolContext);
  
  // Track memory access
  await trackMemoryAccess(memories.map(m => m.memory.id));

  // Get model configuration
  const modelConfig = getModelConfig(modelId as 'fast' | 'balanced' | 'deep');
  
  // Select model based on configuration
  const model = modelConfig.provider === 'anthropic'
    ? anthropic(modelConfig.modelId)
    : openai(modelConfig.modelId);

  // Stream the response
  const result = streamText({
    model,
    system: systemPrompt,
    messages,
    temperature: modelConfig.temperature,
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
