export function containsChinese(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  // 基本中文字符范围（常用汉字）
  const basicChineseRegex = /[\u4e00-\u9fff]/;
  // 扩展中文字符范围（包括繁体、部首、标点等）
  // const extendedChineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/;

  // CJK统一表意文字扩展
  // const cjkExtensionsRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3000-\u303f\uff00-\uffef\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f]/;
  // 使用基本范围检测，性能最好
  return basicChineseRegex.test(text);
}

export function decodeFilename(filename: string): string {
  // 列出允许的编码类型
  const encodings: BufferEncoding[] = ['utf8', 'latin1', 'ascii', 'binary', 'base64', 'hex'];

  for (const encoding of encodings) {
    try {
      // 注意：对于 'binary' 编码，需要特殊处理
      if (encoding === 'binary') {
        // 对于二进制编码，可以尝试从 Latin1 解码
        const latin1Buffer = Buffer.from(filename, 'latin1');
        const decoded = latin1Buffer.toString('utf8');
        if (containsChinese(decoded)) {
          return decoded;
        }
      } else {
        const buffer = Buffer.from(filename, encoding);
        const decoded = buffer.toString('utf8');
        if (this.isValidChinese(decoded)) {
          return decoded;
        }
      }
    } catch (e) {
      continue;
    }
  }

  return filename;
}
