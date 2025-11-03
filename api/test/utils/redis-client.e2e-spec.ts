import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { EnhanceCacheService } from '@/service/caches/enhance-cache.service';

describe('RedisClient (e2e)', () => {
    let app: INestApplication<App>;
    let cacheService: EnhanceCacheService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        cacheService = app.get<EnhanceCacheService>(EnhanceCacheService);
    });

    it('should initialize redis client', async () => {
        const redisClient = await cacheService.getRedisClient();
        expect(redisClient).toBeDefined();
    });

    it('should set ttl', async () => {
        const ttlkey = 'test:ttl:key';

        await cacheService.set(ttlkey, 'ttl_test', 2000);

        const immediateResult = await cacheService.get(ttlkey);
        expect(immediateResult).toBe('ttl_test');

        await new Promise(resolve => setTimeout(resolve, 3000));
        const expiredResult = await cacheService.get(ttlkey);
        expect(expiredResult).toBeUndefined();
    });

    describe('basic operations', () => {
        const testKey = 'test:basic:key';
        const testValue = { name: 'test', value: 123 };;

        it('shoud set and get cache', async () => {
            await cacheService.set(testKey, testValue);
            const result = await cacheService.get<typeof testValue>(testKey);
            expect(result).toEqual(testValue);
            expect(result?.name).toBe('test');
            expect(result?.value).toBe(123);
        });

        it('should set ttl', async () => {
            const ttlkey = 'test:ttl:key';

            await cacheService.set(ttlkey, 'ttl_test', 2000);

            const immediateResult = await cacheService.get(ttlkey);
            expect(immediateResult).toBe('ttl_test');

            await new Promise(resolve => setTimeout(resolve, 3000));
            const expiredResult = await cacheService.get(ttlkey);
            expect(expiredResult).toBeUndefined();
        });

        // it('should can delete cache', async () => {
        //     await cacheService.set(testKey, testValue);

        //     const beforeDelete = await cacheService.get(testKey);
        //     expect(beforeDelete).toBeDefined();

        //     const deleteResult = await cacheService.del(testKey);
        //     expect(deleteResult).toBe(true);

        //     const afterDelete = await cacheService.get(testKey);
        //     expect(afterDelete).toBeUndefined();
        // });
    });

    describe('increment operation', () => {
        const counterKey = 'test:counter';

        it('should can increment', async () => {
            await cacheService.del(counterKey);
            const result1 = await cacheService.incr(counterKey);
            expect(result1).toBe(1);

            const result2 = await cacheService.incr(counterKey, 5);
            expect(result2).toBe(6);
        });

        it('should can decrement', async () => {
            await cacheService.del(counterKey);
            // 这里不能用set，否则incr提示ERR value is not an integer or out of range
            await cacheService.incr(counterKey, 10);

            const result1 = await cacheService.incr(counterKey, -2);
            expect(result1).toBe(8);

            const result2 = await cacheService.incr(counterKey, -5);
            expect(result2).toBe(3);
        });
    });

    describe('list operation', () => {
        const listKey = 'test:list';

        beforeEach(async () => {
            await cacheService.del(listKey);
        })

        it('should add item to the list', async () => {
            const len1 = await cacheService.listPush(listKey, 'item1', 'item2');
            expect(len1).toBe(2);

            const len2 = await cacheService.listPush(listKey, 'item3');
            expect(len2).toBe(3);
        });

        it('shoud list list values', async () => {
            await cacheService.del(listKey);

            await cacheService.listPush(listKey, 'item1', 'item2', 'item3', 'item4', 'item5');

            // 获取全部
            const allItems = await cacheService.listRange(listKey);
            expect(allItems).toEqual(['item1', 'item2', 'item3', 'item4', 'item5']);

            // 获取前3个
            const firstThree = await cacheService.listRange(listKey, 0, 2);
            expect(firstThree).toEqual(['item1', 'item2', 'item3']);

            // 获取最后2个
            const lastTwo = await cacheService.listRange(listKey, -2);
            expect(lastTwo).toEqual(['item4', 'item5']);
        });

        it('should store complicate object', async () => {
            const complexItem = [
                { id: 1, name: 'test1' },
                { id: 2, name: 'test2' },
            ];

            await cacheService.listPush(listKey, ...complexItem);

            const result = await cacheService.listRange<{ id: number; name: string }>(listKey);
            expect(result).toEqual(complexItem);
        });
    });

    describe('set operation', () => {
        const setKey = 'test:set';

        beforeEach(async () => {
            await cacheService.del(setKey);
        });

        it('should add to set', async () => {
            const count1 = await cacheService.setAdd(setKey, 'member1', 'member2');
            expect(count1).toBe(2);

            const count2 = await cacheService.setAdd(setKey, 'member2', 'member3'); // member2 已存在
            expect(count2).toBe(1); // 只添加了 member3

            const count3 = await cacheService.setAdd(setKey, 'member4');
            expect(count3).toBe(1);
        });

        it('should get items from set', async () => {
            await cacheService.setAdd(setKey, 'apple', 'banana', 'orange');

            const members = await cacheService.setMembers(setKey);
            expect(members).toHaveLength(3);
            expect(members).toEqual(expect.arrayContaining(['apple', 'banana', 'orange']));
        });
    });

    describe('hash operation', () => {
        const hashKey = 'test:hash';

        beforeEach(async () => {
            await cacheService.del(hashKey);
        });

        it('should set and get hash data', async () => {
            await cacheService.hashSet(hashKey, 'name', '张三');
            await cacheService.hashSet(hashKey, 'age', 25);
            await cacheService.hashSet(hashKey, 'profile', { city: '北京', job: '工程师' });

            const name = await cacheService.hashGet<string>(hashKey, 'name');
            const age = await cacheService.hashGet<number>(hashKey, 'age');
            const profile = await cacheService.hashGet<{ city: string; job: string }>(hashKey, 'profile');

            expect(name).toBe('张三');
            expect(age).toBe(25);
            expect(profile).toEqual({ city: '北京', job: '工程师' });
        });

        it('应该返回 null 对于不存在的字段', async () => {
            const result = await cacheService.hashGet(hashKey, 'nonexistent');
            expect(result).toBeNull();
        });
    });

    describe('Sorted set operations', () => {
        const sortedSetKey = 'test:sorted_set';

        beforeEach(async () => {
            await cacheService.del(sortedSetKey);
        });

        describe('zAdd', () => {
            it('should add member to sorted set with score', async () => {
                const result = await cacheService.zAdd(sortedSetKey, 100, 'member1');
                expect(result).toBe(1);

                const score = await cacheService.zScore(sortedSetKey, 'member1');
                expect(score).toBe(100);
            });

            it('should add multiple numbers with different scores', async () => {
                const result1 = await cacheService.zAdd(sortedSetKey, 100, 'member1');
                const result2 = await cacheService.zAdd(sortedSetKey, 200, 'member2');
                const result3 = await cacheService.zAdd(sortedSetKey, 300, 'member3');

                expect(result1).toBe(1);
                expect(result2).toBe(1);
                expect(result3).toBe(1);

                const card = await cacheService.zCard(sortedSetKey);
                expect(card).toBe(3);
            });

            it('should update score for existing member', async () => {
                await cacheService.zAdd(sortedSetKey, 100, 'member1');

                await cacheService.zAdd(sortedSetKey, 300, 'member1');

                const score = await cacheService.zScore(sortedSetKey, 'member1');
                expect(score).toBe(300);
            });
        });

        describe('zCard', () => {
            it('should return 0 for non-existent key', async () => {
                const card = await cacheService.zCard('non-existing-key');
                expect(card).toBe(0);
            });

            it('should return correct number of members', async () => {
                await cacheService.zAdd(sortedSetKey, 100, 'member1');
                await cacheService.zAdd(sortedSetKey, 100, 'member2');
                await cacheService.zAdd(sortedSetKey, 100, 'member3');

                const card = await cacheService.zCard(sortedSetKey);
                expect(card).toBe(3);
            });
        });

        describe('zRemRangeByScore', () => {
            beforeEach(async () => {
                // 准备测试数据
                await cacheService.zAdd(sortedSetKey, 100, 'member1');
                await cacheService.zAdd(sortedSetKey, 200, 'member2');
                await cacheService.zAdd(sortedSetKey, 300, 'member3');
                await cacheService.zAdd(sortedSetKey, 400, 'member4');
            });

            it('should remove member by score range', async () => {
                const removedCount = await cacheService.zRemRangeByScore(sortedSetKey, 150, 350);
                expect(removedCount).toBe(2);

                const remaining = await cacheService.zRange(sortedSetKey, 0, -1);
                expect(remaining).toEqual(['member1', 'member4']);
            });

            it('should remove all members when using infinite range', async () => {
                const removedCount = await cacheService.zRemRangeByScore(sortedSetKey, '-inf', '+inf');
                expect(removedCount).toBe(4);

                const card = await cacheService.zCard(sortedSetKey);
                expect(card).toBe(0);
            });

            it('should remove members with minimum score only', async () => {
                const removedCount = await cacheService.zRemRangeByScore(sortedSetKey, '-inf', '250');
                expect(removedCount).toBe(2);

                const remaining = await cacheService.zRange(sortedSetKey, 0, -1);
                expect(remaining).toEqual(['member3', 'member4']);
            });

            it('should remove members with not included max value', async () => {
                const removedCount = await cacheService.zRemRangeByScore(sortedSetKey, '-inf', '(200');
                expect(removedCount).toBe(1);
            });
        });

        describe('zRange', () => {
            beforeEach(async () => {
                await cacheService.zAdd(sortedSetKey, 100, 'member1');
                await cacheService.zAdd(sortedSetKey, 200, 'member2');
                await cacheService.zAdd(sortedSetKey, 300, 'member3');
            });

            it('should return all members in score order', async () => {
                const members = await cacheService.zRange(sortedSetKey, 0, -1);
                expect(members).toEqual(['member1', 'member2', 'member3']);
            });

            it('should return subset of members', async () => {
                const members = await cacheService.zRange(sortedSetKey, 1, 2);
                expect(members).toEqual(['member2', 'member3']);
            });

            it('should return empty array for out of range', async () => {
                const members = await cacheService.zRange(sortedSetKey, 10, 20);
                expect(members).toEqual([]);
            });
        });

        describe('zRangeByScore', () => {
            beforeEach(async () => {
                await cacheService.zAdd(sortedSetKey, 100, 'member1');
                await cacheService.zAdd(sortedSetKey, 200, 'member2');
                await cacheService.zAdd(sortedSetKey, 300, 'member3');
                await cacheService.zAdd(sortedSetKey, 400, 'member4');
            });

            it('should return members by score range', async () => {
                const members = await cacheService.zRangeByScore(sortedSetKey, 150, 350);
                expect(members).toEqual(['member2', 'member3']);
            });

            it('should return all members with infinite range', async () => {
                const members = await cacheService.zRangeByScore(sortedSetKey, '-inf', '+inf');
                expect(members).toEqual(['member1', 'member2', 'member3', 'member4']);
            });

            it('should return empty array for non-matching range', async () => {
                const members = await cacheService.zRangeByScore(sortedSetKey, 500, 600);
                expect(members).toEqual([]);
            });
        });

        describe('zRem', () => {
            beforeEach(async () => {
                await cacheService.zAdd(sortedSetKey, 100, 'member1');
                await cacheService.zAdd(sortedSetKey, 200, 'member2');
                await cacheService.zAdd(sortedSetKey, 300, 'member3');
            });

            it('should remove single member', async () => {
                const removedCount = await cacheService.zRem(sortedSetKey, 'member2');
                expect(removedCount).toBe(1);

                const members = await cacheService.zRange(sortedSetKey, 0, -1);
                expect(members).toEqual(['member1', 'member3']);
            });

            it('should remove multiple members', async () => {
                const removedCount = await cacheService.zRem(sortedSetKey, 'member1', 'member3');
                expect(removedCount).toBe(2);

                const members = await cacheService.zRange(sortedSetKey, 0, -1);
                expect(members).toEqual(['member2']);
            });

            it('should return 0 when removing non-existent member', async () => {
                const removedCount = await cacheService.zRem(sortedSetKey, 'non_existent');
                expect(removedCount).toBe(0);
            });
        });

        describe('zScore', () => {
            beforeEach(async () => {
                await cacheService.zAdd(sortedSetKey, 250, 'member1');
            });

            it('should return correct score for member', async () => {
                const score = await cacheService.zScore(sortedSetKey, 'member1');
                expect(score).toBe(250);
            });

            it('should return null for non-existent member', async () => {
                const score = await cacheService.zScore(sortedSetKey, 'non_existent');
                expect(score).toBeNull();
            });
        });

        describe('zRank', () => {
            beforeEach(async () => {
                await cacheService.zAdd(sortedSetKey, 100, 'member1');
                await cacheService.zAdd(sortedSetKey, 200, 'member2');
                await cacheService.zAdd(sortedSetKey, 300, 'member3');
            });

            it('should return correct rank for member', async () => {
                const rank = await cacheService.zRank(sortedSetKey, 'member2');
                expect(rank).toBe(1); // 0-based index
            });

            it('should return null for non-existent member', async () => {
                const rank = await cacheService.zRank(sortedSetKey, 'non_existent');
                expect(rank).toBeNull();
            });
        });

        describe('expire', () => {
            it('should set expiration for key', async () => {
                await cacheService.zAdd(sortedSetKey, 100, 'member1');

                const result = await cacheService.expire(sortedSetKey, 2); // 2秒过期
                expect(result).toBe(1);
                // 等待过期
                await new Promise(resolve => setTimeout(resolve, 2500));

                const card = await cacheService.zCard(sortedSetKey);
                expect(card).toBe(0);
            }, 5000); // 设置更长的超时时间

            it('should return false for non-existent key', async () => {
                const result = await cacheService.expire('non_existent_key', 10);
                expect(result).toBe(0);
            });
        });

    });

    afterAll(async () => {
        await app.close();
    });

    // describe('publish operation', () => {
    //     const testChannel = 'test:channel';

    //     it('should publish message', async () => {
    //         const message = { type: 'test', data: 'Hello Redis' };

    //         const result = await cacheService.publish(testChannel, message);

    //         // publish 返回接收到消息的客户端数量
    //         // 在测试环境中可能为 0（没有订阅者）
    //         expect(typeof result).toBe('number');
    //     });
    // });

});
