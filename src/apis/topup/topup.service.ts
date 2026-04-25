import { Injectable, Logger } from '@nestjs/common';
import { PaymentService } from '../payment/payment.service';
import { CreateTopupPayload, TopupValidator } from './topup.validator';

@Injectable()
export class TopupService {
    private readonly logger = new Logger(TopupService.name);

    constructor(
        private readonly paymentService: PaymentService,
        private readonly topupValidator: TopupValidator,
    ) { }

    async initiateTopup(body: CreateTopupPayload, user: any) {
        try {
            const validatedBody = this.topupValidator.validateCreateTopupDto(body);
            return await this.paymentService.createTopup(validatedBody, user);
        } catch (error: any) {
            this.logger.error(`Failed to initiate topup for user ${user.id}`, error);
            throw error;
        }
    }
}
