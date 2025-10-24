import { AccountStatus } from "@/account/account.enums";
import { EnumUtils } from "@/common/utils/enums";

enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    GUEST = 'guest',
    MODERATOR = 'moderator'
}

enum MixedEnum {
    NO = 0,
    YES = 'yes',
    MAYBE = 2
}

// 使用 as const 的对象
const STATUS_CONST = {
    PENDING: 'pending',
    ACTIVE: 'active',
    INACTIVE: 'inactive'
} as const;

describe('EnumUtils', () => {

    describe("GetEnumKey tests", () => {
        it('should return correct key names for numeric enums', () => {
            expect(EnumUtils.valueOf(AccountStatus, 0)).toBe('ACTIVE');
            expect(EnumUtils.valueOf(AccountStatus, 1)).toBe('BANNED');
            expect(EnumUtils.valueOf(AccountStatus, 2)).toBe('UNINITIALIZED');
            expect(EnumUtils.valueOf(AccountStatus, 3)).toBe('CLOSED');
        });

        it('should return reverse mapping for numeric enums', () => {
            expect(EnumUtils.valueOf(AccountStatus, AccountStatus.ACTIVE)).toBe('ACTIVE');
            expect(EnumUtils.valueOf(AccountStatus, AccountStatus.BANNED)).toBe('BANNED');
        });

        it('should throw error for non-existent numeric enum values', () => {
            expect(() => {
                EnumUtils.valueOf(AccountStatus, 999)
            }).toThrow('Invalid enum value: 999');
            expect(() => {
                EnumUtils.valueOf(AccountStatus, -1);
            }).toThrow('Invalid enum value: -1');
        });
    });

    describe('String enum tests', () => {
        it('should return connect key names form string enums', () => {
            expect(EnumUtils.valueOf(UserRole, 'admin')).toBe('ADMIN');
            expect(EnumUtils.valueOf(UserRole, 'user')).toBe('USER');
            expect(EnumUtils.valueOf(UserRole, 'guest')).toBe('GUEST');
            expect(EnumUtils.valueOf(UserRole, 'moderator')).toBe('MODERATOR');
        });

        it('should handle string enum values correctly', () => {
            expect(EnumUtils.valueOf(UserRole, UserRole.ADMIN)).toBe('ADMIN');
            expect(EnumUtils.valueOf(UserRole, UserRole.USER)).toBe('USER');
        });

        it('should throw error for non-exist string enum values', () => {
            expect(() => {
                EnumUtils.valueOf(UserRole, 'superadmin');
            }).toThrow('Invalid enum value: superadmin');

            expect(() => {
                EnumUtils.valueOf(UserRole, '');
            }).toThrow('Invalid enum value: ');
        });
    });

    describe('Mixed enum tests', () => {
        it('should handle mixed type enums correctly', () => {
            expect(EnumUtils.valueOf(MixedEnum, 0)).toBe('NO');
            expect(EnumUtils.valueOf(MixedEnum, 'yes')).toBe('YES');
            expect(EnumUtils.valueOf(MixedEnum, 2)).toBe('MAYBE');
        });

        it('should throw error for non-existent mixed enum values', () => {
            expect(() => {
                EnumUtils.valueOf(MixedEnum, 'no')
            }).toThrow('Invalid enum value: no');

            expect(() => {
                EnumUtils.valueOf(MixedEnum, '1')
            }).toThrow('Invalid enum value: 1');
        });
    });

    describe('Const object tests', () => {
        it('should handle as const object correctly', () => {
            expect(EnumUtils.valueOf(STATUS_CONST, 'pending')).toBe('PENDING');
            expect(EnumUtils.valueOf(STATUS_CONST, 'active')).toBe('ACTIVE');
            expect(EnumUtils.valueOf(STATUS_CONST, 'inactive')).toBe('INACTIVE');
        });

        it('should throw error for non-existent const object values', () => {
            expect(() => {
                EnumUtils.getKey(STATUS_CONST, 'expired');
            }).toThrow('Invalid enum value: expired');
        });
    });

    describe('Edge case tests', () => {
        it('should handle null and undefined enum objects', () => {
            expect(() => {
                EnumUtils.getKey(null as any, 'test');
            }).toThrow();

            expect(() => {
                EnumUtils.getKey(undefined as any, 'test');
            }).toThrow();
        });

        it('should handle empty enum objects', () => {
            const EmptyEnum = {};
            expect(() => {
                EnumUtils.getKey(EmptyEnum, 'test');
            }).toThrow('Invalid enum value: test');
        });

        it('should distinguish between similar numeric and string values', () => {
            enum TestEnum {
                ZERO = 0,
                ZERO_STR = '0'
            }

            expect(EnumUtils.getKey(TestEnum, 0)).toBe('ZERO');
            expect(EnumUtils.getKey(TestEnum, '0')).toBe('ZERO_STR');
        });
    });

    describe('getEnumKeySafe', () => {
        it('should return key name for existing values', () => {
            expect(EnumUtils.getKeySafe(AccountStatus, 0)).toBe('ACTIVE');
            expect(EnumUtils.getKeySafe(UserRole, 'admin')).toBe('ADMIN');
        });

        it('should return null for non-existent values', () => {
            expect(EnumUtils.getKeySafe(AccountStatus, 999)).toBeNull();
            expect(EnumUtils.getKeySafe(UserRole, 'nonexistent')).toBeNull();
            expect(EnumUtils.getKeySafe(STATUS_CONST, 'expired')).toBeNull();
        });

        it('should handle edge cases', () => {
            expect(EnumUtils.getKeySafe({} as any, 'test')).toBeNull();
            expect(EnumUtils.getKeySafe(null as any, 'test')).toBeNull();
        });
    });

    describe('Integration tests - Real business scenarios', () => {
        it('should be used in account status checking', () => {
            // Simulate business logic
            const getUserStatusText = (statusCode: number): string => {
                const statusKey = EnumUtils.getKeySafe(AccountStatus, statusCode);
                return statusKey ? `User status: ${statusKey}` : 'Unknown status';
            };

            expect(getUserStatusText(0)).toBe('User status: ACTIVE');
            expect(getUserStatusText(1)).toBe('User status: BANNED');
            expect(getUserStatusText(999)).toBe('Unknown status');
        });

        it('should be used in permission checking', () => {
            // Simulate permission validation
            const hasAccess = (userRole: string, requiredRole: string): boolean => {
                const roleKey = EnumUtils.getKeySafe(UserRole, userRole);
                return roleKey !== null && userRole === requiredRole;
            };

            expect(hasAccess('admin', 'admin')).toBe(true);
            expect(hasAccess('user', 'admin')).toBe(false);
            expect(hasAccess('invalid', 'admin')).toBe(false);
        });

        it('should be used in API response handling', () => {
            // Simulate API response processing
            const handleApiResponse = (response: { status: number; data: any }) => {
                const statusKey = EnumUtils.getKeySafe(AccountStatus, response.status);

                if (statusKey === 'BANNED' || statusKey === 'CLOSED') {
                    return { success: false, reason: statusKey };
                }

                return { success: true, data: response.data };
            };

            expect(handleApiResponse({ status: 1, data: null }))
                .toEqual({ success: false, reason: 'BANNED' });

            expect(handleApiResponse({ status: 0, data: { user: 'test' } }))
                .toEqual({ success: true, data: { user: 'test' } });
        });
    });
});
