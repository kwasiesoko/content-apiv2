import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PaymentService } from '../../apis/payment/payment.service';

@Processor('payment-queue')
export class PaymentProcessor {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(private readonly paymentService: PaymentService) { }

  @Process('process-payment')
  async handleProcessPayment(job: Job<{ reference: string; userId: string; paymentType: string; authorization?: string }>) {
    const { reference, userId, paymentType, authorization } = job.data;
    this.logger.log(`Processing payment job for reference: ${reference}, userId: ${userId}`);

    try {
      await this.paymentService.processPayment(reference, userId, paymentType, authorization);
      this.logger.log(`Finished processing payment: ${reference}`);
    } catch (error: any) {
      this.logger.error(`Error processing payment ${reference}`, error.stack);
      throw error; // Bull will retry automatically based on job options
    }
  }
}
