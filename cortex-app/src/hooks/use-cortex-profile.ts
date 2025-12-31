'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CortexStats {
  memoriesCount: number;
  conversationsCount: number;
  topicsLearned: string[];
  strengthScore: number;
  lastActive: string | null;
  categoriesCompleted: string[];
}

interface UseCortexProfileReturn {
  stats: CortexStats;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  teach: (content: string, category?: string) => Promise<TeachResult>;
  markCategoryComplete: (category: string) => Promise<void>;
}

interface TeachResult {
  success: boolean;
  memoriesCreated: number;
  summary: string;
}

const defaultStats: CortexStats = {
  memoriesCount: 0,
  conversationsCount: 0,
  topicsLearned: [],
  strengthScore: 0,
  lastActive: null,
  categoriesCompleted: [],
};

export function useCortexProfile(): UseCortexProfileReturn {
  const [stats, setStats] = useState<CortexStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/cortex/stats');
      
      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, use defaults
          setStats(defaultStats);
          return;
        }
        throw new Error('Failed to fetch cortex stats');
      }
      
      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching cortex stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markCategoryComplete = useCallback(async (category: string) => {
    try {
      await fetch('/api/cortex/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, completed: true }),
      });
      
      // Update local state
      setStats(prev => ({
        ...prev,
        categoriesCompleted: [...new Set([...prev.categoriesCompleted, category])],
      }));
    } catch (err) {
      console.error('Error marking category complete:', err);
    }
  }, []);

  const teach = useCallback(async (content: string, category?: string): Promise<TeachResult> => {
    try {
      const response = await fetch('/api/teach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content,
          context: category ? `User is teaching about: ${category}` : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to teach cortex');
      }

      const result = await response.json();
      
      // Mark category as completed if provided
      if (category) {
        await markCategoryComplete(category);
      }
      
      // Refresh stats after teaching
      await fetchStats();
      
      return {
        success: true,
        memoriesCreated: result.memoriesCreated,
        summary: result.summary,
      };
    } catch (err) {
      console.error('Error teaching cortex:', err);
      return {
        success: false,
        memoriesCreated: 0,
        summary: 'Failed to save memories',
      };
    }
  }, [fetchStats, markCategoryComplete]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
    teach,
    markCategoryComplete,
  };
}
