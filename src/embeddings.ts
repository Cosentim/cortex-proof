import OpenAI from 'openai';
import { Memory } from './memories';

const openai = new OpenAI();

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

export async function embedMemories(memories: Memory[]): Promise<Memory[]> {
  console.log(`Generating embeddings for ${memories.length} memories...`);

  const embeddedMemories: Memory[] = [];

  for (const memory of memories) {
    const embedding = await generateEmbedding(memory.content);
    embeddedMemories.push({
      ...memory,
      embedding,
    });
    process.stdout.write('.');
  }

  console.log(' Done!');
  return embeddedMemories;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function findRelevantMemories(
  query: string,
  memories: Memory[],
  topK: number = 5
): Promise<{ memory: Memory; score: number }[]> {
  const queryEmbedding = await generateEmbedding(query);

  const scored = memories.map((memory) => ({
    memory,
    score: memory.embedding
      ? cosineSimilarity(queryEmbedding, memory.embedding)
      : 0,
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}
