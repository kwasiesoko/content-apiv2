import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CommodityService } from './commodity.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { UsageGuard } from '../../common/guards/usage.guard';
import { CheckUsage } from '../../common/decorators/usage.decorator';
import { FeatureType } from '@prisma/client';

@Controller('developers/commodities')
@UseGuards(ApiKeyGuard, UsageGuard)
export class DeveloperCommodityController {
  constructor(private readonly commodityService: CommodityService) {}

  @Get()
  @CheckUsage(FeatureType.API_CALL)
  async getCommodities(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('name') name?: string,
    @Query('price') price?: number,
    @Query('measure') measure?: string,
    @Query('type') type?: string,
    @Query('marketId') marketId?: string,
    @Query('marketName') marketName?: string,
    @Query('marketDistrict') marketDistrict?: string,
    @Query('marketRegion') marketRegion?: string,
    @Query('marketCountry') marketCountry?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.commodityService.getCommodities({
      page,
      limit,
      name,
      price,
      measure,
      type,
      marketId,
      marketName,
      marketDistrict,
      marketRegion,
      marketCountry,
      startDate,
      endDate,
    });
  }
}
