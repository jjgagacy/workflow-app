import { TextEmbeddingUsage } from "src/model_runtime/classes/embedding/embedding-usage.class"

describe('EmbeddingUsage', () => {
    describe('emptyUsage', () => {
        it('should create an empty usage instance with default values', () => {
            const usage = TextEmbeddingUsage.emptyUsage();

            expect(usage.tokens).toBe(0);
            expect(usage.total_tokens).toBe(0);
            expect(usage.unit_price).toBe(0);
            expect(usage.price_per_unit).toBe(0);
            expect(usage.total_price).toBe(0);
            expect(usage.currency).toBe('USD');
            expect(usage.latency).toBe(0);
        });
    });

    describe('fromMetadata', () => {
        it('should create usage from metadata with provided values', () => {
            const metadata = {
                tokens: 1500,
                total_tokens: 1500,
                unit_price: 0.000001,
                price_per_unit: 1000,
                total_price: 0.0015,
                currency: 'CNY',
                latency: 0.5
            };

            const usage = TextEmbeddingUsage.fromMetadata(metadata);

            expect(usage.tokens).toBe(1500);
            expect(usage.total_tokens).toBe(1500);
            expect(usage.unit_price).toBe(0.000001);
            expect(usage.price_per_unit).toBe(1000);
            expect(usage.total_price).toBe(0.0015);
            expect(usage.currency).toBe('CNY');
            expect(usage.latency).toBe(0.5);
        });

        it('should use default values for missing metadata', () => {
            const metadata = { tokens: 1500 };
            const usage = TextEmbeddingUsage.fromMetadata(metadata);

            expect(usage.tokens).toBe(1500);
            expect(usage.total_tokens).toBe(0);
            expect(usage.unit_price).toBe(0);
            expect(usage.total_price).toBe(0);
            expect(usage.currency).toBe("USD");
            expect(usage.latency).toBe(0);
        });
    });


    describe('plus', () => {
        it('should add two usage instances correctly', () => {
            const usage1 = TextEmbeddingUsage.fromMetadata({
                tokens: 1000,
                total_tokens: 1000,
                unit_price: 0.000001,
                price_per_unit: 1000,
                total_price: 0.001,
                currency: "USD",
                latency: 0.3
            });
            const usage2 = TextEmbeddingUsage.fromMetadata({
                tokens: 500,
                total_tokens: 500,
                unit_price: 0.000001,
                price_per_unit: 1000,
                total_price: 0.0005,
                currency: "USD",
                latency: 0.2
            });
            const result = usage1.plus(usage2);
            expect(result.tokens).toBe(1500);
            expect(result.total_tokens).toBe(1500);
            expect(result.unit_price).toBe(0.000001); // Should use other's unit_price
            expect(result.price_per_unit).toBe(1000); // Should use other's price_unit
            expect(result.total_price).toBe(0.0015);
            expect(result.currency).toBe("USD"); // Should use other's currency
            expect(result.latency).toBe(0.5);
        });
    });
});