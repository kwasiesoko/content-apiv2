import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CommodityService } from './commodity.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { UsageGuard } from '../../common/guards/usage.guard';
import { CheckUsage } from '../../common/decorators/usage.decorator';
import { FeatureType } from '@prisma/client';
import type { CommodityListQuery } from './commodity.validator';

@Controller('developers/commodities')
@UseGuards(ApiKeyGuard, UsageGuard)
export class DeveloperCommodityController {
  constructor(private readonly commodityService: CommodityService) {}

  @Get()
  @CheckUsage(FeatureType.API_CALL)
  async getCommodities(@Query() query: CommodityListQuery) {
    return this.commodityService.getCommodities(query);
  }
}
