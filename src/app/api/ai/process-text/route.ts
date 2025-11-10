/**
 * AI Text Processing API
 * Handles text operations: rephrase, grammar, summarize, expand, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { processText, AITextRequest } from '@/lib/ai/gemini';
import { authenticateRequest } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: AITextRequest = await request.json();

    // Validate request
    if (!body.operation || !body.text) {
      return NextResponse.json(
        { error: 'Missing operation or text' },
        { status: 400 }
      );
    }

    if (body.text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    // Process text with AI
    const result = await processText(body);

    return NextResponse.json({
      success: true,
      result,
      operation: body.operation,
    });
  } catch (error: any) {
    console.error('[AI Text Processing] Error:', error);
    return NextResponse.json(
      { error: 'AI processing failed' },
      { status: 500 }
    );
  }
}
