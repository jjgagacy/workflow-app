// src/modules/model-runtime/entities/__tests__/llm-usage.spec.ts

import { LLMUsage } from "src/model_runtime/classes/llm/llm-usage.class";

describe('LLMUsage', () => {
  describe('constructor', () => {
    it('should initialize with default values', () => {
      const usage = new LLMUsage();
      
      expect(usage.prompt_tokens).toBe(0);
      expect(usage.prompt_unit_price).toBe(0);
      expect(usage.prompt_price_per_unit).toBe(0);
      expect(usage.prompt_price).toBe(0);
      expect(usage.completion_tokens).toBe(0);
      expect(usage.completion_unit_price).toBe(0);
      expect(usage.completion_price_per_unit).toBe(0);
      expect(usage.completion_price).toBe(0);
      expect(usage.total_tokens).toBe(0);
      expect(usage.total_price).toBe(0);
      expect(usage.currency).toBe('USD');
      expect(usage.latency).toBe(0);
    });
  });

  describe('emptyUsage', () => {
    it('should return a new LLMUsage instance with default values', () => {
      const usage = LLMUsage.emptyUsage();
      
      expect(usage).toBeInstanceOf(LLMUsage);
      expect(usage.prompt_tokens).toBe(0);
      expect(usage.total_tokens).toBe(0);
      expect(usage.currency).toBe('USD');
    });
  });

  describe('fromMetadata', () => {
    it('should create LLMUsage from complete metadata', () => {
      const metadata = {
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
        prompt_unit_price: 0.00001,
        completion_unit_price: 0.00002,
        prompt_price_per_unit: 1000,
        completion_price_per_unit: 1000,
        prompt_price: 0.01,
        completion_price: 0.01,
        total_price: 0.02,
        currency: 'CNY',
        latency: 250
      };

      const usage = LLMUsage.fromMetadata(metadata);
      
      expect(usage.prompt_tokens).toBe(1000);
      expect(usage.completion_tokens).toBe(500);
      expect(usage.total_tokens).toBe(1500);
      expect(usage.prompt_unit_price).toBe(0.00001);
      expect(usage.completion_unit_price).toBe(0.00002);
      expect(usage.prompt_price_per_unit).toBe(1000);
      expect(usage.completion_price_per_unit).toBe(1000);
      expect(usage.prompt_price).toBe(0.01);
      expect(usage.completion_price).toBe(0.01);
      expect(usage.total_price).toBe(0.02);
      expect(usage.currency).toBe('CNY');
      expect(usage.latency).toBe(250);
    });

    it('should use default values for missing metadata properties', () => {
      const metadata = { prompt_tokens: 200 };
      const usage = LLMUsage.fromMetadata(metadata);
      
      expect(usage.prompt_tokens).toBe(200);
      expect(usage.completion_tokens).toBe(0);
      expect(usage.total_tokens).toBe(0);
      expect(usage.prompt_unit_price).toBe(0);
      expect(usage.currency).toBe('USD');
      expect(usage.latency).toBe(0);
    });

    it('should handle string number values in metadata', () => {
      const metadata = {
        prompt_tokens: '1000',
        prompt_unit_price: '0.00001',
        prompt_price: '0.01'
      };

      const usage = LLMUsage.fromMetadata(metadata);
      
      expect(usage.prompt_tokens).toBe(1000);
      expect(usage.prompt_unit_price).toBe(0.00001);
      expect(usage.prompt_price).toBe(0.01);
    });

    it('should set completion_tokens to total_tokens when completion_tokens is 0 but total_tokens > 0', () => {
      const metadata = {
        total_tokens: 1500,
        completion_tokens: 0
      };

      const usage = LLMUsage.fromMetadata(metadata);
      
      expect(usage.total_tokens).toBe(1500);
      expect(usage.completion_tokens).toBe(1500); // Should be set to total_tokens
    });

    it('should not modify completion_tokens when both total_tokens and completion_tokens are 0', () => {
      const metadata = {
        total_tokens: 0,
        completion_tokens: 0
      };

      const usage = LLMUsage.fromMetadata(metadata);
      
      expect(usage.total_tokens).toBe(0);
      expect(usage.completion_tokens).toBe(0);
    });

    it('should handle null and undefined metadata', () => {
      const usage1 = LLMUsage.fromMetadata(null as any);
      const usage2 = LLMUsage.fromMetadata(undefined as any);
      
      expect(usage1.prompt_tokens).toBe(0);
      expect(usage2.prompt_tokens).toBe(0);
    });
  });

  describe('plus', () => {
    it('should add two LLMUsage instances correctly', () => {
      const usage1 = LLMUsage.fromMetadata({
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
        prompt_unit_price: 0.00001,
        completion_unit_price: 0.00002,
        prompt_price_per_unit: 1000,
        completion_price_per_unit: 1000,
        prompt_price: 0.01,
        completion_price: 0.01,
        total_price: 0.02,
        currency: 'USD',
        latency: 100
      });

      const usage2 = LLMUsage.fromMetadata({
        prompt_tokens: 2000,
        completion_tokens: 1000,
        total_tokens: 3000,
        prompt_unit_price: 0.00001,
        completion_unit_price: 0.00002,
        prompt_price_per_unit: 1000,
        completion_price_per_unit: 1000,
        prompt_price: 0.02,
        completion_price: 0.02,
        total_price: 0.04,
        currency: 'USD',
        latency: 150
      });

      const result = usage1.plus(usage2);
      
      // Tokens should be summed
      expect(result.prompt_tokens).toBe(3000);
      expect(result.completion_tokens).toBe(1500);
      expect(result.total_tokens).toBe(4500);
      
      // Prices should be summed
      expect(result.prompt_price).toBe(0.03);
      expect(result.completion_price).toBe(0.03);
      expect(result.total_price).toBe(0.06);
      
      // Unit prices should be taken from the "other" usage
      expect(result.prompt_unit_price).toBe(0.00001);
      expect(result.completion_unit_price).toBe(0.00002);
      expect(result.prompt_price_per_unit).toBe(1000);
      expect(result.completion_price_per_unit).toBe(1000);
      
      // Currency should be taken from the "other" usage
      expect(result.currency).toBe('USD');
      
      // Latency should be summed
      expect(result.latency).toBe(250);
    });

    it('should return the other usage when current usage has zero total_tokens', () => {
      const emptyUsage = new LLMUsage(); // total_tokens = 0
      const otherUsage = LLMUsage.fromMetadata({
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
        prompt_price: 0.01,
        completion_price: 0.01,
        total_price: 0.02,
        currency: 'EUR',
        latency: 200
      });

      const result = emptyUsage.plus(otherUsage);
      
      // Should return the other usage unchanged
      expect(result.prompt_tokens).toBe(1000);
      expect(result.completion_tokens).toBe(500);
      expect(result.total_tokens).toBe(1500);
      expect(result.currency).toBe('EUR');
      expect(result.latency).toBe(200);
    });

    it('should handle different currencies by using the other usage currency', () => {
      const usage1 = LLMUsage.fromMetadata({
        prompt_tokens: 1000,
        prompt_price: 0.01,
        currency: 'USD'
      });

      const usage2 = LLMUsage.fromMetadata({
        prompt_tokens: 2000,
        prompt_price: 0.02,
        currency: 'EUR'
      });

      const result = usage1.plus(usage2);
      
      // Should use the currency from the second usage
      expect(result.currency).toBe('EUR');
      expect(result.prompt_price).toBe(0.03);
    });

    it('should handle zero values correctly', () => {
      const usage1 = LLMUsage.fromMetadata({
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        prompt_price: 0,
        completion_price: 0,
        total_price: 0,
        latency: 0
      });

      const usage2 = LLMUsage.fromMetadata({
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        prompt_price: 0,
        completion_price: 0,
        total_price: 0,
        latency: 0
      });

      const result = usage1.plus(usage2);
      
      expect(result.prompt_tokens).toBe(0);
      expect(result.completion_tokens).toBe(0);
      expect(result.total_tokens).toBe(0);
      expect(result.prompt_price).toBe(0);
      expect(result.completion_price).toBe(0);
      expect(result.total_price).toBe(0);
      expect(result.latency).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers correctly', () => {
      const metadata = {
        prompt_tokens: 1000000,
        completion_tokens: 500000,
        total_tokens: 1500000,
        prompt_price: 1000.50,
        completion_price: 500.25,
        total_price: 1500.75
      };

      const usage = LLMUsage.fromMetadata(metadata);
      
      expect(usage.prompt_tokens).toBe(1000000);
      expect(usage.completion_tokens).toBe(500000);
      expect(usage.total_tokens).toBe(1500000);
      expect(usage.prompt_price).toBe(1000.50);
      expect(usage.completion_price).toBe(500.25);
      expect(usage.total_price).toBe(1500.75);
    });

    it('should handle very small decimal values correctly', () => {
      const metadata = {
        prompt_unit_price: 0.0000001,
        completion_unit_price: 0.0000002,
        prompt_price: 0.000000001,
        completion_price: 0.000000002
      };

      const usage = LLMUsage.fromMetadata(metadata);
      
      expect(usage.prompt_unit_price).toBeCloseTo(0.0000001, 10);
      expect(usage.completion_unit_price).toBeCloseTo(0.0000002, 10);
      expect(usage.prompt_price).toBeCloseTo(0.000000001, 10);
      expect(usage.completion_price).toBeCloseTo(0.000000002, 10);
    });

    it('should handle negative values (though they should not occur in practice)', () => {
      const metadata = {
        prompt_tokens: -100,
        completion_tokens: -50,
        prompt_price: -0.01,
        completion_price: -0.005
      };

      const usage = LLMUsage.fromMetadata(metadata);
      
      expect(usage.prompt_tokens).toBe(-100);
      expect(usage.completion_tokens).toBe(-50);
      expect(usage.prompt_price).toBe(-0.01);
      expect(usage.completion_price).toBe(-0.005);
    });
  });
});