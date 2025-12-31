import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractMemories } from '@/lib/cognitive/extraction';
import { generateEmbedding } from '@/lib/ai/embeddings';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { content, context } = await request.json();

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  try {
    // Extract memories from the content
    const extraction = await extractMemories(content, context);

    // Create memories in database
    const createdMemories = [];
    
    for (const mem of extraction.memories) {
      const embedding = await generateEmbedding(mem.content);
      
      const { data: memory, error } = await supabase
        .from('memories')
        .insert({
          user_id: user.id,
          layer: mem.layer,
          memory_type: mem.type,
          content: mem.content,
          embedding,
          confidence: mem.importance,
          source: 'teach',
          metadata: {
            reasoning: mem.reasoning,
            originalContent: content.substring(0, 500),
          },
        })
        .select()
        .single();
      
      if (!error && memory) {
        createdMemories.push(memory);
      }
    }

    return NextResponse.json({
      success: true,
      memoriesCreated: createdMemories.length,
      summary: extraction.summary,
      memories: createdMemories,
    });
  } catch (error) {
    console.error('Teach error:', error);
    return NextResponse.json(
      { error: 'Failed to extract memories' },
      { status: 500 }
    );
  }
}
