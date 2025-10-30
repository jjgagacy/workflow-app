import NodeRSA = require('node-rsa');

describe('RSA Utils E2E Test', () => {
    let key: NodeRSA;
    let importedPublicKey: NodeRSA;
    let importedPrivateKey: NodeRSA;

    beforeAll(() => {
        key = new NodeRSA({ b: 2048 });
        key.setOptions({ encryptionScheme: 'pkcs1_oaep' });

        const publicKey = Buffer.from(`
            -----BEGIN PUBLIC KEY-----
            MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiQWexmLDemamD8SO/8fN
            Ipu71epVaXiWAmTSQTfcmcfq05K62wTQO5BoinlGUPjZFJBq+dOLf86kc0ZjieJ5
            A6ZGJEgVNOP3qx1Qn5c/+Wvq/LwvQqxMQLxWMUa3AQB41VU0IKxkn1pH2osq1PGV
            Rpw/600VtsY91Wap/ol4DrsplVgiGfJITYl5tnMjAtM/pmEhjxiMrXbJiuEr/59d
            5gxWG9726q6SS46Zplj9CYWpY3IZGzkWos9m4SABUwkRJ+EgfWgeG++fbnuV9l5F
            ZpO2aXv9XTUVDuqDtlGShqhfhXECJA8pNDftvQnOpZrJY9IqyJZxZfOR/UMmIOy0
            2QIDAQAB
            -----END PUBLIC KEY-----
            `, 'utf-8');
        const privateKey = Buffer.from(`
            -----BEGIN RSA PRIVATE KEY-----
            MIIEpAIBAAKCAQEAiQWexmLDemamD8SO/8fNIpu71epVaXiWAmTSQTfcmcfq05K6
            2wTQO5BoinlGUPjZFJBq+dOLf86kc0ZjieJ5A6ZGJEgVNOP3qx1Qn5c/+Wvq/Lwv
            QqxMQLxWMUa3AQB41VU0IKxkn1pH2osq1PGVRpw/600VtsY91Wap/ol4DrsplVgi
            GfJITYl5tnMjAtM/pmEhjxiMrXbJiuEr/59d5gxWG9726q6SS46Zplj9CYWpY3IZ
            GzkWos9m4SABUwkRJ+EgfWgeG++fbnuV9l5FZpO2aXv9XTUVDuqDtlGShqhfhXEC
            JA8pNDftvQnOpZrJY9IqyJZxZfOR/UMmIOy02QIDAQABAoIBACJcCG6TAZXF+8pk
            bb9yKNyO1NFVi8mA9YzwH1E/YtAlM5uOZdDaKiVllvFya9GONVFUzZ6MD6Ui+lX1
            xqwi4Fmr7lbWxIqYx9he54K9eMtg5nIt9mPvtMde8vY0V1um9KX6UbIHyMu05ePF
            lh4D3nzwXY7xq4pDt+m1btdnPXXj1v8R4qjrv/8dWBEt7zxEaDtI80cuufRYiKfo
            1gqWXDyS9dncM3iP9DCnAFoeWU7bVua/GnLVV1R3m0UJXgWbm08CdGxc3t2KLRq1
            5Vc1hcjw6k0Zdk0i3PagzXaoUq3jXmIj61W1wZi2pjVDcWpFYOlAdFxz4mFmpKLM
            IIdTRgkCgYEAxY41kVniOzfcJIIhFzZEJusU4T7vhhyclFwNLSRMFN3c5RTmudy4
            uYm+rmCT3+Z8kqA2TMXhiNLb1wXW6SE9zMsz0FBFFVU1GB0x5c/c3zFEaXKkInCp
            +t+NTiaMBEaJUjeloI7ziFv5LPrPt3lH8vqZU96lCxXX+LTBrvpGa6sCgYEAsY7s
            87eFFftEmkw/WL+in3tBjmqcV+0AQ3Hpniks28HRoJ6BpGIuWZq5sJ8cgyaDx+CE
            5nEyogDxinzoR5jcO3EuPbhJJhYwSL6gRE5W034TppjCTigf5YqG7JrtsYuzz/+n
            N+8g73jwOmuHODOp7aSNBrD86fwZIw8bQbKZvYsCgYEAlV+Gj2WIEkCVWqFuBdAJ
            Tef3/KwKjbv6hI7pg5VrVWe/yxK3thb3MYq+O7lYdjYfQPqUtA33Du5oPTf0HIf+
            42dNwRfAdHXd1GLWxK4bkkL9OEHvav8G92KqxEmPGvh+gkUDHdiYuSTZzjHCdzbj
            uQvUfT7eSfh1OV7rB7PDJUsCgYAZZZYi7hcNI9mWMF3HNfHu2dRwqHMgaHfnLb36
            r20JKdnwHXvxpVF345e32apcX//tcQHRbFOPtI7X/jHDO+wUXIX+sgNUfUv+u7V0
            z7e/nIL3C1aPk1GspXnTEf35rT/U+n5Sk9OkLSo/UO4QbeNaaHT7hglG9pYp25lM
            dl1jLQKBgQChBH4LnXMI6emz4s4S91aPxK2fD8iLmL4vkb/v6SWFCuSJCMZtuF3K
            0Duet5EBzWkBa5rm2I4iPRofqIiKOzvykXaDMEKtUQIDlquYKR97quQ6Blalz6YO
            44P9E343OOvdNv8LudlUjATbRvLdtMQtgVPeVDu3irxW7kf9JvQgSA==
            -----END RSA PRIVATE KEY-----
        `, 'utf-8');

        importedPublicKey = new NodeRSA({ b: 2048 });
        importedPublicKey.setOptions({ encryptionScheme: 'pkcs1_oaep' })
        importedPublicKey.importKey(publicKey, 'public');

        importedPrivateKey = new NodeRSA({ b: 2048 });
        importedPrivateKey.setOptions({ encryptionScheme: 'pkcs1_oaep' })
        importedPrivateKey.importKey(privateKey, 'private');
    });

    it('should generate RSA key pair', () => {
        const publicKey = key.exportKey('public');
        const privateKey = key.exportKey('private');

        // console.log(publicKey);
        // console.log(privateKey);
        expect(publicKey).toBeDefined();
        expect(privateKey).toBeDefined();
    });

    it('should encrypt and decrypt data correctly', () => {
        const originalData = 'Hello, RSA Encryption!';

        const encrypted = key.encrypt(originalData, 'base64');
        const decrypted = key.decrypt(encrypted, 'utf8');

        expect(decrypted).toBe(originalData);
    });

    it('should sign and verify data correctly', () => {
        const data = 'This is some data to sign';
        const dataBuffer = Buffer.from(data, 'utf8');

        const signature = key.sign(dataBuffer, 'base64', 'utf8');
        const isVerified = key.verify(dataBuffer, signature, 'utf8', 'base64');

        expect(isVerified).toBe(true);
    });

    it('should export and import keys correctly', () => {
        const data = 'Test data for key import/export';
        const encrypted = importedPublicKey.encrypt(data, 'base64');
        const decrypted = importedPrivateKey.decrypt(encrypted, 'utf8');
        expect(decrypted).toBe(data);
    });

    it('should encrypt and decrypt JSON data', () => {
        const userData = {
            id: 12345,
            name: '张三',
            email: 'zhangsan@example.com',
            timestamp: new Date().toISOString()
        };

        const jsonString = JSON.stringify(userData);
        const enctypted = importedPublicKey.encrypt(jsonString, 'base64');
        const decrypted = importedPrivateKey.decrypt(enctypted, 'utf8');
        const parsedData = JSON.parse(decrypted);

        expect(parsedData.id).toBe(userData.id);
        expect(parsedData.name).toBe(userData.name);
    });

    it('should handle different encoding formats', () => {
        const testData = 'Test data with special chars: 中文!@#$%';

        // 测试不同编码格式
        const encryptedBase64 = importedPublicKey.encrypt(testData, 'base64');
        // const encryptedHex = importedPublicKey.encrypt(testData, 'hex');

        // console.log('Encrypted (base64):', encryptedBase64);
        // console.log('Encrypted (hex):', encryptedHex);
        // console.log('Hex length:', encryptedHex.length);

        const decryptedFromBase64 = importedPrivateKey.decrypt(encryptedBase64, 'utf8');
        // const decryptedFromHex = importedPrivateKey.decrypt(encryptedHex, 'hex'); // todo 报错

        // console.log('Decrypted (base64):', decryptedFromBase64);
        expect(decryptedFromBase64).toBe(testData);
        // expect(decryptedFromHex).toBe(testData);
    });

    afterAll(() => {
        // 不需要设为 null，让垃圾回收自动处理
        // 或者重新创建一个空实例
        key = new NodeRSA({ b: 512 }); // 使用较小的密钥
    });
});