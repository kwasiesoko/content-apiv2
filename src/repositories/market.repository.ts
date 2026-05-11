import prisma from '../common/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MarketRepository {
  private prisma = prisma;

  async findAll(params?: {
    skip?: number;
    take?: number;
    search?: string;
    name?: string;
    district?: string;
    region?: string;
    country?: string;
  }) {
    const { skip, take, search, name, district, region, country } = params || {};
    return this.prisma.market.findMany({
      skip,
      take,
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { district: { contains: search, mode: 'insensitive' as const } },
            { region: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
        ...(name && { name: { contains: name, mode: 'insensitive' as const } }),
        ...(district && { district: { contains: district, mode: 'insensitive' as const } }),
        ...(region && { region: { contains: region, mode: 'insensitive' as const } }),
        ...(country && { country: { contains: country, mode: 'insensitive' as const } }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async count(params?: {
    search?: string;
    name?: string;
    district?: string;
    region?: string;
    country?: string;
  }) {
    const { search, name, district, region, country } = params || {};
    return this.prisma.market.count({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { district: { contains: search, mode: 'insensitive' as const } },
            { region: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
        ...(name && { name: { contains: name, mode: 'insensitive' as const } }),
        ...(district && { district: { contains: district, mode: 'insensitive' as const } }),
        ...(region && { region: { contains: region, mode: 'insensitive' as const } }),
        ...(country && { country: { contains: country, mode: 'insensitive' as const } }),
      },
    });
  }

  async findById(id: string) {
    return this.prisma.market.findUnique({
      where: { id },
    });
  }

  async findByName(name: string) {
    return this.prisma.market.findFirst({
      where: { name: { equals: name, mode: 'insensitive' as const } },
    });
  }

  async getUniqueNames() {
    const markets = await this.prisma.market.findMany({
      select: { name: true },
      distinct: ['name'],
      orderBy: { name: 'asc' },
    });
    return markets.map(m => m.name);
  }
}
