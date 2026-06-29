import { CodeLanguage } from "../../types";

export const codeLanguageDefault = 'JavaScript';

export const codeLanguages = {
  [CodeLanguage.python]: 'Python',
  [CodeLanguage.javascript]: 'JavaScript',
}

export const codeLanguageOptions = [
  { value: CodeLanguage.javascript, name: 'JavaScript' },
  { value: CodeLanguage.python, name: 'Python' },
];

export const codeLanguageDefaultValues = {
  [CodeLanguage.python]: `def main(arg1, arg2):
  return {
    "result": arg1 + arg2,
  }`,
  [CodeLanguage.javascript]: `function main({arg1, arg2}) {
    return {
        result: arg1 + arg2
    };  
};`
}


