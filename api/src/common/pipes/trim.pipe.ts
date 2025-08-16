import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class TrimPipe implements PipeTransform {

    transform(value: any, metadata: ArgumentMetadata) {
        const { type } = metadata;
        if (type === 'body') {
            return this.trim(value);
        }
        return value;
    }

    private trim(values: any) {
        Object.keys(values).forEach(key => {
            if (key !== 'password') {
                if (this.isObj(values[key])) {
                    values[key] = this.trim(values[key]);
                } else if (typeof values[key] === 'string') {
                    values[key] = values[key].trim();
                }
            }
        });
        return values;
    }

    private isObj(obj: any): boolean {
        return typeof(obj)  === 'object' && obj !== null;
    }
}