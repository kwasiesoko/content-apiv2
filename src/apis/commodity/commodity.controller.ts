import { Controller, Get, Query, Param } from '@nestjs/common';
import { CommodityService } from './commodity.service';
import type { CommodityListQuery } from './commodity.validator';

@Controller('commodities')
export class CommodityController {
  constructor(private readonly commodityService: CommodityService) {}

  @Get()
  async getCommodities(@Query() query: CommodityListQuery) {
    return this.commodityService.getCommodities(query);
  }

  @Get('filters')
  async getFilterOptions() {
    return this.commodityService.getFilterOptions();
  }

  @Get(':id')
  async getCommodityDetails(@Param('id') id: string) {
    return this.commodityService.getCommodityDetails(id);
  }
}
