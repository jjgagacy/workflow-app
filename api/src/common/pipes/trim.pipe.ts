import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class TrimPipe implements PipeTransform {

    transform(value: any, metadata: ArgumentMetadata) {
        const { type } = metadata;
        if (type === 'body' && this.isObject(value)) {
            return this.trim(value);
        }
        if (typeof value === 'string') {
            return value.trim();
        }
        return value;
    }

    private trim(values: any) {
        // 检查 values 是否为对象
        if (!this.isObject(values)) {
            return values;
        }
        Object.keys(values).forEach(key => {
            if (key !== 'password') {
                const currentValue = values[key];

                if (this.isObject(currentValue)) {
                    // 递归处理对象
                    values[key] = this.trim(currentValue);
                } else if (Array.isArray(currentValue)) {
                    // 处理数组
                    values[key] = this.trimArray(currentValue);
                } else if (typeof currentValue === 'string') {
                    // 处理字符串
                    values[key] = currentValue.trim();
                }
            }
        });
        return values;
    }

    private trimArray(array: any[]): any[] {
        return array.map(item => {
            if (this.isObject(item)) {
                return this.trim(item);
            } else if (Array.isArray(item)) {
                return this.trimArray(item);
            } else if (typeof item === 'string') {
                return item.trim();
            }
        });
    }

    private isObject(obj: any): boolean {
        return typeof(obj)  === 'object' && obj !== null && !Array.isArray(obj);
    }
}