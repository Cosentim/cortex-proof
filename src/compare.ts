import { memories, Memory, cognitiveProfile } from './memories';
import { embedMemories, findRelevantMemories } from './embeddings';
import { buildContextPack, buildContextPackMemoriesOnly, genericSystemPrompt } from './context-builder';
import { chatWithGPT } from './providers/openai';
import { chatWithClaude } from './providers/anthropic';

let embeddedMemories: Memory[] = [];

export async function initializeMemories(): Promise<void> {
  if (embeddedMemories.length === 0) {
    embeddedMemories = await embedMemories(memories);
  }
}

export async function runComparison(userMessage: string) {
  console.log('\n' + '='.repeat(80));
  console.log('USER QUERY:', userMessage);
  console.log('='.repeat(80));

  // Find relevant memories
  console.log('\n📚 Finding relevant memories...');
  const relevantMemories = await findRelevantMemories(
    userMessage,
    embeddedMemories,
    10 // Get more memories since we have richer data now
  );

  console.log('\nTop relevant memories:');
  relevantMemories.forEach(({ memory, score }, i) => {
    console.log(`  ${i + 1}. [${score.toFixed(3)}] (${memory.category}) ${memory.content.substring(0, 80)}...`);
  });

  // Build context packs
  const fullContextPack = buildContextPack(relevantMemories, { includeCognitiveProfile: true });
  const memoriesOnlyPack = buildContextPackMemoriesOnly(relevantMemories);

  console.log(`\n📦 Full context pack: ${fullContextPack.memoriesUsed.length} memories + cognitive profile, ~${fullContextPack.totalTokensEstimate} tokens`);
  console.log(`📦 Memories-only pack: ${memoriesOnlyPack.memoriesUsed.length} memories, ~${memoriesOnlyPack.totalTokensEstimate} tokens`);

  // Get responses - we'll use Claude for the main comparison since it's generally stronger
  console.log('\n⏳ Getting responses from Claude...\n');

  // Test 1: No context (baseline)
  console.log('─'.repeat(80));
  console.log('�� BASELINE (No Context):');
  console.log('─'.repeat(80));
  const baseline = await chatWithClaude(userMessage, genericSystemPrompt);
  console.log(baseline);

  // Test 2: Memories only (no cognitive profile)
  console.log('\n' + '─'.repeat(80));
  console.log('📝 WITH MEMORIES ONLY:');
  console.log('─'.repeat(80));
  const withMemories = await chatWithClaude(userMessage, memoriesOnlyPack.systemPrompt);
  console.log(withMemories);

  // Test 3: Full context (memories + cognitive profile)
  console.log('\n' + '─'.repeat(80));
  console.log('�� WITH FULL CONTEXT (Memories + Cognitive Profile):');
  console.log('─'.repeat(80));
  const withFull = await chatWithClaude(userMessage, fullContextPack.systemPrompt);
  console.log(withFull);

  // Optional: Also test with GPT for cross-model comparison
  console.log('\n' + '─'.repeat(80));
  console.log('🧠 GPT-4o WITH FULL CONTEXT (Cross-model validation):');
  console.log('─'.repeat(80));
  const gptWithFull = await chatWithGPT(userMessage, fullContextPack.systemPrompt);
  console.log(gptWithFull);

  console.log('\n' + '='.repeat(80));
  console.log('COMPARISON COMPLETE');
  console.log('='.repeat(80));
  console.log('\nEVALUATION CRITERIA:');
  console.log('  1. Does the response reflect understanding of who you are?');
  console.log('  2. Is the format/structure aligned with your preferences?');
  console.log('  3. Does it account for your cognitive style (frameworks, decomposition)?');
  console.log('  4. Is it actionable and specific to your situation?');
  console.log('='.repeat(80) + '\n');
}
