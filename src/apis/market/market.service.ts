import { Injectable } from '@nestjs/common';
import { MarketRepository } from '../../repositories/market.repository';
import { MarketValidator, MarketListQuery } from './market.validator';

@Injectable()
export class MarketService {
  constructor(
    private readonly marketRepository: MarketRepository,
    private readonly marketValidator: MarketValidator,
  ) {}

  async getMarkets(query: MarketListQuery) {
    const validatedQuery = this.marketValidator.validateMarketListQuery(query);
    const page = Number(validatedQuery.page);
    const limit = Number(validatedQuery.limit);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.marketRepository.findAll({
        ...validatedQuery,
        skip,
        take: limit,
      }),
      this.marketRepository.count(validatedQuery),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUniqueMarketNames() {
    return this.marketRepository.getUniqueNames();
  }

  async getMarketById(id: string) {
    return this.marketRepository.findById(id);
  }
}
