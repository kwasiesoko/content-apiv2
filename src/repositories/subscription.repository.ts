import { BillingCycle, Prisma, SubscriptionStatus } from "@prisma/client";
import prisma from "../common/prisma";

export class SubscriptionRepository {
    private prisma = prisma;

    async create(data: Prisma.SubscriptionCreateInput, tx?: Prisma.TransactionClient) {
        const client = tx || this.prisma;
        return client.subscription.create({ data });
    }

    async deactivateActiveSubscriptions(userId: string, tx?: Prisma.TransactionClient) {
        const client = tx || this.prisma;
        return client.subscription.updateMany({
            where: {
                userId,
                status: 'ACTIVE',
            },
            data: {
                status: 'EXPIRED',
                updatedAt: new Date(),
            },
        });
    }

    async createSubscription(params: { userId: string; planId: string; billingInterval: BillingCycle; endDate: Date }, tx?: Prisma.TransactionClient) {
        const client = tx || this.prisma;
        return client.subscription.create({
            data: {
                userId: params.userId,
                planId: params.planId,
                billingInterval: params.billingInterval,
                endDate: params.endDate,
            },
        });
    }

    async findByUserId(userId: string, skip: number = 0, take: number = 10) {
        return this.prisma.subscription.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip,
            take,
            include: {
                plan: true,
            },
        });
    }

    async countByUserId(userId: string) {
        return this.prisma.subscription.count({
            where: { userId },
        });
    }

    async findById(id: string) {
        return this.prisma.subscription.findUnique({
            where: { id },
            include: {
                plan: true,
            },
        });
    }

    async findActiveByUserId(userId: string) {
        return this.prisma.subscription.findFirst({
            where: { userId, status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            include: {
                plan: true,
            },
        });
    }

    async updateStatus(id: string, status: SubscriptionStatus) {
        return this.prisma.subscription.update({
            where: { id },
            data: { status },
        });
    }
}