import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import type { ModelStrength } from '../types/cognitive';

export const MODEL_CONFIGS = {
  fast: {
    provider: 'openai' as const,
    modelId: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    maxTokens: 2048,
    temperature: 0.7,
  },
  balanced: {
    provider: 'anthropic' as const,
    modelId: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet',
    maxTokens: 4096,
    temperature: 0.7,
  },
  deep: {
    provider: 'openai' as const,
    modelId: 'gpt-4o',
    name: 'GPT-4o',
    maxTokens: 4096,
    temperature: 0.7,
  },
} as const;

export function getModelConfig(strength: ModelStrength) {
  return MODEL_CONFIGS[strength];
}

export function getModel(strength: ModelStrength) {
  const config = MODEL_CONFIGS[strength];
  if (config.provider === 'anthropic') {
    return anthropic(config.modelId);
  }
  return openai(config.modelId);
}
