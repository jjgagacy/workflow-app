import { introspectionFromSchema } from "graphql";
import { EntityManager } from "typeorm";

export enum TransactionPropagation {
    REQUIRED = 'REQUIRED',
    REQUIRES_NEW = 'REQUIRES_NEW',
}

export function Transactional(propagation = TransactionPropagation.REQUIRED) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            // find entityManager parameter
            const entityManagerIndex = args.findIndex(arg => arg instanceof EntityManager);
            const existingManager = entityManagerIndex > 0 ? args[entityManagerIndex] : undefined;

            const dataSource = (this as any).dataSource;
            if (!dataSource) {
                throw new Error('DataSource not found in this class');
            }

            const inTransaction = existingManager?.queryRunner?.isTransactionActives;

            // 事务传播逻辑
            if (propagation == TransactionPropagation.REQUIRED && inTransaction) {
                return original.apply(this, args);
            }

            if (propagation == TransactionPropagation.REQUIRES_NEW && inTransaction) {
                // todo not fully supported
                return original.apply(this, args);
            }

            // 开启新事务
            return dataSource.transaction(async (manager: EntityManager) => {
                // 替换或添加 EntityManager 参数
                const newArgs = [...args];
                if (entityManagerIndex > 0) {
                    newArgs[entityManagerIndex] = manager;
                } else {
                    newArgs.push(manager);
                }

                return original.apply(this, newArgs);
            });

            // 如果忘记 return 实际执行流程：
            // 1. dataSource.transaction 开始事务
            // 2. 调用 decoratedMethod，它返回 Promise<undefined>
            // 3. 事务回调接收到 undefined，认为操作完成
            // 4. 但 originalMethod 中的数据库查询还在执行！
            // 5. 事务管理器等待查询完成，但查询被"丢弃"了
            // 6. 连接超时，被数据库服务器终止
        }

        return descriptor;
    };
}
