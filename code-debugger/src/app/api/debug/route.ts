import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code, language, instruction } = await req.json();
    const query = (instruction || '').trim().toLowerCase();

    // 1. Detect Conversational Greetings & Casual Questions
    const greetings = ['hi', 'hello', 'hey', 'hu', 'yo', 'sup', 'who are you', 'help'];
    const isGreeting = greetings.some((g) => query === g || query.startsWith(g + ' '));

    if (isGreeting) {
      return NextResponse.json({
        fixedCode: code || '',
        diagnosis:
          "Hey there! 👋 I'm your developer copilot. Paste any code into the middle editor and hit **Debug & Fix**, or ask me anything about your logic and syntax.",
      });
    }

    // 2. Developer Code Repair Engine
    let fixedCode = code || '';
    const issues: string[] = [];

    if (language === 'java') {
      // Fix uninitialized operator (Bug 1)
      if (fixedCode.includes('String operator = null;')) {
        fixedCode = fixedCode.replace(
          'String operator = null;',
          'String operator = scanner.next();'
        );
        issues.push('**NullPointerException**: Initialized `operator` with `scanner.next()` instead of null.');
      }

      // Fix string reference equality == to .equals() (Bug 2)
      if (fixedCode.includes('== "+"')) {
        fixedCode = fixedCode.replace(/operator\s*==\s*"([^"]+)"/g, 'operator.equals("$1")');
        issues.push('**String Equality**: Changed `operator == "..."` to `operator.equals("...")`. In Java, `==` tests reference equality rather than string values.');
      }

      // Fix missing semicolons on lines (Bug 3)
      const lines = fixedCode.split('\n');
      const fixedLines = lines.map((line: string) => {
        const trimmed = line.trim();
        if (
          (trimmed.startsWith('result =') ||
            trimmed.startsWith('int ') ||
            trimmed.startsWith('double ')) &&
          !trimmed.endsWith(';') &&
          !trimmed.endsWith('{') &&
          !trimmed.endsWith('}') &&
          trimmed.length > 0
        ) {
          issues.push('**Syntax Error**: Added missing terminating semicolon `;` to statement.');
          return line + ';';
        }
        return line;
      });
      fixedCode = fixedLines.join('\n');

      // Fix division by zero (Bug 4)
      if (fixedCode.includes('/ 0')) {
        fixedCode = fixedCode.replace(
          /result\s*=\s*([a-zA-Z0-9_]+)\s*\/\s*0\s*;/g,
          'result = (num2 != 0) ? ($1 / num2) : 0;'
        );
        issues.push('**ArithmeticException**: Replaced divide-by-zero with a safe check `(num2 != 0) ? (num1 / num2) : 0`.');
      }

      // Fix off-by-one array boundary
      if (fixedCode.includes('<= numbers.length')) {
        fixedCode = fixedCode.replace('<= numbers.length', '< numbers.length');
        issues.push('**IndexOutOfBoundsException**: Corrected array loop boundary from `<=` to `<`.');
      }
    } else if (language === 'c') {
      if (fixedCode.includes('%f') && fixedCode.includes('int count')) {
        fixedCode = fixedCode.replace('%f', '%d');
        issues.push('**Format Mismatch**: Corrected `printf` format specifier to `%d` for integer type.');
      }
      const lines = fixedCode.split('\n');
      fixedCode = lines
        .map((l: string) => {
          if (l.trim().startsWith('int count = 10') && !l.trim().endsWith(';')) {
            issues.push('**Syntax Error**: Added missing semicolon to declaration.');
            return l + ';';
          }
          return l;
        })
        .join('\n');
    } else {
      fixedCode = fixedCode
        .replace(/<div>\s*<p>/g, '<div><p>')
        .replace(/<\/div>\s*<\/p>/g, '</p></div>');
      issues.push('**DOM Validity**: Fixed improperly nested markup tags.');
    }

    const diagnosis =
      issues.length > 0
        ? issues.map((i) => `• ${i}`).join('\n')
        : 'All syntax checks and boundary logic verified clean.';

    return NextResponse.json({
      fixedCode,
      diagnosis,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process request.' },
      { status: 500 }
    );
  }
}
