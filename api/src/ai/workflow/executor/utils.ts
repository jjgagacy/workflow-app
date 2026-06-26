import { CodeLanguage } from "../types/code-language.enum";
import { CodeProviderSignature } from "./code.provider";
import { JavascriptCodeProvider } from "./providers/javascript-code.provider";
import { PythonCodeProvider } from "./providers/python-code.provider";

export const CODE_PROVIDERS_CLASS_MAPPINGS: Record<string, CodeProviderSignature> = {
  [CodeLanguage.Python]: PythonCodeProvider,
  [CodeLanguage.JavaScript]: JavascriptCodeProvider,
};

export const createId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${prefix}:${timestamp}:${randomPart}`;
}

export const getCodeProviderClass = (language: string): any => {
  return CODE_PROVIDERS_CLASS_MAPPINGS[language] || null;
}
