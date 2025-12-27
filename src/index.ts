import 'dotenv/config';
import { runComparison, initializeMemories } from './compare';
import { runV2Comparison, initializeMemoriesV2 } from './compare-v2';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let currentMode: 'v1' | 'v2' = 'v2'; // Default to v2

function askForPrompt() {
  const modeLabel = currentMode === 'v2' ? '🔷 V2 Protocol' : '📝 V1 Natural';
  rl.question(`\n${modeLabel} 💬 Enter prompt (or "help"): `, async (input) => {
    const trimmed = input.trim();

    if (trimmed.toLowerCase() === 'quit' || trimmed.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!\n');
      rl.close();
      process.exit(0);
    }

    if (trimmed.toLowerCase() === 'help') {
      console.log('\n📖 COMMANDS:');
      console.log('  v1     - Switch to V1 natural language mode');
      console.log('  v2     - Switch to V2 CORTEX Protocol mode');
      console.log('  quit   - Exit the program');
      console.log('  <text> - Run comparison with your prompt\n');
      askForPrompt();
      return;
    }

    if (trimmed.toLowerCase() === 'v1') {
      currentMode = 'v1';
      console.log('\n📝 Switched to V1 Natural Language mode');
      askForPrompt();
      return;
    }

    if (trimmed.toLowerCase() === 'v2') {
      currentMode = 'v2';
      console.log('\n🔷 Switched to V2 CORTEX Protocol mode');
      askForPrompt();
      return;
    }

    if (!trimmed) {
      askForPrompt();
      return;
    }

    try {
      if (currentMode === 'v2') {
        await runV2Comparison(trimmed);
      } else {
        await runComparison(trimmed);
      }
    } catch (error) {
      console.error('\n❌ Error:', error);
    }

    askForPrompt();
  });
}

async function main() {
  console.log('\n🧠 CORTEX PROOF OF CONCEPT v2');
  console.log('═'.repeat(50));
  console.log('Testing the CORTEX Protocol for token-efficient');
  console.log('AI context injection.');
  console.log('═'.repeat(50));
  console.log('\nModes:');
  console.log('  📝 V1 - Natural language context (baseline)');
  console.log('  🔷 V2 - CORTEX Protocol (token-efficient)');
  console.log('\nType "v1" or "v2" to switch modes, "help" for commands.');
  console.log('─'.repeat(50));

  try {
    // Initialize both v1 and v2
    await initializeMemories();
    await initializeMemoriesV2();
    console.log('\n✅ Memories embedded and ready!');
    console.log(`🔷 Starting in V2 Protocol mode\n`);
    askForPrompt();
  } catch (error) {
    console.error('\n❌ Failed to initialize:', error);
    process.exit(1);
  }
}

main().catch(console.error);
