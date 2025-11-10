/**
 * AI Intelligent Search API
 * Search across tasks, notes, passwords using natural language
 */

import { NextRequest, NextResponse } from 'next/server';
import { intelligentSearch, AISearchRequest } from '@/lib/ai/gemini';
import { authenticateRequest } from '@/lib/middleware/auth';
import { supabaseAdmin } from '@/lib/db/supabase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    if (query.length > 500) {
      return NextResponse.json(
        { error: 'Query too long (max 500 characters)' },
        { status: 400 }
      );
    }

    // Fetch user's data from database
    const [tasksResult, pagesResult, boardsResult, passwordsResult] = await Promise.all([
      supabaseAdmin
        .from('tasks')
        .select('id, title, description, priority, due_date, due_time, completed, category')
        .eq('user_id', user.userId)
        .limit(50),
      supabaseAdmin
        .from('pages')
        .select('id, title, content, icon')
        .eq('user_id', user.userId)
        .limit(50),
      supabaseAdmin
        .from('boards')
        .select('id, title, description')
        .eq('user_id', user.userId)
        .limit(50),
      supabaseAdmin
        .from('passwords')
        .select('id, service_name, username, url, notes')
        .eq('user_id', user.userId)
        .limit(50),
    ]);

    const context: AISearchRequest['context'] = {
      tasks: tasksResult.data || [],
      notes: pagesResult.data || [],
      boards: boardsResult.data || [],
      passwords: passwordsResult.data || [],
    };

    // Perform AI search
    const result = await intelligentSearch({ query, context });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('[AI Search] Error:', error);
    return NextResponse.json(
      { error: error.message || 'AI search failed' },
      { status: 500 }
    );
  }
}
