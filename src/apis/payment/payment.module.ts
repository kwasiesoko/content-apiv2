import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { RepositoriesModule } from '../../repositories/repository.module';
import { PaystackModule } from '../paystack/paystack.module';
import { QueueProducerModule } from "../../queues/processors/queue-producer.module"
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [RepositoriesModule, PaystackModule, QueueProducerModule, SubscriptionModule],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService]
})
export class PaymentsModule { }
