import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TransactionStatus } from '../../common/enums/paystack-status.enum'
import * as crypto from 'crypto';


@Injectable()
export class PaystackService {
    private readonly logger = new Logger(PaystackService.name);

    constructor(private configService: ConfigService) { }

    private get headers() {
        return {
            Authorization: `Bearer ${this.configService.getOrThrow("PAYSTACK_SECRET_KEY")}`,
            'Content-Type': 'application/json',
        };
    }

    async initializePayment(email: string, amount: number, reference: string) {
        try {
            const response = await axios.post(
                `${this.configService.getOrThrow("PAYSTACK_BASE_URL")}/transaction/initialize`,
                { email, amount, reference, callback_url: this.configService.getOrThrow("PAYSTACK_CALL_BACK_URL") },
                { headers: this.headers },
            );
            return response.data;
        } catch (error: any) {
            this.logger.error('Error initializing payment', error.response?.data || error.message);
            throw new HttpException(
                error.response?.data || 'Error initializing payment',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


    async verifyPayment(reference: string) {
        try {
            const response = await axios.get(
                `${this.configService.getOrThrow("PAYSTACK_BASE_URL")}/transaction/verify/${reference}`,
                { headers: this.headers },
            );
            return response.data;
        } catch (error: any) {
            this.logger.error('Error verifying payment', error.response?.data || error.message);
            throw new HttpException(
                error.response?.data || 'Error verifying payment',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }



    mapPaystackStatus(transactionStatus: string): string {
        const failedStatuses = ['failed', 'abandoned'];
        switch (transactionStatus) {
            case 'success':
                return TransactionStatus.COMPLETED;
            case 'pending':
                return TransactionStatus.PENDING;
            default:
                if (failedStatuses.includes(transactionStatus)) return TransactionStatus.FAILED;
                // Unknown status – log or handle explicitly
                console.warn('Unknown Paystack status:', transactionStatus);
                return TransactionStatus.PENDING; // or TransactionStatus.UNKNOWN
        }
    }


    verifyPaystackSignature(payload: any, signature: string) {
        const secret = process.env.PAYSTACK_SECRET_KEY!;
        const hash = crypto
            .createHmac('sha512', secret)
            .update(JSON.stringify(payload))
            .digest('hex');

        return hash === signature;
    }
}

