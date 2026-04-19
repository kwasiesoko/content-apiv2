


// commons/utils/responseUtil.ts

export interface RequestResponse<T = any> {
    statusCode: number | string;
    message: string;
    data?: T | T[];
    meta?: Record<string, any>;
}

export function generateSuccessResponse<T = any>(response: RequestResponse<T>) {
    const baseResponse: { status: number | string; message: string; data?: T | T[]; meta?: Record<string, any> } = {
        status: response.statusCode,
        message: response.message,
    };

    if (response.data !== undefined) {
        baseResponse.data = response.data;
    }

    if (response.meta) {
        baseResponse.meta = response.meta;
    }

    return baseResponse;
}