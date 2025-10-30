import * as crypto from 'crypto';
import { promisify } from 'util';

const generateKeyPairAsync = promisify(crypto.generateKeyPair);

describe('Encryption Utils E2E Test', () => {
    let publicKey: string;
    let privateKey: string;

    beforeAll(async () => {
        const keyPair: any = await generateKeyPairAsync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        publicKey = keyPair.publicKey;
        privateKey = keyPair.privateKey;
    });

    it('should encrypt and decrypt data correctly', async () => {
        const { publicKey, privateKey } = await new Promise<{ publicKey: string; privateKey: string; }>((resolve, reject) => {
            crypto.generateKeyPair('rsa', {
                modulusLength: 2048, // Key length
                publicKeyEncoding: { type: 'spki', format: 'pem' }, // Public key encoding
                privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, // Private key encoding
            }, (err, publicKey, privateKey) => {
                if (err) reject(err);
                else
                    resolve({ publicKey, privateKey });
            })
        });
        console.log(publicKey);
        console.log(privateKey);
    });

    it('should encrypt and decrypt data correctly', async () => {
        // 使用 async/await
        const { publicKey, privateKey } = await generateKeyPairAsync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        // 测试断言
        expect(publicKey).toBeDefined();
        expect(privateKey).toBeDefined();
    });

    it('should encrypt and decrypt data correctly', () => {
        const originalData = 'Hello, RSA Encryption!';

        const encrypted = crypto.publicEncrypt({
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
            Buffer.from(originalData),
        );

        const decrypted = crypto.privateDecrypt({
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        }, encrypted);

        expect(decrypted.toString()).toBe(originalData);
    });

    it('should sign and verify data correctly', () => {
        const data = 'Important data to sign';

        // 创建签名
        const sign = crypto.createSign('SHA256');
        sign.update(data);
        sign.end();

        const signature = sign.sign(privateKey, 'base64');

        // 验证签名
        const verify = crypto.createVerify('SHA256');
        verify.update(data);
        verify.end();

        const isValid = verify.verify(publicKey, signature, 'base64');
        expect(isValid).toBe(true);
    });

    it('should handle different data types', () => {
        const testCases = [
            'Short text',
            'Longer text with special characters: !@#$%^&*()',
            JSON.stringify({ message: 'Hello', number: 42, array: [1, 2, 3] })
        ];

        testCases.forEach(originalData => {
            // 加密
            const encrypted = crypto.publicEncrypt({
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            }, Buffer.from(originalData));

            // 解密
            const decrypted = crypto.privateDecrypt({
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            }, encrypted);

            expect(decrypted.toString()).toBe(originalData);
        });
    });
});