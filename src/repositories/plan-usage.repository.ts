import { FeatureType, Prisma } from "@prisma/client";
import prisma from "../common/prisma";

export class PlanUsageRepository {
  private prisma = prisma;

  async create(data: Prisma.PlanUsageUncheckedCreateInput) {
    return this.prisma.planUsage.create({
      data,
    });
  }

  async findUsage(userId: string, subscriptionId: string, feature: FeatureType) {
    return this.prisma.planUsage.findFirst({
      where: {
        userId,
        subscriptionId,
        feature,
      },
    });
  }

  async updateUsage(id: string, count: number) {
    return this.prisma.planUsage.update({
      where: { id },
      data: { count },
    });
  }

  async incrementUsage(id: string, amount: number = 1) {
    return this.prisma.planUsage.update({
      where: { id },
      data: {
        count: {
          increment: amount,
        },
      },
    });
  }

  async findBySubscriptionId(subscriptionId: string) {
    return this.prisma.planUsage.findMany({
      where: { subscriptionId },
    });
  }

  async resetSubscriptionUsage(subscriptionId: string) {
    return this.prisma.planUsage.updateMany({
      where: { subscriptionId },
      data: { count: 0 },
    });
  }
}
