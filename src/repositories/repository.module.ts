import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { APIKeyRepository } from './api-key.repository';

import { PlanRepository } from './plan.repository';
import { PaymentRepository } from './payment.repository';
import { SubscriptionRepository } from './subscription.repository';
import { PlanUsageRepository } from './plan-usage.repository';
import { MarketRepository } from './market.repository';
import { CommodityRepository } from './commodity.repository';

@Module({
  providers: [
    UserRepository,
    APIKeyRepository,
    PlanRepository,
    PaymentRepository,
    SubscriptionRepository,
    PlanUsageRepository,
    MarketRepository,
    CommodityRepository,
  ],
  exports: [
    UserRepository,
    APIKeyRepository,
    PlanRepository,
    PaymentRepository,
    SubscriptionRepository,
    PlanUsageRepository,
    MarketRepository,
    CommodityRepository,
  ],
})
export class RepositoriesModule {}

