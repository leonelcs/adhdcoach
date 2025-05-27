import { NextRequest, NextResponse } from 'next/server';
import { getGeminiResponse, getGeminiResponseWithHistory } from '@/services/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, messages } = body;
    
    let response;
    
    // If messages history is provided, use the chat endpoint
    if (messages && Array.isArray(messages) && messages.length > 0) {
      response = await getGeminiResponseWithHistory(messages);
    } else if (prompt) {
      // Otherwise, use the completion endpoint with just the prompt
      response = await getGeminiResponse(prompt);
    } else {
      return NextResponse.json(
        { error: "Missing required parameters: 'prompt' or 'messages'" },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in agent API route:', error);
    return NextResponse.json(
      { error: `Failed to process request: ${error.message}` },
      { status: 500 }
    );
  }
}
