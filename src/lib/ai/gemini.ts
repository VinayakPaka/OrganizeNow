/**
 * Google AI (Gemini) Integration
 * Provides AI-powered text operations and intelligent search
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GOOGLE_AI_API_KEY || '';

if (!API_KEY && typeof window === 'undefined') {
  console.warn('[Gemini] API key not configured. Add GOOGLE_AI_API_KEY to .env.local');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export type AIOperation =
  | 'rephrase'
  | 'grammar'
  | 'summarize'
  | 'expand'
  | 'simplify'
  | 'translate';

export interface AITextRequest {
  operation: AIOperation;
  text: string;
  language?: string; // For translation
}

export interface AISearchRequest {
  query: string;
  context: {
    tasks?: any[];
    notes?: any[];
    boards?: any[];
    passwords?: any[];
  };
}

/**
 * Process text using Gemini AI
 */
export async function processText(request: AITextRequest): Promise<string> {
  if (!genAI) {
    throw new Error('Google AI not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompts: Record<AIOperation, string> = {
    rephrase: `Rephrase the following text while keeping the same meaning. Return ONLY the rephrased text without any explanations:\n\n${request.text}`,
    grammar: `Fix grammar and spelling errors in the following text. Return ONLY the corrected text without any explanations:\n\n${request.text}`,
    summarize: `Summarize the following text in a concise way. Return ONLY the summary without any explanations:\n\n${request.text}`,
    expand: `Expand the following text with more details and context. Return ONLY the expanded text without any explanations:\n\n${request.text}`,
    simplify: `Simplify the following text to make it easier to understand. Return ONLY the simplified text without any explanations:\n\n${request.text}`,
    translate: `Translate the following text to ${request.language || 'English'}. Return ONLY the translation without any explanations:\n\n${request.text}`,
  };

  const prompt = prompts[request.operation];

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error: any) {
    console.error('[Gemini] Text processing error:', error);
    throw new Error(`AI processing failed: ${error.message}`);
  }
}

/**
 * Intelligent search across app data using Gemini AI
 */
export async function intelligentSearch(request: AISearchRequest): Promise<{
  answer: string;
  relevantItems: {
    type: 'task' | 'note' | 'board' | 'password';
    id: string;
    title: string;
    relevance: number;
  }[];
}> {
  if (!genAI) {
    throw new Error('Google AI not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Build context from user data
  const contextParts: string[] = [];

  if (request.context.tasks && request.context.tasks.length > 0) {
    contextParts.push('TASKS:');
    request.context.tasks.forEach((task, idx) => {
      const dueInfo = task.due_date
        ? `Due: ${task.due_date}${task.due_time ? ` at ${task.due_time}` : ''}`
        : 'No due date';
      const status = task.completed ? 'Completed' : 'Not completed';
      contextParts.push(`${idx + 1}. "${task.title}" (Priority: ${task.priority ?? 'None'}, ${dueInfo}, Status: ${status}${task.category ? `, Category: ${task.category}` : ''})`);
      if (task.description) {
        contextParts.push(`   Description: ${task.description}`);
      }
    });
  }

  if (request.context.notes && request.context.notes.length > 0) {
    contextParts.push('\nNOTES:');
    request.context.notes.forEach((note, idx) => {
      contextParts.push(`${idx + 1}. "${note.title}"`);
      if (note.content) {
        const plainText = typeof note.content === 'string'
          ? note.content
          : JSON.stringify(note.content).slice(0, 200);
        contextParts.push(`   Content: ${plainText}...`);
      }
    });
  }

  if (request.context.boards && request.context.boards.length > 0) {
    contextParts.push('\nWHITEBOARDS/BOARDS:');
    request.context.boards.forEach((board, idx) => {
      contextParts.push(`${idx + 1}. "${board.title}"`);
      if (board.description) {
        contextParts.push(`   Description: ${board.description}`);
      }
    });
  }

  if (request.context.passwords && request.context.passwords.length > 0) {
    contextParts.push('\nPASSWORD VAULT ITEMS:');
    request.context.passwords.forEach((pwd, idx) => {
      contextParts.push(`${idx + 1}. "${pwd.service_name || pwd.username}" (URL: ${pwd.url || 'N/A'})`);
      if (pwd.notes) {
        contextParts.push(`   Notes: ${pwd.notes.slice(0, 100)}...`);
      }
    });
  }

  const contextText = contextParts.join('\n');

  const prompt = `You are an intelligent assistant helping a user search through their personal productivity data.

AVAILABLE USER DATA:
${contextText}

USER QUESTION: ${request.query}

CRITICAL INSTRUCTIONS:
1. ONLY use data from the "AVAILABLE USER DATA" section above. DO NOT make up or hallucinate any information.
2. If the user asks about tasks, notes, boards, or passwords that are NOT in the data above, say you couldn't find any matching items.
3. When mentioning specific items, quote their exact titles and details from the data above.
4. For date-related queries (e.g., "today", "this week"), compare against the actual due_date values in the task data.
5. Today's date is: ${new Date().toISOString().split('T')[0]}

RESPONSE FORMAT:
Return ONLY valid JSON (no markdown, no code blocks, no explanations):
{
  "answer": "Your answer based ONLY on the actual data above. Be specific with item titles and details.",
  "relevantItems": [
    {
      "type": "task" | "note" | "board" | "password",
      "index": number (1-based index from the lists above),
      "relevance": number (0-100 relevance score)
    }
  ]
}

If no relevant data exists, respond with:
{
  "answer": "I couldn't find any [tasks/notes/boards/passwords] matching your query in your data.",
  "relevantItems": []
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonText = response.text().trim();

    // Clean up markdown code blocks if present
    // Remove ```json and ``` wrappers
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
    }

    // Parse AI response
    const parsed = JSON.parse(jsonText);

    // Validate response structure
    if (!parsed || typeof parsed.answer !== 'string' || !Array.isArray(parsed.relevantItems)) {
      throw new Error('Invalid AI response structure');
    }

    // Map indexes back to actual items
    const relevantItems = parsed.relevantItems.map((item: any) => {
      let actualItem;
      let title = '';

      // Validate index
      const index = item.index - 1;

      if (item.type === 'task' && request.context.tasks) {
        if (index >= 0 && index < request.context.tasks.length) {
          actualItem = request.context.tasks[index];
          title = actualItem?.title || '';
        }
      } else if (item.type === 'note' && request.context.notes) {
        if (index >= 0 && index < request.context.notes.length) {
          actualItem = request.context.notes[index];
          title = actualItem?.title || '';
        }
      } else if (item.type === 'board' && request.context.boards) {
        if (index >= 0 && index < request.context.boards.length) {
          actualItem = request.context.boards[index];
          title = actualItem?.title || '';
        }
      } else if (item.type === 'password' && request.context.passwords) {
        if (index >= 0 && index < request.context.passwords.length) {
          actualItem = request.context.passwords[index];
          title = actualItem?.service_name || actualItem?.username || '';
        }
      }

      return {
        type: item.type,
        id: actualItem?.id || '',
        title,
        relevance: item.relevance || 50,
      };
    }).filter((item: any) => item.id); // Filter out invalid items

    return {
      answer: parsed.answer,
      relevantItems,
    };
  } catch (error: any) {
    console.error('[Gemini] Search error:', error);
    throw new Error(`AI search failed: ${error.message}`);
  }
}
