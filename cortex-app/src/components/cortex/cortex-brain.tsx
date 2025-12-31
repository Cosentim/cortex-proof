'use client';

import { motion } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  TrendingUp,
  MessageSquare,
  Lightbulb
} from 'lucide-react';
import { TeachCortex } from './teach-cortex';

interface CortexStats {
  memoriesCount: number;
  conversationsCount: number;
  topicsLearned: string[];
  strengthScore: number; // 0-100
  lastActive: Date | null;
}

interface CortexBrainProps {
  stats: CortexStats;
  onTeach: (prompt: string, category: string) => void;
  completedCategories?: string[];
}

export function CortexBrain({ stats, onTeach, completedCategories = [] }: CortexBrainProps) {
  const strengthLevel = getStrengthLevel(stats.strengthScore);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      {/* Header / Brain Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="relative inline-block mb-4">
          <div className={`
            p-6 rounded-full 
            ${strengthLevel.bgColor}
            transition-colors duration-500
          `}>
            <Brain className={`h-16 w-16 ${strengthLevel.color}`} />
          </div>
          {stats.strengthScore > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 p-1.5 bg-background rounded-full shadow-lg"
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </motion.div>
          )}
        </div>
        <h2 className="text-2xl font-bold mb-2">Your Cortex</h2>
        <p className="text-muted-foreground">
          {strengthLevel.message}
        </p>
      </motion.div>

      {/* Strength Meter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-muted/30 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Cortex Strength</span>
          <span className="text-sm text-muted-foreground">{stats.strengthScore}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.strengthScore}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${strengthLevel.barColor}`}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {getStrengthTip(stats.strengthScore)}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3"
      >
        <StatCard
          icon={<Lightbulb className="h-4 w-4" />}
          label="Memories"
          value={stats.memoriesCount}
        />
        <StatCard
          icon={<MessageSquare className="h-4 w-4" />}
          label="Conversations"
          value={stats.conversationsCount}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Topics"
          value={stats.topicsLearned.length}
        />
      </motion.div>

      {/* Knowledge Areas */}
      {stats.topicsLearned.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-medium">What I Know About You</h3>
          <div className="flex flex-wrap gap-2">
            {stats.topicsLearned.map((topic, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Teach Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-muted/20 rounded-xl p-4"
      >
        <TeachCortex 
          onTeach={onTeach} 
          completedCategories={completedCategories}
        />
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-background border rounded-lg p-3 text-center">
      <div className="flex justify-center text-muted-foreground mb-1">
        {icon}
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function getStrengthLevel(score: number) {
  if (score === 0) {
    return {
      message: "We're just getting started. Help me learn about you.",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      barColor: "bg-muted-foreground",
    };
  }
  if (score < 25) {
    return {
      message: "I'm starting to understand you. Keep teaching me!",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      barColor: "bg-blue-500",
    };
  }
  if (score < 50) {
    return {
      message: "We're building a connection. I'm learning your patterns.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      barColor: "bg-emerald-500",
    };
  }
  if (score < 75) {
    return {
      message: "I know you well. Our conversations are becoming richer.",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      barColor: "bg-amber-500",
    };
  }
  return {
    message: "Deep understanding achieved. I truly know how to help you.",
    color: "text-primary",
    bgColor: "bg-primary/10",
    barColor: "bg-primary",
  };
}

function getStrengthTip(score: number): string {
  if (score < 25) {
    return "Tip: Share your goals and interests to help me understand you better.";
  }
  if (score < 50) {
    return "Tip: Tell me about how you like to work and learn.";
  }
  if (score < 75) {
    return "Tip: Share what matters most to you for deeper personalization.";
  }
  return "Your Cortex is well-developed! I can provide highly personalized assistance.";
}
