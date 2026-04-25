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
  marketName?: string;
  marketDistrict?: string;
  marketRegion?: string;
  marketCountry?: string;
  startDate?: string;
  endDate?: string;
};

export type CommodityListResult = {
  data: Awaited<ReturnType<typeof prisma.commodity.findMany>>;
  total: number;
};

@Injectable()
export class CommodityRepository {
  private prisma = prisma;

  private buildWhere(query: CommodityListQuery): Prisma.CommodityWhereInput {
    return {
      ...(query.name && { name: { contains: query.name, mode: 'insensitive' } }),
      ...(query.price !== undefined && { price: Number(query.price) }),
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

    return { data, total };
  }
}
