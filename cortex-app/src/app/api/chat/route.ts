import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import type { AnthropicProviderOptions } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import type { OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';
import { analyzeQuery } from '@/lib/cognitive/query-analyzer';
import { retrieveMemories, getUserProfile, trackMemoryAccess } from '@/lib/cognitive/retrieval';
import { encodeContext, buildSystemPrompt } from '@/lib/cognitive/cortex-protocol';

// Model metadata for provider detection and capabilities
const MODEL_CONFIG: Record<string, { 
  provider: 'openai' | 'anthropic';
  supportsThinking?: boolean;  // Claude's extended thinking
  supportsWebSearch?: boolean; // Web search capability
  supportsReasoning?: boolean; // OpenAI reasoning models
}> = {
  'gpt-4o-mini': { provider: 'openai', supportsWebSearch: true },
  'gpt-4o': { provider: 'openai', supportsWebSearch: true },
  'gpt-4-turbo': { provider: 'openai', supportsWebSearch: true },
  'claude-sonnet-4-20250514': { provider: 'anthropic', supportsThinking: true, supportsWebSearch: true },
  'claude-3-5-haiku-20241022': { provider: 'anthropic', supportsThinking: false, supportsWebSearch: true },
  'claude-opus-4-20250514': { provider: 'anthropic', supportsThinking: true, supportsWebSearch: true },
};

// Deep research prompt enhancement
const DEEP_RESEARCH_PROMPT = `
## Deep Research Mode
You are in Deep Research mode. For this query:
1. Use web search to find current, accurate information
2. Think step-by-step and show your reasoning process
3. Consider multiple perspectives and approaches
4. Provide comprehensive, well-structured answers with citations
5. Include relevant context, examples, and evidence from your search
6. Acknowledge uncertainties and limitations
7. Always cite your sources with URLs when providing factual information
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

  // Get model config
  const modelConfig = MODEL_CONFIG[modelId] || { provider: modelId.includes('claude') ? 'anthropic' : 'openai' };
  const actualProvider = modelConfig.provider;
  
  // Debug: log what's being sent
  console.log('[CORTEX DEBUG] Provider:', actualProvider, 'Model:', modelId, 'DeepResearch:', deepResearch);
  console.log('[CORTEX DEBUG] System prompt length:', systemPrompt.length);
  console.log('[CORTEX DEBUG] Memories:', memories.length, 'Profile:', !!profile);
  
  const model = actualProvider === 'anthropic'
    ? anthropic(modelId)
    : openai(modelId);

  // Build provider options and tools for deep research
  const providerOptions: { 
    anthropic?: AnthropicProviderOptions;
    openai?: OpenAIResponsesProviderOptions;
  } = {};
  
  // Build tools object for web search
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tools: Record<string, any> = {};
  
  // Enable Claude's extended thinking for deep research on supported models
  if (deepResearch && actualProvider === 'anthropic' && modelConfig.supportsThinking) {
    providerOptions.anthropic = {
      thinking: { 
        type: 'enabled', 
        budgetTokens: 10000 // Allow up to 10k tokens for reasoning
      }
    };
    console.log('[CORTEX DEBUG] Enabled Claude extended thinking mode');
  }
  
  // Enable web search for deep research
  if (deepResearch) {
    if (actualProvider === 'openai') {
      // OpenAI web search tool
      tools.web_search = openai.tools.webSearch({
        searchContextSize: 'high',
      });
      console.log('[CORTEX DEBUG] Enabled OpenAI web search');
    } else if (actualProvider === 'anthropic') {
      // Anthropic web search tool
      tools.web_search = anthropic.tools.webSearch_20250305({
        maxUses: 5,
      });
      console.log('[CORTEX DEBUG] Enabled Claude web search');
    }
  }

  // Stream the response
  const result = streamText({
    model,
    system: systemPrompt,
    messages,
    tools: Object.keys(tools).length > 0 ? tools : undefined,
    temperature: deepResearch && actualProvider === 'anthropic' && modelConfig.supportsThinking 
      ? 1 // Claude thinking mode requires temperature 1
      : temperature,
    maxOutputTokens: maxTokens,
    providerOptions: Object.keys(providerOptions).length > 0 ? providerOptions : undefined,
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
        deep_research: deepResearch,
      });
    },
  });

  // Return text stream response
  return result.toTextStreamResponse();
}
