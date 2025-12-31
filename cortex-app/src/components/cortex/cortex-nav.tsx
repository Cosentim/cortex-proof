'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Brain, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type CortexMode = 'chat' | 'cortex';

interface CortexNavProps {
  mode: CortexMode;
  onModeChange: (mode: CortexMode) => void;
  cortexStrength?: number; // 0-100, how "developed" the user's cortex is
}

export function CortexNav({ mode, onModeChange, cortexStrength = 0 }: CortexNavProps) {
  return (
    <div className="flex items-center justify-center gap-1 p-1 bg-muted/50 rounded-lg">
      <NavButton
        active={mode === 'chat'}
        onClick={() => onModeChange('chat')}
        icon={<MessageSquare className="h-4 w-4" />}
        label="Chat"
      />
      <NavButton
        active={mode === 'cortex'}
        onClick={() => onModeChange('cortex')}
        icon={<Brain className="h-4 w-4" />}
        label="Your Cortex"
        badge={cortexStrength > 0 ? (
          <span className="ml-1.5 flex items-center gap-0.5 text-[10px] text-primary">
            <Sparkles className="h-2.5 w-2.5" />
            {cortexStrength}%
          </span>
        ) : undefined}
      />
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
}

function NavButton({ active, onClick, icon, label, badge }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all",
        active 
          ? "text-foreground" 
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-background shadow-sm rounded-md"
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        />
      )}
      <span className="relative flex items-center gap-1.5">
        {icon}
        {label}
        {badge}
      </span>
    </button>
  );
}
