export function bufferToHex(buffer: Buffer): string {
  return buffer.toString('hex');
}

export function hexToBuffer(hex: string): Buffer {
  return Buffer.from(hex, 'hex');
}