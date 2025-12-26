import OpenAI from 'openai';

const openai = new OpenAI();

export async function chatWithGPT(
  userMessage: string,
  systemPrompt: string,
  model: string = 'gpt-4.1-2025-04-14'
): Promise<string> {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 1000,
  });

  return response.choices[0].message.content || '';
}
