'use client';

import { motion } from 'framer-motion';
import { X, Search, Code, FileText, Brain, Globe, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

interface ToolsPanelProps {
  tools: Tool[];
  onToggleTool: (toolId: string) => void;
  onClose: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  search: Globe,
  code: Code,
  file: FileText,
  brain: Brain,
  calculator: Calculator,
};

export function ToolsPanel({ tools, onToggleTool, onClose }: ToolsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-b bg-muted/30 overflow-hidden"
    >
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Available Tools</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tools.map((tool) => {
            const IconComponent = iconMap[tool.icon] || Search;
            return (
              <button
                key={tool.id}
                onClick={() => onToggleTool(tool.id)}
                className={`
                  flex items-center gap-2 p-2.5 rounded-lg text-left transition-all
                  ${tool.enabled 
                    ? 'bg-primary/10 border border-primary/30 text-primary' 
                    : 'bg-background border border-border hover:border-primary/30'
                  }
                `}
              >
                <div className={`
                  p-1.5 rounded-md 
                  ${tool.enabled ? 'bg-primary/20' : 'bg-muted'}
                `}>
                  <IconComponent className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{tool.name}</p>
                </div>
                <div className={`
                  w-2 h-2 rounded-full flex-shrink-0
                  ${tool.enabled ? 'bg-primary' : 'bg-muted-foreground/30'}
                `} />
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Enable tools to extend CORTEX&apos;s capabilities. Active tools can be used during your conversation.
        </p>
      </div>
    </motion.div>
  );
}
