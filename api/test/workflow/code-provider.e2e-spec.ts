import { JavascriptCodeProvider } from '@/ai/workflow/executor/providers/javascript-code.provider';
import { PythonCodeProvider } from '@/ai/workflow/executor/providers/python-code.provider';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';

describe('code provider (e2e)', () => {

  it('should print javascript code default config', () => {
    console.log(JavascriptCodeProvider.getDefaultConfig());
  });

  it('should print python code default code', () => {
    console.log(PythonCodeProvider.getDefaultCode());
  });

});