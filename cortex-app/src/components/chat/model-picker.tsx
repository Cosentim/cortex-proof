'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Brain, ChevronDown, Check } from 'lucide-react';

interface ModelConfig {
  id: string;
  provider: 'openai' | 'anthropic';
  name: string;
  enabled: boolean;
}

interface ModelPreferences {
  selectedModel: string;
  models: Record<string, { enabled?: boolean }>;
}

const ALL_MODELS: ModelConfig[] = [
  { id: 'gpt-4o-mini', provider: 'openai', name: 'GPT-4o Mini', enabled: true },
  { id: 'gpt-4o', provider: 'openai', name: 'GPT-4o', enabled: true },
  { id: 'gpt-4-turbo', provider: 'openai', name: 'GPT-4 Turbo', enabled: true },
  { id: 'claude-sonnet-4-20250514', provider: 'anthropic', name: 'Claude Sonnet', enabled: true },
  { id: 'claude-3-5-haiku-20241022', provider: 'anthropic', name: 'Claude Haiku', enabled: true },
  { id: 'claude-opus-4-20250514', provider: 'anthropic', name: 'Claude Opus', enabled: true },
];

interface ModelPickerProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  preferences?: ModelPreferences | null;
}

export function ModelPicker({ selectedModel, onSelectModel, preferences }: ModelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get enabled models based on preferences
  const enabledModels = ALL_MODELS.filter(m => {
    if (!preferences?.models) return true;
    return preferences.models[m.id]?.enabled !== false;
  });

  const currentModel = ALL_MODELS.find(m => m.id === selectedModel) || enabledModels[0];

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        {currentModel.provider === 'openai' ? (
          <Zap className="h-3 w-3 text-green-500" />
        ) : (
          <Brain className="h-3 w-3 text-orange-500" />
        )}
        <span className="hidden sm:inline">{currentModel.name}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 rounded-lg border bg-popover shadow-lg z-50">
            <div className="p-2">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                Select Model
              </p>
              {enabledModels.map(model => (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-2 rounded-md text-left transition-colors ${
                    selectedModel === model.id
                      ? 'bg-primary/10'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {model.provider === 'openai' ? (
                      <Zap className="h-4 w-4 text-green-500" />
                    ) : (
                      <Brain className="h-4 w-4 text-orange-500" />
                    )}
                    <div>
                      <span className="text-sm font-medium">{model.name}</span>
                      <Badge 
                        variant="secondary" 
                        className={`ml-2 text-[10px] ${
                          model.provider === 'openai' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}
                      >
                        {model.provider === 'openai' ? 'OpenAI' : 'Anthropic'}
                      </Badge>
                    </div>
                  </div>
                  {selectedModel === model.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
