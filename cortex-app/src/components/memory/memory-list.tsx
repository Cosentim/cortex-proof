'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Pin, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Memory, CognitiveLayer } from '@/lib/types/cognitive';

interface MemoryListProps {
  memories: Memory[];
  loading: boolean;
  onDelete: (id: string) => void;
  onPin: (id: string, isPinned: boolean) => void;
}

const LAYER_EMOJI: Record<CognitiveLayer, string> = {
  identity: '🎭',
  preferences: '⚙️',
  knowledge: '📚',
  relational: '👥',
  temporal: '📅',
};

export function MemoryList({ memories, loading, onDelete, onPin }: MemoryListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <p className="text-muted-foreground">No memories yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Use &quot;Teach&quot; to add memories or chat to learn automatically
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {memories.map((memory, index) => (
        <motion.div
          key={memory.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <Card className={memory.is_pinned ? 'border-primary/50' : ''}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span>{LAYER_EMOJI[memory.layer]}</span>
                    <Badge variant={memory.layer} className="text-xs capitalize">
                      {memory.layer}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {memory.memory_type.replace(/_/g, ' ')}
                    </Badge>
                    {memory.is_pinned && (
                      <Pin className="h-3 w-3 text-primary fill-current" />
                    )}
                  </div>
                  <p className="text-sm line-clamp-3">{memory.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{new Date(memory.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{Math.round(memory.confidence * 100)}% confidence</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onPin(memory.id, memory.is_pinned)}
                  >
                    <Pin className={`h-3.5 w-3.5 ${memory.is_pinned ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onDelete(memory.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
