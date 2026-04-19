import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlanUsageService } from '../../apis/plan-usage/plan-usage.service';
import { FeatureType } from '@prisma/client';
import { CHECK_USAGE_KEY } from '../decorators/usage.decorator';

@Injectable()
export class UsageGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly planUsageService: PlanUsageService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<FeatureType>(CHECK_USAGE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    let subscription = request.subscription; // Provided by SubscriptionMiddleware
    const user = request.user;

    if (!user) {
      return false; // Should have been caught by an Auth Guard anyway
    }

    if (!subscription) {
      // If middleware was skipped (e.g. for developer routes), fetch it here
      subscription = await this.planUsageService.getActiveSubscription(user.id);
      request.subscription = subscription;
    }

    if (!subscription) {
      throw new ForbiddenException('No active subscription found. Access denied.');
    }

    const { plan } = subscription;
    const usage = await this.planUsageService.getUsage(user.id, subscription.id, requiredFeature);
    const currentCount = usage ? usage.count : 0;

    let limit = 0;
    switch (requiredFeature) {
      case FeatureType.API_CALL:
        limit = plan.apiLimit;
        break;
      case FeatureType.SMS:
        limit = plan.smsLimit;
        break;
      case FeatureType.MARKET_ACCESS:
        limit = plan.marketLimit;
        break;
    }

    if (currentCount >= limit) {
      throw new ForbiddenException(
        `${requiredFeature} limit reached. Your current plan allows for ${limit} ${requiredFeature.toLowerCase()}s, and you have already reached this limit. Please upgrade your plan to continue.`
      );
    }

    // Logic for tracking (incrementing) usage
    // Note: Usually, API_CALL is incremented upon request, while SMS/Market might be incremented elsewhere.
    // For now, let's increment API_CALL here to demonstrate tracking.
    if (requiredFeature === FeatureType.API_CALL) {
      await this.planUsageService.incrementApiUsage(user.id, subscription.id);
    }

    return true;
  }
}
