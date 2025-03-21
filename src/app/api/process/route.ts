import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Add token estimation constant (roughly 4 characters per token)
const CHARS_PER_TOKEN = 4;
const MAX_TOKENS = 4000; // Set a safe limit below GPT-3.5's max context

export async function POST(req: Request) {
  try {
    // Validate API Key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API Key');
    }

    // Parse and validate request body
    const { content } = await req.json();
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid content provided' },
        { status: 400 }
      );
    }

    // Add token estimation check
    const estimatedTokens = Math.ceil(content.length / CHARS_PER_TOKEN);
    if (estimatedTokens > MAX_TOKENS) {
      return NextResponse.json(
        { 
          success: false,
          error: `Content is too long. Maximum length is ${MAX_TOKENS * CHARS_PER_TOKEN} characters (approximately ${MAX_TOKENS} tokens). Your content is approximately ${estimatedTokens} tokens.`
        },
        { status: 413 } // Request Entity Too Large
      );
    }
    
    console.log('Processing content...');

    // Send request to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert on creating educational content. Convert the provided notes into key points that will be used for memorization and typing practice. Focus on the terms that have definitions. Each term should be one short sentence. Each exercise serves the purpose of a flashcard, so there is a front and back and the sentence structure is simple. The term title (front) comes before the text (back), and is in the format of Front: Back. Each flashcard should be on a newline',
        },
        {
          role: 'user',
          content: content,
        },
      ],
      max_tokens: 4000,
    });

    // Check for expected response structure
    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    // Return the processed content
    return NextResponse.json({
      success: true,
      responseText: response.choices[0].message.content,
      quizId: 'demo-' + Date.now()
    });

  } catch (error: any) {
    console.error('Error in /api/process:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to process content'
      },
      { status: error.status || 500 }
    );
  }
}

// // app/api/process/route.ts
// import { NextResponse } from 'next/server';

// const PYTHON_API_URL = 'http://localhost:3000/process';

// export async function POST(req: Request) {
//   try {
//     // Validate request body
//     const { content } = await req.json();
//     if (!content || typeof content !== 'string') {
//       return NextResponse.json(
//         { error: 'Invalid content provided' },
//         { status: 400 }
//       );
//     }

//     // Forward the request to Python backend
//     const response = await fetch(PYTHON_API_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ content }),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.error || 'Failed to process content');
//     }

//     const data = await response.json();
//     return NextResponse.json(data);

//   } catch (error: any) {
//     console.error('Error in /api/process:', error);
//     return NextResponse.json(
//       { 
//         success: false,
//         error: error.message || 'Failed to process content'
//       },
//       { status: error.status || 500 }
//     );
//   }
// }