'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ChevronRight, 
  Lightbulb,
  Heart,
  Target,
  Compass,
  BookOpen,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Science-backed categories for cognitive profiling
const TEACH_PROMPTS = [
  {
    id: 'goals',
    category: 'Goals & Aspirations',
    icon: Target,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    prompts: [
      "What's one goal you're working toward right now?",
      "Where do you see yourself in 5 years?",
      "What achievement are you most proud of?",
    ]
  },
  {
    id: 'values',
    category: 'Values & Beliefs',
    icon: Heart,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    prompts: [
      "What matters most to you in life?",
      "What principle guides your decisions?",
      "What would you never compromise on?",
    ]
  },
  {
    id: 'thinking',
    category: 'How You Think',
    icon: Lightbulb,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    prompts: [
      "Are you more analytical or intuitive?",
      "How do you approach big decisions?",
      "Do you prefer details or big picture?",
    ]
  },
  {
    id: 'interests',
    category: 'Interests & Passions',
    icon: Compass,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    prompts: [
      "What topics could you talk about for hours?",
      "What do you do in your free time?",
      "What skill would you love to master?",
    ]
  },
  {
    id: 'learning',
    category: 'Learning Style',
    icon: BookOpen,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    prompts: [
      "How do you prefer to learn new things?",
      "Do you learn by doing or by reading?",
      "What helps you remember information?",
    ]
  },
  {
    id: 'energy',
    category: 'Energy & Motivation',
    icon: Zap,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    prompts: [
      "What energizes you?",
      "When are you most productive?",
      "What drains your energy?",
    ]
  },
];

interface TeachCortexProps {
  onTeach: (prompt: string, category: string) => void;
  completedCategories?: string[];
  minimal?: boolean;
}

export function TeachCortex({ onTeach, completedCategories = [], minimal = false }: TeachCortexProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  // Rotate through prompts subtly
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex(prev => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (minimal) {
    // Subtle inline prompt for main chat view
    const randomCategory = TEACH_PROMPTS[Math.floor(currentPromptIndex / 3) % TEACH_PROMPTS.length];
    const promptIndex = currentPromptIndex % randomCategory.prompts.length;
    const Icon = randomCategory.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border border-primary/10"
      >
        <div className={`p-2 rounded-lg ${randomCategory.bgColor}`}>
          <Icon className={`h-4 w-4 ${randomCategory.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-0.5">Help me understand you better</p>
          <p className="text-sm font-medium truncate">{randomCategory.prompts[promptIndex]}</p>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          className="shrink-0"
          onClick={() => onTeach(randomCategory.prompts[promptIndex], randomCategory.id)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Teach Your Cortex</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        The more I understand about you, the better I can help. Share what feels comfortable.
      </p>
      
      <div className="grid gap-2">
        {TEACH_PROMPTS.map((category) => {
          const Icon = category.icon;
          const isCompleted = completedCategories.includes(category.id);
          const isActive = activeCategory === category.id;
          const promptIndex = currentPromptIndex % category.prompts.length;

          return (
            <motion.div key={category.id} layout>
              <button
                onClick={() => setActiveCategory(isActive ? null : category.id)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all
                  ${isActive ? 'bg-muted' : 'hover:bg-muted/50'}
                  ${isCompleted ? 'opacity-60' : ''}
                `}
              >
                <div className={`p-2 rounded-lg ${category.bgColor}`}>
                  <Icon className={`h-4 w-4 ${category.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{category.category}</p>
                  {isCompleted && (
                    <p className="text-xs text-muted-foreground">✓ Learned</p>
                  )}
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isActive ? 'rotate-90' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-12 pr-3 py-2 space-y-2">
                      {category.prompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => onTeach(prompt, category.id)}
                          className="w-full text-left text-sm p-2 rounded-md hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
