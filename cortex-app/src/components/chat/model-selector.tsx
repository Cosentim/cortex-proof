'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Brain, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  value: 'fast' | 'balanced' | 'deep';
  onChange: (value: 'fast' | 'balanced' | 'deep') => void;
}

const models = [
  { id: 'fast', label: 'Fast', icon: Zap, description: 'Quick responses' },
  { id: 'balanced', label: 'Balanced', icon: Brain, description: 'Best mix' },
  { id: 'deep', label: 'Deep', icon: Sparkles, description: 'Most capable' },
] as const;

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="flex rounded-lg border bg-muted p-1">
      {models.map((model) => {
        const Icon = model.icon;
        const isSelected = value === model.id;
        return (
          <Button
            key={model.id}
            variant="ghost"
            size="sm"
            onClick={() => onChange(model.id)}
            className={cn(
              'flex items-center gap-1.5 px-3',
              isSelected && 'bg-background shadow-sm'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="text-xs">{model.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
