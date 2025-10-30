import { Injectable } from "@nestjs/common";
import * as crypto from 'crypto';

export interface EncryptionKeyPair {
    publicKey: string;
    privateKey: string;
}

@Injectable()
export class EncryptionService {
    private readonly RSA_KEY_SIZE = 2048;
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
}