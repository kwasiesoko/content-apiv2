import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PlanUsageRepository } from '../../repositories/plan-usage.repository';
import { SubscriptionRepository } from '../../repositories/subscription.repository';
import { FeatureType } from '@prisma/client';

@Injectable()
export class PlanUsageService {
    private readonly logger = new Logger(PlanUsageService.name);

    constructor(
        private readonly planUsageRepository: PlanUsageRepository,
        private readonly subscriptionRepository: SubscriptionRepository
    ) { }

    async incrementApiUsage(userId: string, subscriptionId: string) {
        try {
            const usage = await this.planUsageRepository.findUsage(userId, subscriptionId, FeatureType.API_CALL);
            if (usage) {
                return await this.planUsageRepository.incrementUsage(usage.id, 1);
            }
            return await this.planUsageRepository.create({
                userId,
                subscriptionId,
                feature: FeatureType.API_CALL,
                count: 1,
            });
        } catch (error: any) {
            this.logger.error(`Failed to increment API usage for user ${userId}`, error);
            throw new BadRequestException('Failed to track API usage');
        }
    }

    async incrementSmsUsage(userId: string, subscriptionId: string) {
        try {
            const usage = await this.planUsageRepository.findUsage(userId, subscriptionId, FeatureType.SMS);
            if (usage) {
                return await this.planUsageRepository.incrementUsage(usage.id, 1);
            }
            return await this.planUsageRepository.create({
                userId,
                subscriptionId,
                feature: FeatureType.SMS,
                count: 1,
            });
        } catch (error: any) {
            this.logger.error(`Failed to increment SMS usage for user ${userId}`, error);
            throw new BadRequestException('Failed to track SMS usage');
        }
    }

    async incrementMarketUsage(userId: string, subscriptionId: string, marketsCount: number = 1) {
        try {
            const subscription = await this.subscriptionRepository.findById(subscriptionId);
            if (!subscription) {
                throw new BadRequestException('Subscription not found');
            }

            const usage = await this.planUsageRepository.findUsage(userId, subscriptionId, FeatureType.MARKET_ACCESS);
            const currentCount = usage ? usage.count : 0;

            if (currentCount + marketsCount > subscription.plan.marketLimit) {
                throw new BadRequestException(`Market limit exceeded. Your plan allows up to ${subscription.plan.marketLimit} markets.`);
            }

            if (usage) {
                return await this.planUsageRepository.incrementUsage(usage.id, marketsCount);
            }
            return await this.planUsageRepository.create({
                userId,
                subscriptionId,
                feature: FeatureType.MARKET_ACCESS,
                count: marketsCount,
            });
        } catch (error: any) {
            if (error instanceof BadRequestException) throw error;
            this.logger.error(`Failed to increment market usage for user ${userId}`, error);
            throw new BadRequestException('Failed to track market usage');
        }
    }

    async getUsage(userId: string, subscriptionId: string, feature: FeatureType) {
        return this.planUsageRepository.findUsage(userId, subscriptionId, feature);
    }

    async getSubscriptionUsage(subscriptionId: string) {
        return this.planUsageRepository.findBySubscriptionId(subscriptionId);
    }

    async getActiveSubscription(userId: string) {
        return this.subscriptionRepository.findActiveByUserId(userId);
    }
}
