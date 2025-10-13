// src/modules/model-runtime/entities/__tests__/llm-usage.spec.ts

import { LLMUsage } from "@/model_runtime/classes/llm/llm-usage.class";

describe('LLMUsage', () => {
  describe('constructor', () => {
    it('should initialize with default values', () => {
      const usage = new LLMUsage();

      expect(usage.promptTokens).toBe(0);
      expect(usage.promptUnitPrice).toBe(0);
      expect(usage.promptPricePerUnit).toBe(0);
      expect(usage.promptPrice).toBe(0);
      expect(usage.completionTokens).toBe(0);
      expect(usage.completionUnitPrice).toBe(0);
      expect(usage.completionPricePerUnit).toBe(0);
      expect(usage.completionPrice).toBe(0);
      expect(usage.totalTokens).toBe(0);
      expect(usage.totalPrice).toBe(0);
      expect(usage.currency).toBe('USD');
      expect(usage.latency).toBe(0);
    });
  });

  describe('emptyUsage', () => {
    it('should return a new LLMUsage instance with default values', () => {
      const usage = LLMUsage.emptyUsage();

      expect(usage).toBeInstanceOf(LLMUsage);
      expect(usage.promptTokens).toBe(0);
      expect(usage.totalTokens).toBe(0);
      expect(usage.currency).toBe('USD');
    });
  });

  describe('fromMetadata', () => {
    it('should create LLMUsage from complete metadata', () => {
      const metadata = {
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
        promptUnitPrice: 0.00001,
        completionUnitPrice: 0.00002,
        promptPricePerUnit: 1000,
        completionPricePerUnit: 1000,
        promptPrice: 0.01,
        completionPrice: 0.01,
        totalPrice: 0.02,
        currency: 'CNY',
        latency: 250
      };

      const usage = LLMUsage.fromMetadata(metadata);

      expect(usage.promptTokens).toBe(1000);
      expect(usage.completionTokens).toBe(500);
      expect(usage.totalTokens).toBe(1500);
      expect(usage.promptUnitPrice).toBe(0.00001);
      expect(usage.completionUnitPrice).toBe(0.00002);
      expect(usage.promptPricePerUnit).toBe(1000);
      expect(usage.completionPricePerUnit).toBe(1000);
      expect(usage.promptPrice).toBe(0.01);
      expect(usage.completionPrice).toBe(0.01);
      expect(usage.totalPrice).toBe(0.02);
      expect(usage.currency).toBe('CNY');
      expect(usage.latency).toBe(250);
    });

    it('should use default values for missing metadata properties', () => {
      const metadata = { promptTokens: 200 };
      const usage = LLMUsage.fromMetadata(metadata);

      expect(usage.promptTokens).toBe(200);
      expect(usage.completionTokens).toBe(0);
      expect(usage.totalTokens).toBe(0);
      expect(usage.promptUnitPrice).toBe(0);
      expect(usage.currency).toBe('USD');
      expect(usage.latency).toBe(0);
    });

    it('should handle string number values in metadata', () => {
      const metadata = {
        promptTokens: '1000',
        promptUnitPrice: '0.00001',
        promptPrice: '0.01'
      };

      const usage = LLMUsage.fromMetadata(metadata);

      expect(usage.promptTokens).toBe(1000);
      expect(usage.promptUnitPrice).toBe(0.00001);
      expect(usage.promptPrice).toBe(0.01);
    });

    it('should set completionTokens to totalTokens when completionTokens is 0 but totalTokens > 0', () => {
      const metadata = {
        totalTokens: 1500,
        completionTokens: 0
      };

      const usage = LLMUsage.fromMetadata(metadata);

      expect(usage.totalTokens).toBe(1500);
      expect(usage.completionTokens).toBe(1500); // Should be set to totalTokens
    });

    it('should not modify completionTokens when both totalTokens and completionTokens are 0', () => {
      const metadata = {
        totalTokens: 0,
        completionTokens: 0
      };

      const usage = LLMUsage.fromMetadata(metadata);

      expect(usage.totalTokens).toBe(0);
      expect(usage.completionTokens).toBe(0);
    });

    it('should handle null and undefined metadata', () => {
      const usage1 = LLMUsage.fromMetadata(null as any);
      const usage2 = LLMUsage.fromMetadata(undefined as any);

      expect(usage1.promptTokens).toBe(0);
      expect(usage2.promptTokens).toBe(0);
    });
  });

  describe('plus', () => {
    it('should add two LLMUsage instances correctly', () => {
      const usage1 = LLMUsage.fromMetadata({
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
        promptUnitPrice: 0.00001,
        completionUnitPrice: 0.00002,
        promptPricePerUnit: 1000,
        completionPricePerUnit: 1000,
        promptPrice: 0.01,
        completionPrice: 0.01,
        totalPrice: 0.02,
        currency: 'USD',
        latency: 100
      });

      const usage2 = LLMUsage.fromMetadata({
        promptTokens: 2000,
        completionTokens: 1000,
        totalTokens: 3000,
        promptUnitPrice: 0.00001,
        completionUnitPrice: 0.00002,
        promptPricePerUnit: 1000,
        completionPricePerUnit: 1000,
        promptPrice: 0.02,
        completionPrice: 0.02,
        totalPrice: 0.04,
        currency: 'USD',
        latency: 150
      });

      const result = usage1.plus(usage2);

      // Tokens should be summed
      expect(result.promptTokens).toBe(3000);
      expect(result.completionTokens).toBe(1500);
      expect(result.totalTokens).toBe(4500);

      // Prices should be summed
      expect(result.promptPrice).toBe(0.03);
      expect(result.completionPrice).toBe(0.03);
      expect(result.totalPrice).toBe(0.06);

      // Unit prices should be taken from the "other" usage
      expect(result.promptUnitPrice).toBe(0.00001);
      expect(result.completionUnitPrice).toBe(0.00002);
      expect(result.promptPricePerUnit).toBe(1000);
      expect(result.completionPricePerUnit).toBe(1000);

      // Currency should be taken from the "other" usage
      expect(result.currency).toBe('USD');

      // Latency should be summed
      expect(result.latency).toBe(250);
    });

    it('should return the other usage when current usage has zero totalTokens', () => {
      const emptyUsage = new LLMUsage(); // totalTokens = 0
      const otherUsage = LLMUsage.fromMetadata({
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
        promptPrice: 0.01,
        completionPrice: 0.01,
        totalPrice: 0.02,
        currency: 'EUR',
        latency: 200
      });

      const result = emptyUsage.plus(otherUsage);

      // Should return the other usage unchanged
      expect(result.promptTokens).toBe(1000);
      expect(result.completionTokens).toBe(500);
      expect(result.totalTokens).toBe(1500);
      expect(result.currency).toBe('EUR');
      expect(result.latency).toBe(200);
    });

    it('should handle different currencies by using the other usage currency', () => {
      const usage1 = LLMUsage.fromMetadata({
        promptTokens: 1000,
        promptPrice: 0.01,
        currency: 'USD'
      });

      const usage2 = LLMUsage.fromMetadata({
        promptTokens: 2000,
        promptPrice: 0.02,
        currency: 'EUR'
      });

      const result = usage1.plus(usage2);

      // Should use the currency from the second usage
      expect(result.currency).toBe('EUR');
      expect(result.promptPrice).toBe(0.03);
    });

    it('should handle zero values correctly', () => {
      const usage1 = LLMUsage.fromMetadata({
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        promptPrice: 0,
        completionPrice: 0,
        totalPrice: 0,
        latency: 0
      });

      const usage2 = LLMUsage.fromMetadata({
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        promptPrice: 0,
        completionPrice: 0,
        totalPrice: 0,
        latency: 0
      });

      const result = usage1.plus(usage2);

      expect(result.promptTokens).toBe(0);
      expect(result.completionTokens).toBe(0);
      expect(result.totalTokens).toBe(0);
      expect(result.promptPrice).toBe(0);
      expect(result.completionPrice).toBe(0);
      expect(result.totalPrice).toBe(0);
      expect(result.latency).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers correctly', () => {
      const metadata = {
        promptTokens: 1000000,
        completionTokens: 500000,
        totalTokens: 1500000,
        promptPrice: 1000.50,
        completionPrice: 500.25,
        totalPrice: 1500.75
      };

      const usage = LLMUsage.fromMetadata(metadata);

      expect(usage.promptTokens).toBe(1000000);
      expect(usage.completionTokens).toBe(500000);
      expect(usage.totalTokens).toBe(1500000);
      expect(usage.promptPrice).toBe(1000.50);
      expect(usage.completionPrice).toBe(500.25);
      expect(usage.totalPrice).toBe(1500.75);
    });

    it('should handle very small decimal values correctly', () => {
      const metadata = {
        promptUnitPrice: 0.0000001,
        completionUnitPrice: 0.0000002,
        promptPrice: 0.000000001,
        completionPrice: 0.000000002
      };

      const usage = LLMUsage.fromMetadata(metadata);

      expect(usage.promptUnitPrice).toBeCloseTo(0.0000001, 10);
      expect(usage.completionUnitPrice).toBeCloseTo(0.0000002, 10);
      expect(usage.promptPrice).toBeCloseTo(0.000000001, 10);
      expect(usage.completionPrice).toBeCloseTo(0.000000002, 10);
    });

    it('should handle negative values (though they should not occur in practice)', () => {
      const metadata = {
        promptTokens: -100,
        completionTokens: -50,
        promptPrice: -0.01,
        completionPrice: -0.005
      };

      const usage = LLMUsage.fromMetadata(metadata);

      expect(usage.promptTokens).toBe(-100);
      expect(usage.completionTokens).toBe(-50);
      expect(usage.promptPrice).toBe(-0.01);
      expect(usage.completionPrice).toBe(-0.005);
    });
  });
});