import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';


@Module({
  imports: [
    BullModule.registerQueue({
      name: 'payment-queue',
    }),
  ],
  providers: [],
  exports: [BullModule.registerQueue({
    name: 'payment-queue',
  })],
})
export class QueueProducerModule { }
