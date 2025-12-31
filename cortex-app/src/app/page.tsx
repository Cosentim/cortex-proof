'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatInterface } from '@/components/chat';
import { CortexNav, CortexBrain } from '@/components/cortex';
import { UserMenu } from '@/components/auth';
import { useCortexProfile } from '@/hooks';
import { Brain, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type CortexMode = 'chat' | 'cortex';

export default function Home() {
  const [mode, setMode] = useState<CortexMode>('chat');
  const [showTeachPrompt, setShowTeachPrompt] = useState(false);
  
  // Real stats from Supabase
  const { stats: cortexStats, refresh } = useCortexProfile();

  // Show teach prompt after a delay if cortex is weak
  useEffect(() => {
    if (cortexStats.strengthScore < 25 && mode === 'chat') {
      const timer = setTimeout(() => {
        setShowTeachPrompt(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [cortexStats.strengthScore, mode]);

  const handleTeach = (prompt: string, category: string) => {
    // Switch to chat mode and pre-fill with the teaching prompt
    setMode('chat');
    setShowTeachPrompt(false);
    // Dispatch custom event to communicate with ChatInterface
    window.dispatchEvent(new CustomEvent('cortex-teach', { 
      detail: { prompt, category } 
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CORTEX</span>
          </div>
        </div>
        
        {/* Navigation */}
        <CortexNav 
          mode={mode} 
          onModeChange={setMode}
          cortexStrength={cortexStats.strengthScore}
        />

        {/* User Menu & Settings */}
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ChatInterface 
                showTeachPrompt={showTeachPrompt}
                onDismissTeachPrompt={() => setShowTeachPrompt(false)}
                onTeach={handleTeach}
                onConversationEnd={refresh}
              />
            </motion.div>
          ) : (
            <motion.div
              key="cortex"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto"
            >
              <CortexBrain 
                stats={cortexStats}
                onTeach={handleTeach}
                completedCategories={cortexStats.categoriesCompleted}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
