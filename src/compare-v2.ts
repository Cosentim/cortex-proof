// ============================================================================
// CORTEX V2 COMPARISON TEST
// Tests the new CORTEX Protocol encoding vs natural language context
// ============================================================================

import { memories, Memory } from './memories';
import { embedMemories, findRelevantMemories } from './embeddings';
import { buildContextPack, genericSystemPrompt } from './context-builder';
import { buildDualContextPack, buildProtocolSystemPrompt } from './lib/context-builder-v2';
import { analyzeQuery } from './lib/cognitive/query-analyzer';
import { chatWithClaude } from './providers/anthropic';

let embeddedMemories: Memory[] = [];

export async function initializeMemoriesV2(): Promise<void> {
  if (embeddedMemories.length === 0) {
    embeddedMemories = await embedMemories(memories);
  }
}

/**
 * Runs comparison between v1 natural language and v2 protocol approaches
 */
export async function runV2Comparison(userMessage: string) {
  console.log('\n' + '═'.repeat(80));
  console.log('🧠 CORTEX V2 PROTOCOL TEST');
  console.log('═'.repeat(80));
  console.log('\nUSER QUERY:', userMessage);
  console.log('─'.repeat(80));

  // Analyze query
  const analysis = analyzeQuery(userMessage);
  console.log('\n📊 QUERY ANALYSIS:');
  console.log(`   Intent: ${analysis.intent}`);
  console.log(`   Complexity: ${analysis.complexity}`);
  console.log(`   Suggested Model: ${analysis.suggestedModel}`);
  console.log(`   Entities: ${analysis.entities.length ? analysis.entities.join(', ') : '(none detected)'}`);
  console.log('\n   Layer Relevance:');
  for (const [layer, score] of Object.entries(analysis.layerRelevance)) {
    const scoreNum = score as number;
    const bar = '█'.repeat(Math.round(scoreNum * 10)) + '░'.repeat(10 - Math.round(scoreNum * 10));
    console.log(`     ${layer.padEnd(12)} ${bar} ${(scoreNum * 100).toFixed(0)}%`);
  }

  // Find relevant memories
  console.log('\n📚 Finding relevant memories...');
  const relevantMemories = await findRelevantMemories(
    userMessage,
    embeddedMemories,
    8 // Slightly fewer for protocol efficiency
  );

  console.log('\nTop memories selected:');
  relevantMemories.slice(0, 5).forEach(({ memory, score }, i) => {
    console.log(`   ${i + 1}. [${score.toFixed(3)}] ${memory.content.substring(0, 60)}...`);
  });

  // Build both context packs
  const v1Pack = buildContextPack(relevantMemories, { includeCognitiveProfile: true });
  const dualPack = buildDualContextPack(userMessage, relevantMemories, v1Pack.systemPrompt);

  console.log('\n📦 CONTEXT COMPARISON:');
  console.log(`   V1 Natural Language: ~${dualPack.naturalTokens} tokens`);
  console.log(`   V2 CORTEX Protocol:  ~${dualPack.protocolTokens} tokens`);
  console.log(`   Token Savings:       ${dualPack.tokenSavings} tokens (${dualPack.savingsPercent}%)`);
  
  // Show protocol preview
  console.log('\n📜 PROTOCOL PREVIEW (first 500 chars):');
  console.log('─'.repeat(40));
  const protocolPreview = dualPack.protocolPrompt.substring(
    dualPack.protocolPrompt.indexOf('CORTEX/1.0'),
    dualPack.protocolPrompt.indexOf('CORTEX/1.0') + 500
  );
  console.log(protocolPreview + '...\n');

  // Test responses
  console.log('⏳ Getting responses from Claude...\n');

  // Test 1: Baseline (no context)
  console.log('─'.repeat(80));
  console.log('📭 BASELINE (No Context):');
  console.log('─'.repeat(80));
  const baseline = await chatWithClaude(userMessage, genericSystemPrompt);
  console.log(baseline);

  // Test 2: V1 Natural Language
  console.log('\n' + '─'.repeat(80));
  console.log('📝 V1: NATURAL LANGUAGE CONTEXT:');
  console.log('─'.repeat(80));
  const v1Response = await chatWithClaude(userMessage, v1Pack.systemPrompt);
  console.log(v1Response);

  // Test 3: V2 CORTEX Protocol
  console.log('\n' + '─'.repeat(80));
  console.log('🔷 V2: CORTEX PROTOCOL:');
  console.log('─'.repeat(80));
  const v2Response = await chatWithClaude(userMessage, dualPack.protocolPrompt);
  console.log(v2Response);

  // Summary
  console.log('\n' + '═'.repeat(80));
  console.log('📈 COMPARISON SUMMARY');
  console.log('═'.repeat(80));
  console.log(`
  Token Efficiency:
    V1 Natural Language: ${dualPack.naturalTokens} tokens
    V2 CORTEX Protocol:  ${dualPack.protocolTokens} tokens
    Savings: ${dualPack.savingsPercent}% reduction

  Evaluation Criteria:
    1. Response quality - Does V2 match or exceed V1?
    2. Context understanding - Does the model parse the protocol correctly?
    3. Style alignment - Does it follow the behavioral preferences?
    4. Token efficiency - Is the savings worth it?
  `);
  console.log('═'.repeat(80) + '\n');
}

/**
 * Quick protocol test without full comparison
 */
export async function testProtocolOnly(userMessage: string) {
  console.log('\n🔷 CORTEX PROTOCOL QUICK TEST');
  console.log('─'.repeat(40));
  
  const relevantMemories = await findRelevantMemories(
    userMessage,
    embeddedMemories,
    6
  );
  
  const protocolPrompt = buildProtocolSystemPrompt(userMessage, relevantMemories);
  
  console.log('Protocol prompt tokens:', Math.ceil(protocolPrompt.length / 4));
  console.log('\nResponse:');
  console.log('─'.repeat(40));
  
  const response = await chatWithClaude(userMessage, protocolPrompt);
  console.log(response);
  console.log('─'.repeat(40) + '\n');
}
