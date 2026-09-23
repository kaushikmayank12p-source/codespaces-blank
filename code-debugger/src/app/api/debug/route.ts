import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Server-side key definition
const OPENROUTER_API_KEY: string =
  process.env.OPENROUTER_API_KEY ||
  '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';

interface DebugRequestBody {
  code?: string;
  language?: string;
  instruction?: string;
}

interface DebugResponseBody {
  fixedCode: string;
  diagnosis: string;
}

export async function POST(req: Request) {
  try {
    const body: DebugRequestBody = await req.json();
    const { code = '', language = 'java', instruction = '' } = body;
    const cleanInstruction = instruction.trim().toLowerCase();

    // 1. Instant fallback for common conversational greetings
    const greetings = ['hi', 'hello', 'hey', 'hu', 'yo', 'sup', 'who are you', 'help'];
    if (greetings.some((g) => cleanInstruction === g || cleanInstruction.startsWith(g + ' '))) {
      return NextResponse.json<DebugResponseBody>({
        fixedCode: code,
        diagnosis:
          "Hey! 👋 I'm your developer copilot. Paste any code in the editor, ask me questions about syntax, or click **Debug & Fix** to resolve issues.",
      });
    }

    // 2. Initialize the OpenRouter client
    const client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'https://code-debugger-smoky.vercel.app',
        'X-Title': 'DebugCraft Studio',
      },
    });

    const systemPrompt = `You are a Principal Software Engineer and developer copilot.
Analyze code and developer instructions accurately.

MODES:
1. CASUAL / GREETING MODE:
   - Leave "fixedCode" identical to the provided input code.
   - Reply warmly and directly in "diagnosis".

2. DEBUG / CODE FIX MODE:
   - Analyze the code for logic bugs, runtime exceptions, syntax errors, and edge cases.
   - Provide the complete, clean, repaired code in "fixedCode".
   - In "diagnosis", detail every fix in concise bullet points.

CRITICAL: Return strictly a valid JSON object matching this schema with no markdown wrapping:
{
  "fixedCode": "the complete cleaned code string",
  "diagnosis": "conversational reply or bug diagnosis"
}`;

    const userPrompt = `Language: ${language}
Instruction: ${instruction || 'Debug and repair all issues in this code.'}

Code:
${code}`;

    const completion = await client.chat.completions.create({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const parsedData: DebugResponseBody = JSON.parse(content);

    return NextResponse.json<DebugResponseBody>({
      fixedCode: parsedData.fixedCode ?? code,
      diagnosis: parsedData.diagnosis ?? 'Code review complete.',
    });
  } catch (error: any) {
    console.error('Debug API Route Error:', error);

    // Fallback if the free external route is unavailable or throttled
    return NextResponse.json<DebugResponseBody>({
      fixedCode: (await req.clone().json()).code || '',
      diagnosis: `Engine Notice: ${error?.message || 'Connection error. Please try again.'}`,
    });
  }
}
