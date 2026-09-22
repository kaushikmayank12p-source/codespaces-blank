export const SUPPORTED_LANGUAGES = [
  { label: 'C', value: 'c' },
  { label: 'Java', value: 'java' },
  { label: 'HTML', value: 'html' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['value'];

export const STARTER_CODE: Record<SupportedLanguage, string> = {
  c: `#include <stdio.h>

int main() {
    int count = 10
    printf("Count is: %f", count);
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        String message = null;
        System.out.println(message.length())
    }
}`,
  html: `<!DOCTYPE html>
<html>
  <head>
    <title>Buggy Page</title>
  <body>
    <div>
      <p>Hello World</div>
    </p>
  </body>
</html>`,
  javascript: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    total += items[i].price;
  }
  return totl;
}`,
  python: `def divide_numbers(a, b):
    return a / b
`,
};

