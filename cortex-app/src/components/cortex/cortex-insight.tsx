'use client';

import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CortexInsightProps {
  insight: string;
  onDismiss: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

export function CortexInsight({ insight, onDismiss, onAction, actionLabel }: CortexInsightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg"
    >
      <div className="p-1.5 bg-primary/10 rounded-md">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{insight}</p>
        {onAction && actionLabel && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 mt-1 text-primary"
            onClick={onAction}
          >
            {actionLabel} →
          </Button>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={onDismiss}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </motion.div>
  );
}
