import { NextRequest, NextResponse } from 'next/server';

function extractCodeBlock(text: string): string {
  // Extract code from ```solidity ... ``` or plain ``` ... ``` block
  const match = text.match(/```solidity([\s\S]*?)```/i) || text.match(/```([\s\S]*?)```/i);
  if (match) return match[1].trim();
  return text.trim();
}

export async function POST(req: NextRequest) {
  const { code, instruction } = await req.json();

  // Read API key from env
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not set. Set GEMINI_API_KEY in your .env.local.' }, { status: 500 });
  }

  if (!code || !instruction) {
    return NextResponse.json({ error: 'Missing code or instruction' }, { status: 400 });
  }

  try {
    // Make the prompt very explicit for Gemini
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          { parts: [
              { text: `You are a helpful AI code editor. Here is some code:\n${code}\n\nInstruction: ${instruction}\n\nREPLY WITH ONLY THE FULL, UPDATED CODE WRAPPED IN TRIPLE BACKTICKS (solidity) AND NOTHING ELSE. DO NOT DESCRIBE CHANGES, DO NOT ADD EXPLANATIONS.` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048
        }
      }),
    });

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const aiText = candidate?.content?.parts?.[0]?.text;
    const finishReason = candidate?.finishReason;

    if (finishReason === 'MAX_TOKENS') {
      return NextResponse.json({ 
        error: 'AI output hit the token limit and was cut off. Try using shorter code or a simpler instruction.', 
        debug: data 
      }, { status: 500 });
    }

    if (!aiText || aiText.trim().length === 0) {
      // Debug: Return the full response for diagnosis
      return NextResponse.json({ error: 'AI did not return any code.', debug: data }, { status: 500 });
    }

    let aiContent = extractCodeBlock(aiText);
    if (!aiContent || aiContent.length === 0) {
      return NextResponse.json({ error: 'AI response did not contain code block or any code.', debug: data }, { status: 500 });
    }

    return NextResponse.json({ code: aiContent });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// To use this endpoint, put 'GEMINI_API_KEY=your_key' in your '.env.local' file at your project root.
