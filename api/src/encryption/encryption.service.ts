import { Injectable } from "@nestjs/common";
import * as crypto from 'crypto';
import * as forge from 'node-forge';

export interface EncryptionKeyPair {
  publicKey: string;
  privateKey: string;
}

const HYBRID_PREFIX = Buffer.from('HYBRID:');

@Injectable()
export class EncryptionService {
  private readonly RSA_KEY_SIZE = 2048;
  private readonly RSA_BLOCK_SIZE = 256;
  private readonly AES_KEY_SIZE = 16;
  private readonly NONCE_SIZE = 16;
  private readonly TAG_SIZE = 16;

  async generateKeyPair(): Promise<EncryptionKeyPair> {
    const { publicKey, privateKey } = await new Promise<{ publicKey: string; privateKey: string; }>((resolve, reject) => {
      crypto.generateKeyPair('rsa', {
        modulusLength: this.RSA_KEY_SIZE, // Key length
        publicKeyEncoding: { type: 'spki', format: 'pem' }, // Public key encoding
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, // Private key encoding
      }, (err, publicKey, privateKey) => {
        if (err) reject(err);
        else resolve({ publicKey, privateKey });
      })
    });
    return { publicKey, privateKey };
  }

  /**
   * Encrypt plaintext using hybrid RSA-AES encryption scheme.
   * 
   * This function implements a hybrid encryption scheme that contains RSA asynmmetric 
   * encryption with AES symmetric encryption for secure data transmission.
   *
   * Step-by-step process:
   * 1. Key Generation
   *    Generates a random 128-bit AES key for symmetric encryption
   *    Generates a cryptographically secure 12-byte nonce for AES-GCM mode
   * 2. Symmetric Encryption
   *    Encrypts the plaintext using AES-128-GCM mode
   *    Produces both ciphertext and an authentication tag for integrity verification
   * 3. Asymmetric Encryption
   *    Encrypts the AES symmetric key using RSA-OAEP padding with the provided public key
   *    Ensures secure key exchange without exposing the symmetric key
   * 4. Data packaging
   *    Contatenates all components into a single buffer with a hybrid prefix identifier
   *    Format: [HYBRID_PREFIX][RSA-encrypted-AES-KEY][nonce][auth-tag][AES-encrypted-data]
   *
   * @param plaintext 
   * @param publicKeyPem 
   * @returns Buffer 
   */
  encrypt(plaintext: string, publicKeyPem: string): Buffer {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    // 1.Generate AES key
    const aesKey = crypto.randomBytes(16);
    // 2. Encrypt AES-GCM
    const nonce = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-128-gcm', aesKey, nonce);
    const ciphetext = Buffer.concat([
      cipher.update(Buffer.from(plaintext, 'utf8')),
      cipher.final(),
    ]);

    // 3. Encrypt AES key 
    const tag = cipher.getAuthTag();
    const aesKeyBinary = aesKey.toString('binary');
    const encryptAesKeyBinary = publicKey.encrypt(aesKeyBinary, 'RSA-OAEP');
    const encryptAesKey = Buffer.from(encryptAesKeyBinary, 'binary');
    if (encryptAesKey.length != this.RSA_BLOCK_SIZE) {
      throw new Error(`Unexpected RSA encrypted block size: ${encryptAesKey.length}`);
    }
    // 4. data packaging
    return Buffer.concat([HYBRID_PREFIX, encryptAesKey, nonce, tag, ciphetext]);
  }

  /**
   * Decrypt 
   */
  decrypt(buffer: Buffer, privateKeyPem: string): string {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

    // Non-HYBRID format -> using pure RSA descryption mode
    if (!buffer.subarray(0, HYBRID_PREFIX.length).equals(HYBRID_PREFIX)) {
      const decrypted = privateKey.decrypt(buffer.toString('binary'), 'RSA-OAEP');
      return decrypted.toString();
    }

    // Remove prefix
    buffer = buffer.subarray(HYBRID_PREFIX.length);
    const rsaBlockSize = 256; // RSA-2048 block size

    const encryptAesKey = buffer.subarray(0, rsaBlockSize);
    const nonce = buffer.subarray(rsaBlockSize, rsaBlockSize + 12);
    const tag = buffer.subarray(rsaBlockSize + 12, rsaBlockSize + 28);
    const ciphertext = buffer.subarray(rsaBlockSize + 28);

    // 1. RSA decrypt AES key
    const aesKey = Buffer.from(
      privateKey.decrypt(encryptAesKey.toString('binary'), 'RSA-OAEP'),
      'binary'
    );

    // 2. AES-GCM decrypt
    const decipher = crypto.createDecipheriv('aes-128-gcm', aesKey, nonce);
    decipher.setAuthTag(tag);

    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);

    return plaintext.toString('utf8');
  }
}

export function obfuscateToken(value: string): string {
  if (!value) return '';
  if (value.length <= 8) {
    return '****' + value.slice(-4);
  }
  return value.slice(0, 4) + '****' + value.slice(-4);
}
