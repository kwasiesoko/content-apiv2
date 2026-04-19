import prisma from '../common/prisma';

export class PlanRepository {
  private prisma = prisma;

  async findAll() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
    });
  }

  async findById(id: string) {
    return this.prisma.plan.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return this.prisma.plan.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.plan.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.plan.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getPlanByName(name: string) {
    return this.prisma.plan.findUnique({
      where: { name },
    });
  }
}
