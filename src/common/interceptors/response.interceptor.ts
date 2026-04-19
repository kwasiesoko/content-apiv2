/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { generateSuccessResponse } from '../../utils/response-utils';

type SuccessResponse<T = any> = {
    status: number | string;
    message: string;
    data?: T | T[];
    meta?: Record<string, any>;
};

@Injectable()
export class ResponseInterceptor<T>
    implements NestInterceptor<T, SuccessResponse<T>> {
    constructor(private reflector: Reflector) { }
    private message = "success"


    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<SuccessResponse<T>> {
        const response = context.switchToHttp().getResponse();
        const request = context.switchToHttp().getRequest();

        const statusCode = response.statusCode || HttpStatus.OK;

        const defaultMap = (result: any): SuccessResponse<T> => {
            // const message =
            //     this.reflector.get<string>('response_message', context.getHandler()) ||
            //     'Request successful';


            // if result has data and meta, spread them separately
            if (result instanceof Object && 'data' in result && 'meta' in result) {
                return generateSuccessResponse({
                    statusCode,
                    message: this.message,
                    data: result.data,
                    meta: result.meta,
                });
            }

            return generateSuccessResponse({ statusCode, message: this.message, data: result });
        };

        return next.handle().pipe(
            map((data) => {
                if (data instanceof Object && 'data' in data && 'message' in data) {
                    if ('success' in data && 'status' in data) {
                        return data; // Already correctly formatted
                    }
                    
                    // Normalize known patterns (e.g. Paystack format {status: boolean, message, data})
                    return generateSuccessResponse({
                        statusCode: response.statusCode || HttpStatus.OK,
                        message: data.message || this.message,
                        data: data.data,
                        meta: data.meta
                    });
                }
                return defaultMap(data);
            }),
        );
    }
}
