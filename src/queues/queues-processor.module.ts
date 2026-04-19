import { Module, forwardRef } from '@nestjs/common';
import { PaymentProcessor } from './processors/payment.processor';
import { QueueProducerModule } from './processors/queue-producer.module';
import { PaymentsModule } from '../apis/payment/payment.module';

@Module({
  imports: [
    QueueProducerModule,
    forwardRef(() => PaymentsModule)
  ],
  providers: [PaymentProcessor],
  exports: [PaymentProcessor],
})
export class QueuesProcessorModule { }
