'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Settings, Zap, Brain, Sparkles, ChevronDown, ChevronUp, Save, RotateCcw } from 'lucide-react';

export interface ModelConfig {
  id: string;
  provider: 'openai' | 'anthropic';
  name: string;
  description: string;
  maxTokensLimit: number;
  // User customizable
  enabled: boolean;
  temperature: number;
  maxTokens: number;
  tuningPrompt: string;
}

export interface ModelPreferences {
  selectedModel: string;
  models: Record<string, Partial<ModelConfig>>;
}

const DEFAULT_MODELS: ModelConfig[] = [
  {
    id: 'gpt-4o-mini',
    provider: 'openai',
    name: 'GPT-4o Mini',
    description: 'Fast and efficient for simple tasks',
    maxTokensLimit: 4096,
    enabled: true,
    temperature: 0.7,
    maxTokens: 2048,
    tuningPrompt: '',
  },
  {
    id: 'gpt-4o',
    provider: 'openai',
    name: 'GPT-4o',
    description: 'Most capable OpenAI model for complex reasoning',
    maxTokensLimit: 8192,
    enabled: true,
    temperature: 0.7,
    maxTokens: 4096,
    tuningPrompt: '',
  },
  {
    id: 'gpt-4-turbo',
    provider: 'openai',
    name: 'GPT-4 Turbo',
    description: 'High capability with extended context window',
    maxTokensLimit: 4096,
    enabled: true,
    temperature: 0.7,
    maxTokens: 4096,
    tuningPrompt: '',
  },
  {
    id: 'claude-sonnet-4-20250514',
    provider: 'anthropic',
    name: 'Claude Sonnet',
    description: 'Balanced performance with nuanced understanding',
    maxTokensLimit: 8192,
    enabled: true,
    temperature: 0.7,
    maxTokens: 4096,
    tuningPrompt: '',
  },
  {
    id: 'claude-3-5-haiku-20241022',
    provider: 'anthropic',
    name: 'Claude Haiku',
    description: 'Fast and affordable for quick tasks',
    maxTokensLimit: 4096,
    enabled: true,
    temperature: 0.7,
    maxTokens: 2048,
    tuningPrompt: '',
  },
  {
    id: 'claude-opus-4-20250514',
    provider: 'anthropic',
    name: 'Claude Opus',
    description: 'Most powerful Claude for complex analysis',
    maxTokensLimit: 8192,
    enabled: true,
    temperature: 0.7,
    maxTokens: 4096,
    tuningPrompt: '',
  },
];

interface ModelSettingsProps {
  preferences: ModelPreferences | null;
  onSave: (preferences: ModelPreferences) => Promise<void>;
  onClose?: () => void;
}

export function ModelSettings({ preferences, onSave, onClose }: ModelSettingsProps) {
  const [models, setModels] = useState<ModelConfig[]>(DEFAULT_MODELS);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini');
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    if (preferences) {
      setSelectedModel(preferences.selectedModel || 'gpt-4o-mini');
      
      // Merge saved preferences with defaults
      const mergedModels = DEFAULT_MODELS.map(defaultModel => {
        const savedConfig = preferences.models?.[defaultModel.id];
        if (savedConfig) {
          return { ...defaultModel, ...savedConfig };
        }
        return defaultModel;
      });
      setModels(mergedModels);
    }
  }, [preferences]);

  const updateModel = (modelId: string, updates: Partial<ModelConfig>) => {
    setModels(prev => prev.map(m => 
      m.id === modelId ? { ...m, ...updates } : m
    ));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const modelPrefs: Record<string, Partial<ModelConfig>> = {};
      models.forEach(m => {
        modelPrefs[m.id] = {
          enabled: m.enabled,
          temperature: m.temperature,
          maxTokens: m.maxTokens,
          tuningPrompt: m.tuningPrompt,
        };
      });
      
      await onSave({
        selectedModel,
        models: modelPrefs,
      });
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (modelId: string) => {
    const defaultModel = DEFAULT_MODELS.find(m => m.id === modelId);
    if (defaultModel) {
      updateModel(modelId, {
        temperature: defaultModel.temperature,
        maxTokens: defaultModel.maxTokens,
        tuningPrompt: '',
      });
    }
  };

  const enabledModels = models.filter(m => m.enabled);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Model Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose and customize AI models for your conversations
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      {/* Quick Select */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Default Model</CardTitle>
          <CardDescription>Choose the model used for new conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {enabledModels.map(model => (
              <button
                key={model.id}
                onClick={() => {
                  setSelectedModel(model.id);
                  setHasChanges(true);
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedModel === model.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {model.provider === 'openai' ? (
                    <Zap className="h-4 w-4 text-green-500" />
                  ) : (
                    <Brain className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="font-medium text-sm">{model.name}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {model.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Configurations */}
      <div className="space-y-3">
        <h3 className="font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Model Tuning
        </h3>
        
        {models.map(model => (
          <Card key={model.id} className={!model.enabled ? 'opacity-60' : ''}>
            <CardHeader 
              className="pb-2 cursor-pointer"
              onClick={() => setExpandedModel(expandedModel === model.id ? null : model.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={model.enabled}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateModel(model.id, { enabled: e.target.checked });
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      {model.provider === 'openai' ? (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          OpenAI
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          Anthropic
                        </Badge>
                      )}
                      <span className="font-medium">{model.name}</span>
                      {selectedModel === model.id && (
                        <Badge className="text-xs">Default</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {model.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {model.tuningPrompt && (
                    <Badge variant="outline" className="text-xs">Tuned</Badge>
                  )}
                  {expandedModel === model.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            {expandedModel === model.id && (
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Temperature
                      <span className="text-muted-foreground font-normal ml-1">
                        ({model.temperature})
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={model.temperature}
                      onChange={(e) => updateModel(model.id, { temperature: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Precise</span>
                      <span>Creative</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Max Tokens
                    </label>
                    <Input
                      type="number"
                      min="256"
                      max={model.maxTokensLimit}
                      value={model.maxTokens}
                      onChange={(e) => updateModel(model.id, { maxTokens: parseInt(e.target.value) || 2048 })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max: {model.maxTokensLimit.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Custom Tuning Prompt
                  </label>
                  <Textarea
                    placeholder="Add custom instructions for this model... (e.g., 'Be more concise' or 'Always provide examples')"
                    value={model.tuningPrompt}
                    onChange={(e) => updateModel(model.id, { tuningPrompt: e.target.value })}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be added to the system prompt when using this model
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReset(model.id)}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
