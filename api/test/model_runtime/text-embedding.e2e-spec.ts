import { TextEmbeddingUsage } from "@/ai/model_runtime/classes/embedding/embedding-usage.class"

describe('EmbeddingUsage', () => {
    describe('emptyUsage', () => {
        it('should create an empty usage instance with default values', () => {
            const usage = TextEmbeddingUsage.emptyUsage();

            expect(usage.tokens).toBe(0);
            expect(usage.totalTokens).toBe(0);
            expect(usage.unitPrice).toBe(0);
            expect(usage.pricePerUnit).toBe(0);
            expect(usage.totalPrice).toBe(0);
            expect(usage.currency).toBe('USD');
            expect(usage.latency).toBe(0);
        });
    });

    describe('fromMetadata', () => {
        it('should create usage from metadata with provided values', () => {
            const metadata = {
                tokens: 1500,
                totalTokens: 1500,
                unitPrice: 0.000001,
                pricePerUnit: 1000,
                totalPrice: 0.0015,
                currency: 'CNY',
                latency: 0.5
            };

            const usage = TextEmbeddingUsage.fromMetadata(metadata);

            expect(usage.tokens).toBe(1500);
            expect(usage.totalTokens).toBe(1500);
            expect(usage.unitPrice).toBe(0.000001);
            expect(usage.pricePerUnit).toBe(1000);
            expect(usage.totalPrice).toBe(0.0015);
            expect(usage.currency).toBe('CNY');
            expect(usage.latency).toBe(0.5);
        });

        it('should use default values for missing metadata', () => {
            const metadata = { tokens: 1500 };
            const usage = TextEmbeddingUsage.fromMetadata(metadata);

            expect(usage.tokens).toBe(1500);
            expect(usage.totalTokens).toBe(0);
            expect(usage.unitPrice).toBe(0);
            expect(usage.totalPrice).toBe(0);
            expect(usage.currency).toBe("USD");
            expect(usage.latency).toBe(0);
        });
    });


    describe('plus', () => {
        it('should add two usage instances correctly', () => {
            const usage1 = TextEmbeddingUsage.fromMetadata({
                tokens: 1000,
                totalTokens: 1000,
                unitPrice: 0.000001,
                pricePerUnit: 1000,
                totalPrice: 0.001,
                currency: "USD",
                latency: 0.3
            });
            const usage2 = TextEmbeddingUsage.fromMetadata({
                tokens: 500,
                totalTokens: 500,
                unitPrice: 0.000001,
                pricePerUnit: 1000,
                totalPrice: 0.0005,
                currency: "USD",
                latency: 0.2
            });
            const result = usage1.plus(usage2);
            expect(result.tokens).toBe(1500);
            expect(result.totalTokens).toBe(1500);
            expect(result.unitPrice).toBe(0.000001); // Should use other's unit_price
            expect(result.pricePerUnit).toBe(1000); // Should use other's price_unit
            expect(result.totalPrice).toBe(0.0015);
            expect(result.currency).toBe("USD"); // Should use other's currency
            expect(result.latency).toBe(0.5);
        });
    });
});