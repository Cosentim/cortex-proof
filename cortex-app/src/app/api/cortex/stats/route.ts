import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user profile with cognitive data
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('cognitive_profile, onboarding_progress')
      .eq('id', user.id)
      .single();

    // Get memories count by layer
    const { data: memories } = await supabase
      .from('memories')
      .select('layer, memory_type, content')
      .eq('user_id', user.id)
      .eq('is_active', true);

    // Get conversation count
    const { count: conversationsCount } = await supabase
      .from('chat_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Calculate stats
    const memoriesCount = memories?.length || 0;
    
    // Extract unique topics from memories
    const topicsSet = new Set<string>();
    memories?.forEach(m => {
      if (m.layer === 'knowledge' || m.layer === 'identity') {
        topicsSet.add(m.memory_type.replace('_', ' '));
      }
    });
    const topicsLearned = Array.from(topicsSet).slice(0, 8);

    // Calculate strength score based on profile completeness
    const cognitiveProfile = profile?.cognitive_profile || {};
    const onboardingProgress = profile?.onboarding_progress || {};
    
    // Strength factors:
    // - Memories: 40% (max 50 memories = 40 points)
    // - Categories completed: 30% (6 categories = 30 points)
    // - Conversations: 15% (max 20 conversations = 15 points)  
    // - Topics diversity: 15% (max 8 topics = 15 points)
    
    const memoriesScore = Math.min(memoriesCount / 50, 1) * 40;
    const categoriesCompleted = Object.keys(onboardingProgress).filter(
      k => onboardingProgress[k]?.completed
    ).length;
    const categoriesScore = (categoriesCompleted / 6) * 30;
    const conversationsScore = Math.min((conversationsCount || 0) / 20, 1) * 15;
    const topicsScore = (topicsLearned.length / 8) * 15;
    
    const strengthScore = Math.round(
      memoriesScore + categoriesScore + conversationsScore + topicsScore
    );

    // Get last activity
    const { data: lastLog } = await supabase
      .from('chat_logs')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      stats: {
        memoriesCount,
        conversationsCount: conversationsCount || 0,
        topicsLearned,
        strengthScore,
        lastActive: lastLog?.created_at || null,
        categoriesCompleted: Object.keys(onboardingProgress).filter(
          k => onboardingProgress[k]?.completed
        ),
      },
      cognitiveProfile,
      onboardingProgress,
    });
  } catch (error) {
    console.error('Cortex stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cortex stats' },
      { status: 500 }
    );
  }
}

// Update category completion status
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { category, completed } = await request.json();

  if (!category) {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 });
  }

  try {
    // Get current progress
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('onboarding_progress')
      .eq('id', user.id)
      .single();

    const currentProgress = profile?.onboarding_progress || {};
    
    // Update the specific category
    const updatedProgress = {
      ...currentProgress,
      [category]: {
        completed: completed ?? true,
        completedAt: new Date().toISOString(),
      },
    };

    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        onboarding_progress: updatedProgress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      onboardingProgress: updatedProgress 
    });
  } catch (error) {
    console.error('Update progress error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
