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

  if (!instruction) {
    return NextResponse.json({ error: 'Missing instruction' }, { status: 400 });
  }

  try {
    // Build prompt based on whether code exists
    const codeExists = code && code.trim().length > 0;
    let promptText: string;
    
    if (codeExists) {
      promptText = `You are a helpful AI code editor for Solidity smart contracts. Here is the current code:\n\n${code}\n\nInstruction: ${instruction}\n\nREPLY WITH ONLY THE FULL, UPDATED CODE WRAPPED IN TRIPLE BACKTICKS WITH "solidity" LANGUAGE TAG (\`\`\`solidity\n...\n\`\`\`) AND NOTHING ELSE. DO NOT DESCRIBE CHANGES, DO NOT ADD EXPLANATIONS, DO NOT ADD ANY TEXT OUTSIDE THE CODE BLOCK.`;
    } else {
      promptText = `You are a helpful AI code editor for Solidity smart contracts. The user wants you to create a new Solidity smart contract.\n\nInstruction: ${instruction}\n\nREPLY WITH ONLY THE COMPLETE SOLIDITY CONTRACT CODE WRAPPED IN TRIPLE BACKTICKS WITH "solidity" LANGUAGE TAG (\`\`\`solidity\n...\n\`\`\`) AND NOTHING ELSE. DO NOT DESCRIBE THE CONTRACT, DO NOT ADD EXPLANATIONS, DO NOT ADD ANY TEXT OUTSIDE THE CODE BLOCK.`;
    }

    // Make the prompt very explicit for Gemini
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: promptText }] }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096
        }
      }),
    });

    // Check if the HTTP response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
      return NextResponse.json({ 
        error: `Gemini API error: ${errorData.error?.message || errorData.error || 'Unknown error'}`,
        debug: errorData 
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Check for API errors in the response
    if (data.error) {
      return NextResponse.json({ 
        error: `Gemini API error: ${data.error.message || data.error}`,
        debug: data 
      }, { status: 500 });
    }

    const candidate = data?.candidates?.[0];
    
    if (!candidate) {
      return NextResponse.json({ 
        error: 'No candidate response from AI. The API may have blocked the request or returned an unexpected format.',
        debug: data 
      }, { status: 500 });
    }

    const finishReason = candidate?.finishReason;
    
    // Check for safety or other blocking reasons
    if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
      return NextResponse.json({ 
        error: `AI response was blocked. Reason: ${finishReason}`,
        debug: data 
      }, { status: 500 });
    }

    if (finishReason === 'MAX_TOKENS') {
      return NextResponse.json({ 
        error: 'AI output hit the token limit and was cut off. Try using shorter code or a simpler instruction.', 
        debug: data 
      }, { status: 500 });
    }

    const aiText = candidate?.content?.parts?.[0]?.text;

    if (!aiText || aiText.trim().length === 0) {
      // Debug: Return the full response for diagnosis
      return NextResponse.json({ 
        error: 'AI did not return any code. The response may be empty or in an unexpected format.',
        debug: data 
      }, { status: 500 });
    }

    let aiContent = extractCodeBlock(aiText);
    
    // If no code block found, try to use the text as-is (maybe it's just code without backticks)
    if (!aiContent || aiContent.length === 0) {
      // Check if the text itself looks like Solidity code
      const trimmedText = aiText.trim();
      if (trimmedText.includes('pragma') || trimmedText.includes('contract') || trimmedText.includes('function')) {
        aiContent = trimmedText;
      } else {
        return NextResponse.json({ 
          error: 'AI response did not contain a valid Solidity code block. The response may not be code.',
          debug: { responseText: aiText, fullData: data }
        }, { status: 500 });
      }
    }

    return NextResponse.json({ code: aiContent });
  } catch (error) {
    return NextResponse.json({ 
      error: `Failed to process AI request: ${(error as Error).message}`,
      debug: { error: (error as Error).stack }
    }, { status: 500 });
  }
}

// To use this endpoint, put 'GEMINI_API_KEY=your_key' in your '.env.local' file at your project root.
