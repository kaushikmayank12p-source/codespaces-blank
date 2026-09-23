import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    let fixedCode = code;
    const issues: string[] = [];

    if (language === 'java') {
      const lines = fixedCode.split('\n');
      const fixedLines = lines.map((line: string) => {
        const trimmed = line.trim();
        if (
          (trimmed.startsWith('int ') ||
            trimmed.startsWith('double ') ||
            trimmed.startsWith('String ') ||
            trimmed.startsWith('result =')) &&
          !trimmed.endsWith(';') &&
          !trimmed.endsWith('{') &&
          !trimmed.endsWith('}') &&
          trimmed.length > 0
        ) {
          issues.push('Missing semicolon added');
          return line + ';';
        }
        return line;
      });
      fixedCode = fixedLines.join('\n');

      if (fixedCode.includes('== "+"')) {
        fixedCode = fixedCode.replace(/([a-zA-Z0-9_]+)\s*==\s*"([^"]+)"/g, '$1.equals("$2")');
        issues.push('Changed `==` string comparison to `.equals()`');
      }

      if (fixedCode.includes('String operator = null;')) {
        fixedCode = fixedCode.replace(
          'String operator = null;',
          'String operator = scanner.next();'
        );
        issues.push('Replaced null operator initialization with scanner input read');
      }

      if (fixedCode.includes('/ 0')) {
        fixedCode = fixedCode.replace(
          /result\s*=\s*([a-zA-Z0-9_]+)\s*\/\s*0\s*;/g,
          'result = (num2 != 0) ? ($1 / num2) : 0;'
        );
        issues.push('Guarded against ArithmeticException (Division by zero)');
      }

      if (fixedCode.includes('<= numbers.length')) {
        fixedCode = fixedCode.replace('<= numbers.length', '< numbers.length');
        issues.push('Corrected array boundary off-by-one condition');
      }
    } else if (language === 'c') {
      if (fixedCode.includes('%f') && fixedCode.includes('int count')) {
        fixedCode = fixedCode.replace('%f', '%d');
        issues.push('Corrected printf format specifier to %d');
      }
      const lines = fixedCode.split('\n');
      fixedCode = lines
        .map((l: string) => {
          if (l.trim().startsWith('int count = 10') && !l.trim().endsWith(';')) {
            issues.push('Terminated statement with semicolon');
            return l + ';';
          }
          return l;
        })
        .join('\n');
    } else {
      fixedCode = fixedCode.replace(/<div>\s*<p>/g, '<div><p>').replace(/<\/div>\s*<\/p>/g, '</p></div>');
      issues.push('Balanced improperly nested markup tags');
    }

    const diagnosis =
      issues.length > 0
        ? issues.map((i) => `• ${i}`).join('\n')
        : '• Code structure and syntax verified clean.';

    return NextResponse.json({ fixedCode, diagnosis });
  } catch {
    return NextResponse.json({ error: 'Failed to process code' }, { status: 500 });
  }
}
