import prisma from '../common/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class CommodityRepository {
  private prisma = prisma;

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
}
