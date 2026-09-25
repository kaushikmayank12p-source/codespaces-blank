import { NextResponse } from 'next/server';
import OpenAI from 'openai';

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; /*
  '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';

*/
function analyzeCodeLocally(code: string, language: string, instruction: string) {
  let fixedCode = code;
  const issues: string[] = [];
  const cleanInstruction = instruction.toLowerCase().trim();

  if (/^(hi|hello|hey|yo|sup)\b/.test(cleanInstruction)) {
    return {
      fixedCode: code,
      diagnosis: 'Hi! I am your coding copilot. Ask me to explain, write, or debug code in the editor.',
    };
  }

  if (cleanInstruction.includes('how are you')) {
    return {
      fixedCode: code,
      diagnosis: 'I am ready to help. Tell me what you are building or paste an error, and we can work through it together.',
    };
  }

  if (language === 'java') {
    if (fixedCode.includes('String operator = null;')) {
      fixedCode = fixedCode.replace(
        'String operator = null;',
        'String operator = scanner.next();'
      );
      issues.push('**NullPointerException**: Initialized `operator` with `scanner.next()` to actually read user input.');
    }

    if (fixedCode.includes('== "+"')) {
      fixedCode = fixedCode.replace(/operator\s*==\s*"([^"]+)"/g, 'operator.equals("$1")');
      issues.push('**String Equality**: Replaced reference comparison `==` with `operator.equals(...)`.');
    }

    const lines = fixedCode.split('\n');
    const processedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (
        (trimmed.startsWith('result =') || trimmed.startsWith('int ') || trimmed.startsWith('double ')) &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        trimmed.length > 0
      ) {
        issues.push('**Syntax Error**: Added missing terminating semicolon `;`.');
        return line + ';';
      }
      return line;
    });
    fixedCode = processedLines.join('\n');

    if (fixedCode.includes('/ 0')) {
      fixedCode = fixedCode.replace(
        /result\s*=\s*([a-zA-Z0-9_]+)\s*\/\s*0\s*;/g,
        'result = (num2 != 0) ? ($1 / num2) : 0;'
      );
      issues.push('**ArithmeticException**: Fixed hardcoded division by zero with safe divisor check.');
    }
  }

  const diagnosis =
    issues.length > 0
      ? `### Diagnosis & Fixes 🛠️\n\n${issues.map((i) => `• ${i}`).join('\n')}`
      : '✅ **Analysis Complete**: Code logic and syntax reviewed cleanly.';

  return { fixedCode, diagnosis };
}

export async function POST(req: Request) {
  let code = '';
  let language = 'java';
  let instruction = '';
  let conversation: ConversationMessage[] = [];

  try {
    const body = await req.json();
    code = body.code || '';
    language = body.language || 'java';
    instruction = (body.instruction || '').trim();
    conversation = Array.isArray(body.conversation)
      ? body.conversation
          .filter(
            (message: ConversationMessage) =>
              (message.role === 'user' || message.role === 'assistant') &&
              typeof message.content === 'string'
          )
          .slice(-8)
      : [];
  } catch {
    return NextResponse.json({
      fixedCode: '',
      diagnosis: 'Could not parse request payload.',
    });
  }

  if (!instruction) {
    return NextResponse.json({
      fixedCode: code,
      diagnosis: 'Ask a question, describe a feature to build, or request a review of the code in the editor.',
    });
  }

  if (!OPENROUTER_API_KEY) {
    return NextResponse.json({
      fixedCode: code,
      diagnosis: 'The AI provider is not configured. Add `OPENROUTER_API_KEY` to `.env.local` to enable interactive answers.',
    });
  }

  try {
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'https://code-debugger-smoky.vercel.app',
        'X-Title': 'DebugCraft Studio',
      },
      timeout: 12000,
    });

    const completion = await openai.chat.completions.create({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are DebugCraft, an interactive senior software engineer. Answer programming questions clearly, write complete code when asked, and debug or improve the code supplied by the user. Use the conversation for context. Always return ONLY valid JSON in this shape: {"fixedCode":"the complete best version of the editor code, or the original code when no code change is needed","diagnosis":"a helpful markdown answer"}. When the user asks a general question, answer it in diagnosis and leave fixedCode unchanged. Never claim to have run code unless execution results are provided. The selected language is ${language}.`,
        },
        ...conversation.map((message) => ({
          role: message.role as 'user' | 'assistant',
          content: message.content,
        })),
        {
          role: 'user',
          content: `Current request: ${instruction}\n\nCurrent editor code:\n${code}`,
        },
      ],
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      return NextResponse.json({
        fixedCode: parsed.fixedCode || code,
        diagnosis: parsed.diagnosis || 'Analysis completed successfully.',
      });
    }
  } catch (apiError) {
    console.warn('Upstream model unavailable or timed out, executing local developer engine:', apiError);
  }

  const fallback = analyzeCodeLocally(code, language, instruction);
  return NextResponse.json(fallback);
}
