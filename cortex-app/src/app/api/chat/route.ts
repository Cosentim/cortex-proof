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

// Deep research prompt enhancement
const DEEP_RESEARCH_PROMPT = `
## Deep Research Mode
You are in Deep Research mode. For this query:
1. Think step-by-step and show your reasoning process
2. Consider multiple perspectives and approaches
3. Provide comprehensive, well-structured answers
4. Include relevant context, examples, and evidence
5. Acknowledge uncertainties and limitations
6. Take your time to give a thorough, high-quality response
`;

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages, modelId = 'gpt-4o-mini', deepResearch = false } = await request.json();
  
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response('Messages required', { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== 'user') {
    return new Response('Last message must be from user', { status: 400 });
  }

  const query = lastMessage.content;
  
  // Analyze the query (now fast - no API call)
  const analysis = await analyzeQuery(query);
  
  // Run memory retrieval and profile fetch in parallel
  const [{ memories }, profile] = await Promise.all([
    retrieveMemories(user.id, query, analysis),
    getUserProfile(user.id),
  ]);
  
  // Debug logging
  console.log('[CORTEX DEBUG]', {
    userId: user.id,
    memoriesFound: memories.length,
    memoryLayers: memories.map(m => m.memory.layer),
    hasProfile: !!profile,
  });
  
  // Adjust settings based on deep research mode
  const temperature = deepResearch ? 0.5 : 0.7; // More focused for research
  const maxTokens = deepResearch ? 8192 : 4096; // Allow longer responses
  
  // Encode context using CORTEX Protocol
  const protocolContext = encodeContext(memories, profile, analysis);
  
  // Build system prompt
  let systemPrompt = buildSystemPrompt(protocolContext);
  
  // Add deep research instructions if enabled
  if (deepResearch) {
    systemPrompt = `${systemPrompt}\n${DEEP_RESEARCH_PROMPT}`;
  }
  
  // Track memory access
  await trackMemoryAccess(memories.map(m => m.memory.id));

  // Determine provider and create model
  const provider = MODEL_PROVIDERS[modelId] || 'openai';
  
  // Debug: log what's being sent
  console.log('[CORTEX DEBUG] Provider:', provider, 'Model:', modelId);
  console.log('[CORTEX DEBUG] System prompt length:', systemPrompt.length);
  console.log('[CORTEX DEBUG] Memories:', memories.length, 'Profile:', !!profile);
  console.log('[CORTEX DEBUG] Context:', protocolContext.fullContext.substring(0, 800));
  
  // Fallback check - if model not in list but contains 'claude', use anthropic
  const actualProvider = modelId.includes('claude') ? 'anthropic' : provider;
  console.log('[CORTEX DEBUG] Actual provider resolved:', actualProvider);
  
  const model = actualProvider === 'anthropic'
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
