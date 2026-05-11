import { Controller, Get, Query, Param } from '@nestjs/common';
import { MarketService } from './market.service';
import type { MarketListQuery } from './market.validator';

@Controller('markets')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get()
  async getMarkets(@Query() query: MarketListQuery) {
    return this.marketService.getMarkets(query);
  }

  @Get('unique')
  async getUniqueMarketNames() {
    return this.marketService.getUniqueMarketNames();
  }

  @Get(':id')
  async getMarketById(@Param('id') id: string) {
    return this.marketService.getMarketById(id);
  }
}
