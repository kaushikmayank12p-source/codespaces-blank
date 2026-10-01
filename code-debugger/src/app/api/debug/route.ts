import { NextResponse } from 'next/server';
import OpenAI from 'openai';

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const SUPPORTED_LANGUAGES = new Set(['java', 'python', 'javascript', 'typescript', 'c', 'cpp']);
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

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

  if (language !== 'java') {
    return {
      fixedCode: code,
      diagnosis: 'The local fallback only applies targeted fixes to Java. Configure OPENROUTER_API_KEY to enable analysis for this language.',
    };
  }

  if (fixedCode.includes('String operator = null;') && fixedCode.includes('Scanner scanner')) {
    fixedCode = fixedCode.replace(
      'String operator = null;',
      'String operator = scanner.next();'
    );
    issues.push('**NullPointerException**: Initialized `operator` with `scanner.next()` to actually read user input.');
  }

  const beforeStringEqualityFix = fixedCode;
  fixedCode = fixedCode.replace(/operator\s*==\s*"([^"]+)"/g, 'operator.equals("$1")');
  if (fixedCode !== beforeStringEqualityFix) {
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

  const divisionByZeroPattern = /result\s*=\s*([a-zA-Z0-9_]+)\s*\/\s*0\s*;/g;
  if (divisionByZeroPattern.test(fixedCode)) {
    if (/\bnum2\b/.test(fixedCode)) {
      fixedCode = fixedCode.replace(
        divisionByZeroPattern,
        'result = (num2 != 0) ? ($1 / num2) : 0;'
      );
      issues.push('**ArithmeticException**: Replaced hardcoded division by zero with a `num2` divisor check.');
    } else {
      issues.push('**ArithmeticException**: Detected division by zero; choose a valid non-zero divisor for this code.');
    }
  }

  const diagnosis =
    issues.length > 0
      ? `### Local Java Analysis\n\n${issues.map((issue) => `• ${issue}`).join('\n')}`
      : 'The local Java fallback found no issues in the patterns it recognizes. This limited check does not confirm the code is bug-free.';

  return { fixedCode, diagnosis };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('Request body must contain valid JSON.');
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return badRequest('Request body must be a JSON object.');
  }

  const payload = body as Record<string, unknown>;
  if (payload.code !== undefined && typeof payload.code !== 'string') {
    return badRequest('The code field must be a string.');
  }
  if (payload.instruction !== undefined && typeof payload.instruction !== 'string') {
    return badRequest('The instruction field must be a string.');
  }
  if (payload.language !== undefined && typeof payload.language !== 'string') {
    return badRequest('The language field must be a string.');
  }
  if (payload.conversation !== undefined && !Array.isArray(payload.conversation)) {
    return badRequest('The conversation field must be an array.');
  }

  const code = typeof payload.code === 'string' ? payload.code : '';
  const language = typeof payload.language === 'string' ? payload.language.toLowerCase() : 'java';
  const instruction = typeof payload.instruction === 'string' ? payload.instruction.trim() : '';
  if (!SUPPORTED_LANGUAGES.has(language)) {
    return badRequest('The selected language is not supported.');
  }

  const conversation: ConversationMessage[] = Array.isArray(payload.conversation)
    ? payload.conversation
        .filter((message): message is ConversationMessage => {
          if (!message || typeof message !== 'object' || Array.isArray(message)) return false;
          const candidate = message as Record<string, unknown>;
          return (candidate.role === 'user' || candidate.role === 'assistant') && typeof candidate.content === 'string';
        })
        .slice(-8)
    : [];

  if (!instruction) {
    return NextResponse.json({
      fixedCode: code,
      diagnosis: 'Ask a question, describe a feature to build, or request a review of the code in the editor.',
    });
  }

  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(analyzeCodeLocally(code, language, instruction));
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
      const parsed: unknown = JSON.parse(content);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const result = parsed as Record<string, unknown>;
        return NextResponse.json({
          fixedCode: typeof result.fixedCode === 'string' ? result.fixedCode : code,
          diagnosis: typeof result.diagnosis === 'string' ? result.diagnosis : 'Analysis completed successfully.',
        });
      }
    }
  } catch (apiError) {
    console.warn('Upstream model unavailable or timed out, executing local developer engine:', apiError);
  }

  const fallback = analyzeCodeLocally(code, language, instruction);
  return NextResponse.json(fallback);
}
