'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MemoryList } from './memory-list';
import { TeachModal } from './teach-modal';
import type { Memory, CognitiveLayer } from '@/lib/types/cognitive';

interface MemoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LAYERS: CognitiveLayer[] = ['identity', 'preferences', 'knowledge', 'relational', 'temporal'];

export function MemoryDrawer({ isOpen, onClose }: MemoryDrawerProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<CognitiveLayer | null>(null);
  const [showTeachModal, setShowTeachModal] = useState(false);

  const fetchMemories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedLayer) params.set('layer', selectedLayer);
      params.set('limit', '100');

      const res = await fetch(`/api/memories?${params}`);
      const data = await res.json();
      setMemories(data.memories || []);
    } catch (error) {
      console.error('Failed to fetch memories:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedLayer]);

  useEffect(() => {
    if (isOpen) {
      fetchMemories();
    }
  }, [isOpen, fetchMemories]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      setMemories(memories.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete memory:', error);
    }
  };

  const handlePin = async (id: string, isPinned: boolean) => {
    try {
      await fetch(`/api/memories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_pinned: !isPinned }),
      });
      setMemories(memories.map(m => 
        m.id === id ? { ...m, is_pinned: !isPinned } : m
      ));
    } catch (error) {
      console.error('Failed to update memory:', error);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Memory Bank</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTeachModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Teach
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Layer Filter */}
              <div className="p-4 border-b overflow-x-auto">
                <div className="flex gap-2">
                  <Badge
                    variant={selectedLayer === null ? 'default' : 'outline'}
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => setSelectedLayer(null)}
                  >
                    All
                  </Badge>
                  {LAYERS.map((layer) => (
                    <Badge
                      key={layer}
                      variant={selectedLayer === layer ? layer : 'outline'}
                      className="cursor-pointer whitespace-nowrap capitalize"
                      onClick={() => setSelectedLayer(layer)}
                    >
                      {layer}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Memory List */}
              <div className="flex-1 overflow-y-auto p-4">
                <MemoryList
                  memories={memories}
                  loading={loading}
                  onDelete={handleDelete}
                  onPin={handlePin}
                />
              </div>

              {/* Stats */}
              <div className="p-4 border-t bg-muted/50">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{memories.length} memories</span>
                  <span>{memories.filter(m => m.is_pinned).length} pinned</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <TeachModal
        open={showTeachModal}
        onClose={() => setShowTeachModal(false)}
        onSuccess={fetchMemories}
      />
    </>
  );
}
