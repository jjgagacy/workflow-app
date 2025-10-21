import { PASSWORD_SALT } from "@/config/constants";
import * as bcrypt from 'bcrypt';

describe('Password tests', () => {
    it('should create password', async () => {
        const password = 'abc12345';
        const passwordEncrypt = await bcrypt.hash(password, PASSWORD_SALT);
        console.log('Plain password:', password)
        console.log('Encrypted password:', passwordEncrypt);
        expect(passwordEncrypt).toBeDefined();
    });
})