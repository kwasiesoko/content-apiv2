import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class TopupService {
    private readonly logger = new Logger(TopupService.name);

    constructor(private readonly paymentService: PaymentService) { }

    async initiateTopup(body: any, user: any) {
        try {
            return await this.paymentService.createTopup(body, user);
        } catch (error: any) {
            this.logger.error(`Failed to initiate topup for user ${user.id}`, error);
            throw error;
        }
    }
}
