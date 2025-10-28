import 'reflect-metadata';
import { globalModuleRef } from "@/common/modules/global";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";

export interface ServiceCacheOptions {
    key?: string | ((...args: any[]) => string);
    ttl?: number;
    useArgs?: boolean;
    enabled?: boolean | ((...args: any[]) => boolean);
    skipCache?: (...args: any[]) => boolean;
}

function isClass(target: any): boolean {
    return typeof target === 'function' && target.prototype && target.prototype.constructor === target;
}

function generateArgsHash(args: any[]): string {
    try {
        const argsString = JSON.stringify(args, (key, value) => {
            if (value instanceof Date) {
                return `data:${value.toISOString()}`;
            }
            if (value === undefined) {
                return 'undefined';
            }
            return value;
        });
        return Buffer.from(argsString).toString('base64');
    } catch {
        // 如果序列化失败，使用简单哈希
        return `args_${args.length}_${Date.now().toString(36)}`;
    }
}

function getClassName(target: any): string {
    if (isClass(target)) {
        return target.name; // 静态方法：直接取类名
    } else {
        return target.constructor.name; // 实例方法：通过 constructor 取类名
    }
}

/**
 * Gets parameter names of a method (requires reflect-metadata)
 */
function getParameterNames(target: any, propertyKey: string | symbol): string[] {
    try {
        // Get design:paramtypes metadata
        const paramTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
        return paramTypes ? Array(paramTypes.length).fill('').map((_, i) => `param${i}`) : [];
    } catch (error) {
        return [];
    }
}

/**
 * Gets effective arguments considering default parameter values
 */
function getEffectiveArguments(target: any, propertyKey: string | symbol, receivedArgs: any[]): any[] {
    try {
        // Get parameter names from method
        const paramNames = getParameterNames(target, propertyKey);

        // If no parameters or no received args, return empty
        if (paramNames.length === 0) {
            return receivedArgs;
        }

        // For methods with default parameters but no arguments passed,
        // we might want to include information about default parameters
        if (receivedArgs.length < paramNames.length) {
            const effectiveArgs = [...receivedArgs];
            // Get default values (this requires custom metadata to be set)
            const defaultValues = Reflect.getMetadata('custom:defaultvalues', target, propertyKey) || [];
            // fill missing arguments with default values
            for (let i = receivedArgs.length; i < paramNames.length; i++) {
                if (i < defaultValues.length) {
                    effectiveArgs.push(defaultValues[i]);
                } else {
                    effectiveArgs.push(undefined);
                }
            }
            return effectiveArgs;
        }

        return receivedArgs;
    } catch (error) {
        console.warn('Failed to get parameter information, using received arguments:', error);
        return receivedArgs;
    }
}

function generateCacheKey(className: string, methodName: string, args: any[], options?: any): string {
    const config: ServiceCacheOptions = typeof options === 'string'
        ? { key: options, ttl: 60, useArgs: true }
        : { ttl: 60, useArgs: true, ...options };

    if (typeof config.key === 'function') {
        return config.key.apply(this, args);
    } else if (config.key) {
        let key = config.key;
        if (config.useArgs) {
            const argsHash = generateArgsHash(args);
            key += `:${argsHash}`;
        }
        return key;
    } else {
        const argsHash = config.useArgs && args.length > 0 ? `:${generateArgsHash(args)}` : '';
        return `service:${className}:${methodName}${argsHash}`;
    }
}

async function getCacheManager(): Promise<Cache> {
    if (!globalModuleRef) {
        throw new Error('globalModuleRef unintialize');
    }
    return globalModuleRef.get(CACHE_MANAGER);
}

function getTTL(options: any): number {
    const config = typeof options === 'string' ? { ttl: 60 } : { ttl: 60, ...options };
    return config.ttl;
}

export function ServiceCache(options?: ServiceCacheOptions | string): MethodDecorator {
    const injectCache = Inject(CACHE_MANAGER); // 创建注入装饰器

    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const isStatic = isClass(target);

        if (!isStatic) {
            injectCache(target, 'cacheManager'); // 手动应用注入装饰器
        }

        const original = descriptor.value;
        const methodName = String(propertyKey);
        const className = getClassName(target);

        descriptor.value = async function (...args: any[]) {
            let cacheManager: Cache;

            if (isStatic) {
                cacheManager = await getCacheManager();
            } else {
                cacheManager = this.cacheManager;
            }
            const effectiveArgs = getEffectiveArguments(target, propertyKey, args);
            const cacheKey = generateCacheKey(className, methodName, effectiveArgs, options);
            // console.log('key', cacheKey);

            try {
                const cacheValue = await cacheManager.get(cacheKey);
                if (cacheValue !== undefined && cacheValue !== null) {
                    // console.log(`Cache hit for key: ${cacheKey}`);
                    return cacheValue;
                }
            } catch (error) {
                console.warn(`Failed to get cache for key ${cacheKey}:`, error);
            }

            const result = await original.apply(this, args);

            if (result !== undefined && result !== null) {
                try {
                    const ttl = getTTL(options);
                    await cacheManager.set(cacheKey, result, ttl);
                } catch (error) {
                    console.warn(`Failed to set cache for key ${cacheKey}:`, error);
                }
            }
            return result;
        }

        return descriptor;
    }
}

export function DefaultValues(...defaultValues: any[]): MethodDecorator {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        // Store default values as metadata
        Reflect.defineMetadata('custom:defaultvalues', defaultValues, target, propertyKey);
        return descriptor;
    };
}
