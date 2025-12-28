import { createClient } from '../supabase/server';
import { generateEmbedding } from '../ai/embeddings';
import type { QueryAnalysis, Memory, ScoredMemory, UserProfile } from '../types/cognitive';

const RECENCY_HALF_LIFE_DAYS = 30;

function calculateRecencyScore(createdAt: string): number {
  const daysSince = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return Math.exp(-daysSince / RECENCY_HALF_LIFE_DAYS);
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function retrieveMemories(
  userId: string,
  query: string,
  analysis: QueryAnalysis
): Promise<{ memories: ScoredMemory[]; totalTokens: number }> {
  const supabase = await createClient();
  const queryEmbedding = await generateEmbedding(query);
  
  // Get all relevant memories across layers
  const allMemories: ScoredMemory[] = [];
  
  for (const [layer, budget] of Object.entries(analysis.suggestedBudget)) {
    if (budget < 50) continue;
    
    const { data: results } = await supabase.rpc('match_memories', {
      query_embedding: queryEmbedding,
      match_user_id: userId,
      match_layer: layer,
      match_threshold: 0.4,
      match_count: 15,
    });
    
    if (results) {
      for (const result of results) {
        const recency = calculateRecencyScore(result.created_at);
        const frequency = Math.min((result.access_count || 0) / 50, 0.2);
        const pinned = result.is_pinned ? 0.15 : 0;
        const boost = (result.retrieval_boost || 1) - 1;
        
        const score = (
          result.similarity * 0.5 +
          recency * 0.15 +
          frequency * 0.05 +
          pinned +
          boost * 0.05 +
          result.confidence * 0.1
        );
        
        allMemories.push({
          memory: result as Memory,
          score,
          similarity: result.similarity,
        });
      }
    }
  }
  
  // Get pinned memories (always include)
  const { data: pinnedMemories } = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('is_pinned', true);
  
  if (pinnedMemories) {
    for (const pinned of pinnedMemories) {
      const alreadyIncluded = allMemories.some(m => m.memory.id === pinned.id);
      if (!alreadyIncluded) {
        allMemories.push({
          memory: pinned as Memory,
          score: 0.9,
          similarity: 0,
        });
      }
    }
  }
  
  // Sort by score and select within total budget
  allMemories.sort((a, b) => b.score - a.score);
  
  const totalBudget = Object.values(analysis.suggestedBudget).reduce((a, b) => a + b, 0);
  const selected: ScoredMemory[] = [];
  let usedTokens = 0;
  
  for (const item of allMemories) {
    const tokens = estimateTokens(item.memory.content);
    if (usedTokens + tokens <= totalBudget) {
      selected.push(item);
      usedTokens += tokens;
    }
  }
  
  return { memories: selected, totalTokens: usedTokens };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || !data) return null;
  return data as UserProfile;
}

export async function trackMemoryAccess(memoryIds: string[]): Promise<void> {
  if (memoryIds.length === 0) return;
  
  const supabase = await createClient();
  await supabase.rpc('increment_memory_access', { memory_ids: memoryIds });
}
