import { deserializeCustom, serializeCustom } from "@/config/keyv.config";

describe('Serialize and Deserialize', () => {
    it('should handle date object', () => {
        // 准备测试数据
        const originalData = {
            id: 1,
            name: '测试用户',
            createdAt: new Date('2023-01-01T00:00:00.000Z'),
            updatedAt: new Date('2023-12-31T23:59:59.999Z'),
            profile: {
                birthDate: new Date('1990-05-15T00:00:00.000Z'),
                lastLogin: new Date('2023-12-25T10:30:00.000Z')
            },
            tags: ['user', 'vip'],
            settings: {
                notifications: true,
                theme: 'dark',
                createdAt: new Date('2023-06-01T12:00:00.000Z')
            }
        };

        const serialized = serializeCustom(originalData);
        const deserialized = deserializeCustom(serialized);

        // 验证结果
        expect(deserialized.id).toBe(originalData.id);
        expect(deserialized.name).toBe(originalData.name);
        expect(deserialized.tags).toEqual(originalData.tags);

        // 验证 Date 对象被正确恢复
        expect(deserialized.createdAt).toBeInstanceOf(Date);
        expect(deserialized.createdAt.toISOString()).toBe(originalData.createdAt.toISOString());

        expect(deserialized.updatedAt).toBeInstanceOf(Date);
        expect(deserialized.updatedAt.toISOString()).toBe(originalData.updatedAt.toISOString());

        expect(deserialized.profile.birthDate).toBeInstanceOf(Date);
        expect(deserialized.profile.birthDate.toISOString()).toBe(originalData.profile.birthDate.toISOString());

        expect(deserialized.settings.createdAt).toBeInstanceOf(Date);
        expect(deserialized.settings.createdAt.toISOString()).toBe(originalData.settings.createdAt.toISOString());
    });
});