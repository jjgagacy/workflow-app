import { MapUtils } from "@/common/utils/map";

describe('MapUtils e2e tests', () => {
    describe('filter methods', () => {
        it('should filter map by predicate function', () => {
            const scores = new Map<string, number>([
                ['Alice', 95],
                ['Bob', 87],
                ['Charlie', 92],
                ['David', 78]
            ]);

            const highScores = MapUtils.filter(scores, (name, score) => score > 90);

            expect(highScores.size).toBe(2);
            expect(highScores.get('Alice')).toBe(95);
            expect(highScores.get('Charlie')).toBe(92);
            expect(highScores.has('Bob')).toBe(false);
            expect(highScores.has('David')).toBe(false);
        });

        it('should process empty map', () => {
            const emptyMap = new Map<string, number>();
            const result = MapUtils.filter(emptyMap, (key, value) => value > 10);

            expect(result.size).toBe(0);
        });

        it('filter by key', () => {
            const data = new Map<string, number>([
                ['user_1', 100],
                ['admin_1', 200],
                ['user_2', 300],
                ['admin_2', 400]
            ]);

            const userOnly = MapUtils.filter(data, (key) => key.startsWith("user"));

            expect(userOnly.size).toBe(2);
            expect(userOnly.get('user_1')).toBe(100);
            expect(userOnly.get('user_2')).toBe(300);
            expect(userOnly.has('admin_1')).toBe(false);
        });
    });

    describe('map methods', () => {
        it('should transfer value of the map', () => {
            const prices = new Map<string, number>([
                ['laptop', 1000],
                ['mouse', 25],
                ['keyboard', 75]
            ]);

            const discountedPrices = MapUtils.map(prices, (price) => price * 0.9);

            expect(discountedPrices.size).toBe(3);
            expect(discountedPrices.get('laptop')).toBe(900);
            expect(discountedPrices.get('mouse')).toBeCloseTo(22.5);
            expect(discountedPrices.get('keyboard')).toBe(67.5);
        });

        it('should change value by key', () => {
            const data = new Map<number, string>([
                [1, 'apple'],
                [2, 'banana'],
                [3, 'cherry']
            ]);

            const result = MapUtils.map(data, (value, key) => `${key}: ${value}`);

            expect(result.get(1)).toBe('1: apple');
            expect(result.get(2)).toBe('2: banana');
            expect(result.get(3)).toBe('3: cherry');
        });

        it('should change value type', () => {
            const data = new Map<string, string>([
                ['a', '10'],
                ['b', '20'],
                ['c', '30']
            ]);

            const numberMap = MapUtils.map(data, (value) => parseInt(value, 10));

            expect(numberMap.get('a')).toBe(10);
            expect(numberMap.get('b')).toBe(20);
            expect(numberMap.get('c')).toBe(30);
            expect(typeof numberMap.get('a')).toBe('number');
        })
    });

    describe('toObject methods', () => {
        it('should change map to object', () => {
            const map = new Map<string, number>([
                ['width', 100],
                ['height', 200],
                ['depth', 50]
            ]);

            const obj = MapUtils.toObject(map);

            expect(obj).toEqual({
                width: 100,
                height: 200,
                depth: 50
            });
            expect(obj.width).toBe(100);
            expect(obj.height).toBe(200);
            expect(obj.depth).toBe(50);
        });

        it('should process key with number type', () => {
            const map = new Map<number, string>([
                [1, 'first'],
                [2, 'second'],
                [3, 'third']
            ]);

            const obj = MapUtils.toObject(map);

            expect(obj).toEqual({
                1: 'first',
                2: 'second',
                3: 'third'
            });
        });

        it('should process symbol key', () => {
            const sym1 = Symbol("key1");
            const sym2 = Symbol("key2");

            const map = new Map<symbol, string>([
                [sym1, 'value1'],
                [sym2, 'value2']
            ]);

            const obj = MapUtils.toObject(map);

            expect(obj[sym1]).toBe('value1');
            expect(obj[sym2]).toBe('value2');
        });

        it('should process empty map', () => {
            const emptyMap = new Map<string, number>();
            const obj = MapUtils.toObject(emptyMap);

            expect(obj).toEqual({});
        });
    });

    describe("integration test - group many methods", () => {
        it('the whole scene - user processing', () => {
            interface User {
                id: number;
                name: string;
                age: number;
                active: boolean;
            }

            const users = new Map<number, User>([
                [1, { id: 1, name: 'Alice', age: 25, active: true }],
                [2, { id: 2, name: 'Bob', age: 17, active: true }],
                [3, { id: 3, name: 'Charlie', age: 30, active: false }],
                [4, { id: 4, name: 'Diana', age: 22, active: true }],
                [5, { id: 5, name: 'Eve', age: 16, active: true }]
            ]);

            // 过滤出活跃的成年用户
            const activeAdults = MapUtils.filter(
                users,
                (id, user) => user.active && user.age >= 18
            );

            expect(activeAdults.size).toBe(2);
            expect(activeAdults.has(1)).toBe(true); // Alice
            expect(activeAdults.has(4)).toBe(true); // Diana

            // 映射为只包含名称和年龄的简单对象
            const simplifiedUsers = MapUtils.map(
                activeAdults,
                (user) => ({ name: user.name, age: user.age })
            );

            expect(simplifiedUsers.get(1)).toEqual({ name: 'Alice', age: 25 });
            expect(simplifiedUsers.get(4)).toEqual({ name: 'Diana', age: 22 });

            // 转换为对象格式用于 API 响应
            const apiResponse = MapUtils.toObject(simplifiedUsers);

            expect(apiResponse).toEqual({
                1: { name: 'Alice', age: 25 },
                4: { name: 'Diana', age: 22 }
            });
        });

        it('product stock manage', () => {
            // 产品库存数据
            const inventory = new Map<string, { stock: number, price: number }>([
                ['laptop', { stock: 10, price: 1000 }],
                ['mouse', { stock: 0, price: 25 }],
                ['keyboard', { stock: 5, price: 75 }],
                ['monitor', { stock: 3, price: 300 }],
                ['headphones', { stock: 0, price: 150 }]
            ]);

            // 过滤有库存的产品
            const availableProducts = MapUtils.filter(
                inventory,
                (name, item) => item.stock > 0
            );

            expect(availableProducts.size).toBe(3);
            expect(availableProducts.has('mouse')).toBe(false);
            expect(availableProducts.has('headphones')).toBe(false);

            // 计算每个产品的总价值 (库存 * 价格)
            const productValues = MapUtils.map(
                availableProducts,
                (item, productName) => ({
                    product: productName,
                    totalValue: item.stock * item.price,
                    inStock: item.stock,
                })
            )

            expect(productValues.get('laptop')).toEqual({
                product: 'laptop',
                totalValue: 10000,
                inStock: 10
            });

            // 转换为报表对象
            const inventoryReport = MapUtils.toObject(productValues);
            expect(Object.keys(inventoryReport)).toHaveLength(3);
            expect(inventoryReport.laptop.totalValue).toBe(10000);
            expect(inventoryReport.keyboard.totalValue).toBe(375);
        })
    });

    describe("edge cases tests", () => {
        it('should handle null and undefined values', () => {
            const map = new Map<string, string | null | undefined>([
                ['a', 'value'],
                ['b', null],
                ['c', undefined],
                ['d', 'another value']
            ]);

            const filtered = MapUtils.filter(
                map,
                (key, value) => value != null
            );

            expect(filtered.size).toBe(2);
            expect(filtered.get('a')).toBe('value');
            expect(filtered.get('d')).toBe('another value');
        })
    })
})