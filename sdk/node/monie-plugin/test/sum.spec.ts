import { sum } from "@/index"

describe('SumTests', () => {
  describe('add', () => {
    it('should add two numbers', () => {
      expect(sum(2, 3)).toBe(5)
    })
  })
})
