import { InvokeAuthorizationError, InvokeBadRequestError, InvokeConnectionError, InvokeRateLimitError, InvokeServiceUnavailableError } from "src/model_runtime/classes/errors/invoke-connection.error";
import { InvokeError } from "src/model_runtime/classes/errors/invoke.error";

describe("ModelRuntime custome error", () => {
    describe('InvokeError', () => {
        it('should handle instanceOf', () => {
            const error = new InvokeError('Test error');
            expect(error).toBeInstanceOf(InvokeError);
            expect(error).toBeInstanceOf(Error);
            expect(Object.getPrototypeOf(error) === InvokeError.prototype).toBe(true);
        });

        it('should have correct inheritance hierarchy', () => {
            const error = new InvokeError('Test error');
            expect(typeof error.toString).toBe('function');
            expect(error.toString()).toBe('Test error');
        });

        it('should create with default message', () => {
            const error = new InvokeError();
            expect(error.name).toBe('InvokeError');
            expect(error.message).toBe('InvokeError');
            expect(error.description).toBeUndefined();
        });

        it('should create with custom description', () => {
            const error = new InvokeError('Custom error description');
            expect(error.message).toBe('Custom error description');
            expect(error.description).toBe('Custom error description');
        });

        it('should convert to string correctly', () => {
            const error1 = new InvokeError();
            expect(error1.toString()).toBe('InvokeError');

            const error2 = new InvokeError('Custom error');
            expect(error2.toString()).toBe('Custom error');
        });

        it('should maintain proper prototype chain', () => {
            const error = new InvokeError();
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(InvokeError);
        });
    });

    describe('InvokeConnectionError', () => {
        it('should create with default message', () => {
            const error = new InvokeConnectionError();
            expect(error.name).toBe('InvokeConnectionError');
            expect(error.message).toBe('Connection Error');
            expect(error.description).toBe('Connection Error');
        });

        it('should create with custom description', () => {
            const error = new InvokeConnectionError('Custom connection error');
            expect(error.message).toBe('Custom connection error');
            expect(error.description).toBe('Custom connection error');
        });

        it('should maintain proper prototype chain', () => {
            const error = new InvokeConnectionError();
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(InvokeError);
            expect(error).toBeInstanceOf(InvokeConnectionError);
        });
    });

    describe('InvokeServiceUnavailableError', () => {
        it('should create with default message', () => {
            const error = new InvokeServiceUnavailableError();
            expect(error.name).toBe('InvokeServiceUnavailableError');
            expect(error.message).toBe('Service Unavailable Error');
            expect(error.description).toBe('Service Unavailable Error');
        });

        it('should create with custom description', () => {
            const error = new InvokeServiceUnavailableError('Server down for maintenance');
            expect(error.message).toBe('Server down for maintenance');
            expect(error.description).toBe('Server down for maintenance');
        });
    });

    describe('InvokeRateLimitError', () => {
        it('should create with default message', () => {
            const error = new InvokeRateLimitError();
            expect(error.name).toBe('InvokeRateLimitError');
            expect(error.message).toBe('Rate Limit Error');
            expect(error.description).toBe('Rate Limit Error');
        });

        it('should create with custom description', () => {
            const error = new InvokeRateLimitError('Too many requests, try again later');
            expect(error.message).toBe('Too many requests, try again later');
            expect(error.description).toBe('Too many requests, try again later');
        });
    });

    describe('InvokeAuthorizationError', () => {
        it('should create with default message', () => {
            const error = new InvokeAuthorizationError();
            expect(error.name).toBe('InvokeAuthorizationError');
            expect(error.message).toBe('Incorrect model credentials provided, please check and try again.');
            expect(error.description).toBe('Incorrect model credentials provided, please check and try again.');
        });

        it('should create with custom description', () => {
            const error = new InvokeAuthorizationError('Invalid API key');
            expect(error.message).toBe('Invalid API key');
            expect(error.description).toBe('Invalid API key');
        });
    });

    describe('InvokeBadRequestError', () => {
        it('should create with default message', () => {
            const error = new InvokeBadRequestError();
            expect(error.name).toBe('InvokeBadRequestError');
            expect(error.message).toBe('Bad Request Error');
            expect(error.description).toBe('Bad Request Error');
        });

        it('should create with custom description', () => {
            const error = new InvokeBadRequestError('Invalid request parameters');
            expect(error.message).toBe('Invalid request parameters');
            expect(error.description).toBe('Invalid request parameters');
        });
    });

    describe('Exception Filter Integration', () => {
        it('should have correct inheritance hierarchy', () => {
            const connectionError = new InvokeConnectionError();
            const serverError = new InvokeServiceUnavailableError();
            const rateLimitError = new InvokeRateLimitError();
            const authError = new InvokeAuthorizationError();
            const badRequestError = new InvokeBadRequestError();

            // All should be instances of base Error
            expect(connectionError).toBeInstanceOf(Error);
            expect(serverError).toBeInstanceOf(Error);
            expect(rateLimitError).toBeInstanceOf(Error);
            expect(authError).toBeInstanceOf(Error);
            expect(badRequestError).toBeInstanceOf(Error);

            // All should be instances of InvokeError
            expect(connectionError).toBeInstanceOf(InvokeError);
            expect(serverError).toBeInstanceOf(InvokeError);
            expect(rateLimitError).toBeInstanceOf(InvokeError);
            expect(authError).toBeInstanceOf(InvokeError);
            expect(badRequestError).toBeInstanceOf(InvokeError);

            // Each should be instance of their own class
            expect(connectionError).toBeInstanceOf(InvokeConnectionError);
            expect(serverError).toBeInstanceOf(InvokeServiceUnavailableError);
            expect(rateLimitError).toBeInstanceOf(InvokeRateLimitError);
            expect(authError).toBeInstanceOf(InvokeAuthorizationError);
            expect(badRequestError).toBeInstanceOf(InvokeBadRequestError);
        });
    });

});