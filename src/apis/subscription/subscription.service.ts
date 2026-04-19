import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { SubscriptionRepository } from '../../repositories/subscription.repository';
import { BillingCycle } from '@prisma/client';

@Injectable()
export class SubscriptionService {
    private readonly logger = new Logger(SubscriptionService.name);

    constructor(private readonly subscriptionRepository: SubscriptionRepository) { }

    async createSubscription(params: { userId: string; planId: string; billingInterval: BillingCycle; endDate: Date }) {
        return this.subscriptionRepository.createSubscription(params);
    }

    async getUserSubscriptions(userId: string, page: number = 1, limit: number = 10) {
        try {
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                this.subscriptionRepository.findByUserId(userId, skip, limit),
                this.subscriptionRepository.countByUserId(userId),
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
            this.logger.error(`Error getting subscriptions for user ${userId}`, error);
            throw new BadRequestException('Failed to get user subscriptions');
        }
    }

    async getSubscriptionById(id: string, userId: string) {
        try {
            const subscription = await this.subscriptionRepository.findById(id);
            if (!subscription || subscription.userId !== userId) {
                throw new NotFoundException(`Subscription with ID ${id} not found`);
            }
            return subscription;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`Error getting subscription ${id} for user ${userId}`, error);
            throw new BadRequestException('Failed to get subscription');
        }
    }

    calculateSubscriptionEndDate(billingCycle: BillingCycle): Date {
        const now = new Date();
        if (billingCycle === BillingCycle.ANNUAL) {
            return new Date(now.setFullYear(now.getFullYear() + 1));
        }
        return new Date(now.setMonth(now.getMonth() + 1));
    }
}
