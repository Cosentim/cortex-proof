import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('preferences')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    modelSettings: profile?.preferences?.modelSettings || null,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { modelSettings } = await request.json();

  // Get current preferences
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('preferences')
    .eq('id', user.id)
    .single();

  const currentPrefs = profile?.preferences || {};

  // Update preferences with new model settings
  const { error } = await supabase
    .from('user_profiles')
    .update({
      preferences: {
        ...currentPrefs,
        modelSettings,
      },
    })
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
