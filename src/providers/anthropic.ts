import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function chatWithClaude(
  userMessage: string,
  systemPrompt: string,
  model: string = 'claude-sonnet-4-20250514'
): Promise<string> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock && textBlock.type === 'text' ? textBlock.text : '';
}
