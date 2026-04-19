import { Controller, Get, Query, Param } from '@nestjs/common';
import { CommodityService } from './commodity.service';

@Controller('commodities')
export class CommodityController {
  constructor(private readonly commodityService: CommodityService) {}

  @Get()
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

  @Get('filters')
  async getFilterOptions() {
    return this.commodityService.getFilterOptions();
  }

  @Get(':id')
  async getCommodityDetails(@Param('id') id: string) {
    return this.commodityService.getCommodityDetails(id);
  }
}
