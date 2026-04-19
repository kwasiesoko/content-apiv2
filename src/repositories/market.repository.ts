import prisma from '../common/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MarketRepository {
  private prisma = prisma;

  async findAll() {
    return this.prisma.market.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.market.findUnique({
      where: { id },
    });
  }

  async findByName(name: string) {
    return this.prisma.market.findUnique({
      where: { name },
    });
  }
}
