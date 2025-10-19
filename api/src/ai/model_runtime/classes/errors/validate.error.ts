export class CredentialsValidateFailedError extends Error {
    constructor(description?: string) {
        super(description || 'Credentials Validate Failed');
        this.name = 'CredentialsValidateFailedError';

        Object.setPrototypeOf(this, CredentialsValidateFailedError.prototype);
    }
}
