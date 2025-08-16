import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> | Promise<Observable<any>> {
        const isGraphQL = context.getType<'graphql' | 'http'>() === 'graphql';
        if (isGraphQL) {
            return next.handle();
        }

        return next.handle();
        // return next.handle().pipe(
        //     map((data) =>
        //         (typeof data === 'object' && data !== null && 'statusCode' in data && typeof (data as any).statusCode === 'number' && (data as any).statusCode > 0)
        //             ? data
        //             : {
        //                 statusCode: 0,
        //                 message: 'ok',
        //                 data,
        //             },
        //     ),
        // );
    }
}
