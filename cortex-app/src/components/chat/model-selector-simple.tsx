'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Check, Sparkles, Zap, Brain, FlaskConical } from 'lucide-react';

export interface ModelOption {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic';
  description: string;
  tier: 'fast' | 'standard' | 'powerful';
}

const MODELS: ModelOption[] = [
  { 
    id: 'gpt-4o-mini', 
    name: 'GPT-4o mini', 
    provider: 'openai',
    description: 'Fast & efficient',
    tier: 'fast'
  },
  { 
    id: 'claude-3-5-haiku-20241022', 
    name: 'Claude Haiku', 
    provider: 'anthropic',
    description: 'Fast & efficient',
    tier: 'fast'
  },
  { 
    id: 'gpt-4o', 
    name: 'GPT-4o', 
    provider: 'openai',
    description: 'Great for most tasks',
    tier: 'standard'
  },
  { 
    id: 'claude-sonnet-4-20250514', 
    name: 'Claude Sonnet', 
    provider: 'anthropic',
    description: 'Great for most tasks',
    tier: 'standard'
  },
  { 
    id: 'claude-opus-4-20250514', 
    name: 'Claude Opus', 
    provider: 'anthropic',
    description: 'Most powerful',
    tier: 'powerful'
  },
];

interface ModelSelectorSimpleProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  deepResearch: boolean;
  onToggleDeepResearch: (enabled: boolean) => void;
}

export function ModelSelectorSimple({ 
  selectedModel, 
  onSelectModel,
  deepResearch,
  onToggleDeepResearch 
}: ModelSelectorSimpleProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0];

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'fast': return <Zap className="h-3 w-3" />;
      case 'standard': return <Sparkles className="h-3 w-3" />;
      case 'powerful': return <Brain className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Model Selector */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-1.5 font-medium"
        >
          {currentModel.name}
          <ChevronDown className={`h-3.5 w-3.5 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 mt-1 w-56 rounded-lg border bg-popover shadow-lg z-50 py-1">
              {MODELS.map(model => (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                    selectedModel === model.id
                      ? 'bg-accent'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`${
                      model.tier === 'fast' ? 'text-green-500' :
                      model.tier === 'standard' ? 'text-blue-500' :
                      'text-purple-500'
                    }`}>
                      {getTierIcon(model.tier)}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{model.name}</div>
                      <div className="text-xs text-muted-foreground">{model.description}</div>
                    </div>
                  </div>
                  {selectedModel === model.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Deep Research Toggle */}
      <Button
        variant={deepResearch ? "default" : "outline"}
        size="sm"
        onClick={() => onToggleDeepResearch(!deepResearch)}
        className={`gap-1.5 ${deepResearch ? 'bg-primary' : ''}`}
      >
        <FlaskConical className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Deep Research</span>
      </Button>
    </div>
  );
}

export { MODELS };
