import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { RepositoriesModule } from '../../repositories/repository.module';

@Module({
  imports: [RepositoriesModule],
  providers: [SubscriptionService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService]
})
export class SubscriptionModule { }
