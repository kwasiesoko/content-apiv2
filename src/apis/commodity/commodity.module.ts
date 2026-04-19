import { Module } from '@nestjs/common';
import { CommodityService } from './commodity.service';
import { CommodityController } from './commodity.controller';
import { DeveloperCommodityController } from './developer-commodity.controller';
import { RepositoriesModule } from '../../repositories/repository.module';
import { PlanUsageModule } from '../plan-usage/plan-usage.module';

@Module({
  imports: [RepositoriesModule, PlanUsageModule],
  controllers: [CommodityController, DeveloperCommodityController],
  providers: [CommodityService],
  exports: [CommodityService],
})
export class CommodityModule {}
