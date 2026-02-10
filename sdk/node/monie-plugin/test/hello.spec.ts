import { describe, it, expect } from '@jest/globals';

type HELLO = string

describe('test-hello', () => {
  it('should print string', () => {
    const hello: HELLO = 'hello world!';
    console.log(hello);
  })
});