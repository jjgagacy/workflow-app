import { CodeProvider } from "../code.provider";
import dedent from 'dedent';

export class PythonCodeProvider extends CodeProvider {
  static getLanguage(): string {
    return 'python';
  }

  static getDefaultCode(): string {
    return dedent(`
      def main(arg1, arg2):
          # Your code here
          result = arg1 + arg2
          return result
    `);
  }
}
