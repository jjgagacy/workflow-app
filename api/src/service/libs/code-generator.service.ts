import { randomInt } from 'crypto';

export class CodeGenerator {
  static generateNumberCode(length: number = 6): string {
    if (length < 1) throw new Error('Length must be greater zero');

    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;

    return randomInt(min, max + 1).toString();
  }

  static generateAlphanumericCode(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.random() * chars.length);
    }
    return result;
  }
}
