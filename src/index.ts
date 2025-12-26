import 'dotenv/config';
import { runComparison, initializeMemories } from './compare';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askForPrompt() {
  rl.question('\n💬 Enter your prompt (or "quit" to exit): ', async (input) => {
    const trimmed = input.trim();

    if (trimmed.toLowerCase() === 'quit' || trimmed.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!\n');
      rl.close();
      process.exit(0);
    }

    if (!trimmed) {
      askForPrompt();
      return;
    }

    try {
      await runComparison(trimmed);
    } catch (error) {
      console.error('\n❌ Error:', error);
    }

    askForPrompt();
  });
}

async function main() {
  console.log('\n🧠 CORTEX PROOF OF CONCEPT');
  console.log('─'.repeat(40));
  console.log('This tool compares AI responses with and without');
  console.log('context injection to validate the core thesis.');
  console.log('─'.repeat(40));

  try {
    await initializeMemories();
    console.log('\n✅ Memories embedded and ready!');
    askForPrompt();
  } catch (error) {
    console.error('\n❌ Failed to initialize:', error);
    process.exit(1);
  }
}

main().catch(console.error);
