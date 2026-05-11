import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { CommodityRepository } from '../../repositories/commodity.repository';
import { MarketRepository } from '../../repositories/market.repository';
import { CommodityValidator, CommodityListQuery } from './commodity.validator';

@Injectable()
export class CommodityService {
  private readonly logger = new Logger(CommodityService.name);

  constructor(
    private readonly commodityRepository: CommodityRepository,
    private readonly marketRepository: MarketRepository,
    private readonly commodityValidator: CommodityValidator,
  ) {}

  async getCommodities(query: CommodityListQuery) {
    try {
      const validatedQuery = this.commodityValidator.validateCommodityListQuery(query);
      const page = Number(validatedQuery.page) || 1;
      const limit = Number(validatedQuery.limit) || 20;
      const repositoryQuery = {
        ...validatedQuery,
        page,
        limit,
        price: validatedQuery.price === undefined ? undefined : Number(validatedQuery.price),
      };

      return this.commodityRepository.findByFilters(repositoryQuery);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error fetching commodities', error);
      throw new BadRequestException('Failed to fetch commodities');
    }
  }

  async getCommodityDetails(id: string) {
    const validatedId = this.commodityValidator.validateCommodityId(id);
    const commodity = await this.commodityRepository.findById(validatedId);
    if (!commodity) {
      throw new NotFoundException('Commodity not found');
    }
    return commodity;
  }

  async getFilterOptions() {
    const [markets, names] = await Promise.all([
      this.marketRepository.findAll(),
      this.commodityRepository.getCommodityNames(),
    ]);

    return {
      markets,
      commodityNames: names,
    };
  }
}
