import prisma from '../common/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export type CommodityListQuery = {
  page?: number;
  limit?: number;
  name?: string;
  price?: number;
  measure?: string;
  type?: string;
  marketId?: string;
  marketIds?: string | string[];
  markets?: string | string[];
  marketDistrict?: string;
  marketRegion?: string;
  marketCountry?: string;
  startDate?: string;
  endDate?: string;
};

export type CommodityListResult = {
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

@Injectable()
export class CommodityRepository {
  private prisma = prisma;

  private buildWhere(query: CommodityListQuery): Prisma.CommodityWhereInput {
    const parse = (val: any) => {
      if (!val) return undefined;
      const arr = Array.isArray(val) ? val : String(val).split(',').map(v => v.trim()).filter(Boolean);
      return arr.length > 0 ? arr : undefined;
    };

    const marketIds = parse(query.marketIds);
    const markets = parse(query.markets);

    return {
      ...(query.name && { name: { contains: query.name, mode: 'insensitive' as const } }),
      ...(query.price !== undefined && { price: Number(query.price) }),
      ...(query.measure && { measure: { contains: query.measure, mode: 'insensitive' as const } }),
      ...(query.type && { type: { contains: query.type, mode: 'insensitive' as const } }),
      ...(marketIds ? { marketId: { in: marketIds } } : query.marketId && { marketId: query.marketId }),
      ...((markets || query.marketDistrict || query.marketRegion || query.marketCountry) && {
        market: {
          AND: [
            ...(markets ? [{ OR: markets.map(n => ({ name: { equals: n, mode: 'insensitive' as const } })) }] : []),
            ...(query.marketDistrict ? [{ district: { contains: query.marketDistrict, mode: 'insensitive' as const } }] : []),
            ...(query.marketRegion ? [{ region: { contains: query.marketRegion, mode: 'insensitive' as const } }] : []),
            ...(query.marketCountry ? [{ country: { contains: query.marketCountry, mode: 'insensitive' as const } }] : []),
          ]
        }
      }),
      ...((query.startDate || query.endDate) && {
        collectedDate: {
          ...(query.startDate && { gte: new Date(query.startDate) }),
          ...(query.endDate && { lte: new Date(query.endDate) }),
        },
      }),
    } as Prisma.CommodityWhereInput;
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CommodityWhereInput;
    orderBy?: Prisma.CommodityOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.commodity.findMany({
      skip,
      take,
      where,
      orderBy: orderBy || { collectedDate: 'desc' },
      include: {
        market: true,
      },
    });
  }

  async count(where?: Prisma.CommodityWhereInput) {
    return this.prisma.commodity.count({ where });
  }

  async findById(id: string) {
    return this.prisma.commodity.findUnique({
      where: { id },
      include: {
        market: true,
      },
    });
  }

  async getCommodityNames() {
    const commodities = await this.prisma.commodity.findMany({
      select: { name: true },
      distinct: ['name'],
      orderBy: { name: 'asc' },
    });
    return commodities.map(c => c.name);
  }

  async findByFilters(query: CommodityListQuery): Promise<CommodityListResult> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const where = this.buildWhere(query);

    const [data, total] = await Promise.all([
      this.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
      }),
      this.count(where),
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
}
