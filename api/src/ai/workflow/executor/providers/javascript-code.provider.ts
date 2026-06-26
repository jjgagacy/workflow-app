import { CodeProvider } from "../code.provider";
import dedent from 'dedent';

export class JavascriptCodeProvider extends CodeProvider {
  static getLanguage(): string {
    return 'javascript';
  }

  static getDefaultCode(): string {
    return dedent(`
      function main(arg1, arg2) {
          // Your code here
          const result = arg1 + arg2;
          return result;
      }
    `);
  }
}
