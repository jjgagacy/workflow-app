import { CodeLanguage } from "../../types";

export const codeLanguages = {
  [CodeLanguage.python]: 'python',
  [CodeLanguage.javascript]: 'javascript',
}

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


