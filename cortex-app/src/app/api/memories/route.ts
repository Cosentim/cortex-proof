import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/ai/embeddings';
import type { CognitiveLayer, MemoryType } from '@/lib/types/cognitive';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const layer = searchParams.get('layer') as CognitiveLayer | null;
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('memories')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (layer) {
    query = query.eq('layer', layer);
  }

  if (search) {
    query = query.ilike('content', `%${search}%`);
  }

  const { data: memories, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ 
    memories, 
    total: count,
    hasMore: (offset + limit) < (count || 0),
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { layer, memory_type, content, source = 'manual', metadata = {} } = body;

  if (!layer || !memory_type || !content) {
    return NextResponse.json(
      { error: 'layer, memory_type, and content are required' },
      { status: 400 }
    );
  }

  // Generate embedding for the memory
  const embedding = await generateEmbedding(content);

  const { data: memory, error } = await supabase
    .from('memories')
    .insert({
      user_id: user.id,
      layer: layer as CognitiveLayer,
      memory_type: memory_type as MemoryType,
      content,
      embedding,
      source,
      metadata,
      confidence: 0.8,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ memory }, { status: 201 });
}
