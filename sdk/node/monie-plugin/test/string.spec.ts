import { camelToSnake, deepCamelToSnake, deepSnakeToCamel, snakeToCamel } from "../src/utils/string.util";

// run: npm run test -- string
describe('String utils tests', () => {
  describe('toSnakeCase', () => {
    it('should convert simple camelCase', () => {
      expect(camelToSnake('userID')).toBe('user_id');
      expect(camelToSnake('fooBarBaz')).toBe('foo_bar_baz');
    });

    it('should handle consecutive capitals correctly', () => {
      expect(camelToSnake('userID')).toBe('user_id');
      expect(camelToSnake('HTTPServer')).toBe('http_server');
    });

    it('should handle kebab-case and spaces', () => {
      expect(camelToSnake('foo-Bar')).toBe('foo_bar');
      expect(camelToSnake('foo Bar')).toBe('foo_bar');
    });
  });

  describe('deepSnakeCase', () => {
    it('should convert nested object keys', () => {
      const input = {
        userId: 1,
        userInfo: {
          firstName: 'Alex',
          lastName: 'Chen',
        },
      };

      const output = deepCamelToSnake(input);

      expect(output).toEqual({
        user_id: 1,
        user_info: {
          first_name: 'Alex',
          last_name: 'Chen',
        },
      });
    });

    it('should convert arrays recursively', () => {
      const input = {
        items: [
          { itemId: 1 },
          { itemId: 2 },
        ],
      };

      const output = deepCamelToSnake(input);

      expect(output).toEqual({
        items: [
          { item_id: 1 },
          { item_id: 2 },
        ],
      });
    });

    it('should not transform Date instances', () => {
      const now = new Date();

      const input = {
        createdAt: now,
      };

      const output = deepCamelToSnake(input);

      expect(output.created_at).toBe(now);
      expect(output.created_at instanceof Date).toBe(true);
    });

    it('should handle null and primitive values', () => {
      const input = {
        userId: null,
        count: 10,
        active: true,
      };

      const output = deepCamelToSnake(input);

      expect(output).toEqual({
        user_id: null,
        count: 10,
        active: true,
      });
    });
  });
});


describe('toCamelCase', () => {
  describe('simple toCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      expect(snakeToCamel('user_id')).toBe('userId');
      expect(snakeToCamel('foo_bar_baz')).toBe('fooBarBaz');
    });

    it('should convert kebab-case', () => {
      expect(snakeToCamel('foo-bar')).toBe('fooBar');
    });

  });

  describe('deepCamelCase', () => {
    it('should convert nested structures', () => {
      const input = {
        user_id: 1,
        user_info: {
          first_name: 'Alex',
          last_name: 'Chen',
        },
        items: [
          { item_id: 1 },
        ],
      };

      const output = deepSnakeToCamel(input);

      expect(output).toEqual({
        userId: 1,
        userInfo: {
          firstName: 'Alex',
          lastName: 'Chen',
        },
        items: [
          { itemId: 1 },
        ],
      });
    });

    it('should preserve non-plain objects', () => {
      class TestClass {
        constructor(public value: number) { }
      }

      const instance = new TestClass(10);

      const input = {
        test_object: instance,
      };

      const output = deepSnakeToCamel(input);

      expect(output.testObject).toBe(instance);
      expect(output.testObject instanceof TestClass).toBe(true);
    });
  });
});