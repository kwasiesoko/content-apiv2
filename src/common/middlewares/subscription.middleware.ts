import {
  Injectable,
  Logger,
  NestMiddleware,
  ForbiddenException,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { SubscriptionRepository } from '../../repositories/subscription.repository';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SubscriptionMiddleware.name);

  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) { }

  async use(request: any, response: Response, next: NextFunction) {
    const user = request.user;
    if (!user) {
      // UserMiddleware should have attached the user by now
      return next();
    }

    try {
      const activeSubscription = await this.subscriptionRepository.findActiveByUserId(user.id);

      if (!activeSubscription) {
        // You might want to allow access if no subscription is required for this route
        // But for now, let's just log it
        this.logger.log(`User ${user.id} has no active subscription`);
        throw new ForbiddenException('You have no active subscription.');
      }

      const now = new Date();
      if (activeSubscription.endDate < now) {
        this.logger.log(`Subscription ${activeSubscription.id} for user ${user.id} has expired`);
        // Auto-expire the subscription in the database
        await this.subscriptionRepository.updateStatus(activeSubscription.id, SubscriptionStatus.EXPIRED);
        // Optionally block access
        throw new ForbiddenException('Your subscription has expired. Please renew to continue.');

      }

      request.subscription = activeSubscription;
      next();
    } catch (error) {
      this.logger.error(`Error checking subscription for user ${user.id}`, error);
      throw new ForbiddenException('You have no active subscription.');
      // next();
    }
  }
}
