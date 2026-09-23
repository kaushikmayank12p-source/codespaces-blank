import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { code, language, instruction } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a supportive, sharp Principal Software Engineer and developer companion inside DebugCraft Studio.
You have two operational modes based on user intent:

1. CONVERSATIONAL / CHAT MODE (e.g., greetings like "hi", "hello", "hey", questions about how you work, jokes, or general coding questions):
- Respond in a warm, authentic, natural human developer voice.
- Keep "fixedCode" identical to the provided input code.
- In "diagnosis", write your conversational reply directly (no bullet points required).

2. CODE DEBUG / ANALYSIS MODE (e.g., "debug this", code review, or finding bugs):
- Analyze the code thoroughly for logic bugs, runtime panics, boundary issues, and syntax errors.
- Return the fully cleaned, repaired code in "fixedCode".
- In "diagnosis", explain the bugs found and how they were resolved with clear, concise bullet points.

CRITICAL: Return ONLY a valid JSON object matching this schema without markdown fences:
{
  "fixedCode": "the resulting code string",
  "diagnosis": "your natural response or diagnosis text"
}`;

    const userPrompt = `Language preset: ${language || 'plaintext'}
User message / Instruction: ${instruction || 'Analyze this code.'}

Current Editor Code:
${code || ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsedData = JSON.parse(response.text || '{}');

    return NextResponse.json({
      fixedCode: parsedData.fixedCode ?? code ?? '',
      diagnosis: parsedData.diagnosis || 'I am here and ready to help you write and debug code.',
    });
  } catch (error: any) {
    console.error('AI Route Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process request.' },
      { status: 500 }
    );
  }
}
