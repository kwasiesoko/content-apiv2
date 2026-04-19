import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CommodityRepository } from '../../repositories/commodity.repository';
import { MarketRepository } from '../../repositories/market.repository';
import { Prisma } from '@prisma/client';

@Injectable()
export class CommodityService {
  private readonly logger = new Logger(CommodityService.name);

  constructor(
    private readonly commodityRepository: CommodityRepository,
    private readonly marketRepository: MarketRepository,
  ) {}

  async getCommodities(query: {
    page?: number;
    limit?: number;
    name?: string;
    price?: number;
    measure?: string;
    type?: string;
    marketId?: string;
    marketName?: string;
    marketDistrict?: string;
    marketRegion?: string;
    marketCountry?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 20;

      const where: Prisma.CommodityWhereInput = {
        ...(query.name && { name: { contains: query.name, mode: 'insensitive' } }),
        ...(query.price && { price: Number(query.price) }),
        ...(query.measure && { measure: { contains: query.measure, mode: 'insensitive' } }),
        ...(query.type && { type: { contains: query.type, mode: 'insensitive' } }),
        ...(query.marketId && { marketId: query.marketId }),
        ...((query.marketName || query.marketDistrict || query.marketRegion || query.marketCountry) && {
          market: {
            ...(query.marketName && { name: { contains: query.marketName, mode: 'insensitive' } }),
            ...(query.marketDistrict && { district: { contains: query.marketDistrict, mode: 'insensitive' } }),
            ...(query.marketRegion && { region: { contains: query.marketRegion, mode: 'insensitive' } }),
            ...(query.marketCountry && { country: { contains: query.marketCountry, mode: 'insensitive' } }),
          },
        }),
        ...((query.startDate || query.endDate) && {
          collectedDate: {
            ...(query.startDate && { gte: new Date(query.startDate) }),
            ...(query.endDate && { lte: new Date(query.endDate) }),
          },
        }),
      };

      const [data, total] = await Promise.all([
        this.commodityRepository.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where,
        }),
        this.commodityRepository.count(where),
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
    } catch (error) {
      this.logger.error('Error fetching commodities', error);
      throw new BadRequestException('Failed to fetch commodities');
    }
  }

  async getCommodityDetails(id: string) {
    const commodity = await this.commodityRepository.findById(id);
    if (!commodity) {
      throw new BadRequestException('Commodity not found');
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
