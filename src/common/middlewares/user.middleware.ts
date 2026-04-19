import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { AuthenticationService } from '../../helpers/authentication';
import { BillingCycle, UserType } from '@prisma/client';
import { UserRepository } from '../../repositories/user.repository';
import { ConfigService } from '@nestjs/config';
import { PlanRepository } from '../../repositories/plan.repository';
import { SubscriptionService } from '../../apis/subscription/subscription.service';


@Injectable()
export class UserMiddleware implements NestMiddleware {
  private readonly logger = new Logger(UserMiddleware.name);

  constructor(
    private readonly authenticateUser: AuthenticationService,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly planRepository: PlanRepository,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async use(request: any, response: Response, next: NextFunction) {
    const authHeader = request.headers['authorization'] as string | undefined;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    try {
      let userDetails: any;
      try {
        userDetails = await this.authenticateUser.authenticateUser(authHeader);
      } catch (error: any) {
        this.logger.error(
          'Error during SSO authentication',
          error.response?.data ?? error,
        );
        throw new UnauthorizedException('Invalid or expired token');
      }

      if (!userDetails || !userDetails.user_id) {
        this.logger.warn('SSO response missing user identifier');
        throw new UnauthorizedException(
          'You are not authorized to perform this action',
        );
      }

      const authenticatedUser = {
        ssoUserId: userDetails.user_id,
        email: userDetails.email,
        firstName: userDetails.first_name,
        lastName: userDetails.last_name,
        phoneNumber: userDetails.msisdn,
        userType: userDetails.role === 'admin' ? UserType.ADMIN : UserType.CLIENT,
        preferredLanguage: userDetails.preferred_language || 'en',
      };

      request.user = await this.saveOrUpdateUser(authenticatedUser);
      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Unexpected error in UserMiddleware', error);
      // We throw InternalServerError here if the user sync is critical for the rest of the application
      throw new UnauthorizedException('Authentication synchronization failed');
    }
  }

  private async saveOrUpdateUser(authenticatedUser: any) {
    try {
      const existingUser = await this.userRepository.retrieveUser(
        authenticatedUser.ssoUserId,
      );

      if (existingUser) {
        await this.userRepository.updateUser(existingUser.id, {
          preferredLanguage:
            authenticatedUser.preferredLanguage || existingUser.preferredLanguage,
          firstName: authenticatedUser.firstName,
          lastName: authenticatedUser.lastName,
        });
        return existingUser;
      }

      // Save New User
      const newUser = await this.userRepository.saveUser({
        preferredLanguage: authenticatedUser.preferredLanguage,
        firstName: authenticatedUser.firstName,
        lastName: authenticatedUser.lastName,
        email: authenticatedUser.email,
        phoneNumber: authenticatedUser.phoneNumber,
        ssoUserId: authenticatedUser.ssoUserId,
        userType: authenticatedUser.userType,
      });

      // Handle Default Plan Subscription
      await this.assignDefaultPlan(newUser);

      return newUser;
    } catch (error) {
      this.logger.error('Database error during user synchronization', error);
      throw error;
    }
  }

  private async assignDefaultPlan(user: any) {
    try {
      const defaultPlanName = this.configService.get<string>('DEFAULT_PLAN');
      if (!defaultPlanName) return;

      const plan = await this.planRepository.getPlanByName(defaultPlanName);
      if (!plan) {
        this.logger.warn(`Default plan '${defaultPlanName}' not found in database.`);
        return;
      }

      const billingInterval = BillingCycle.MONTHLY;
      const endDate = this.subscriptionService.calculateSubscriptionEndDate(billingInterval);

      await this.subscriptionService.createSubscription({
        userId: user.id,
        planId: plan.id,
        billingInterval,
        endDate,
      });
      this.logger.log(`Assigned default plan '${defaultPlanName}' to new user ${user.id}`);
    } catch (error) {
      this.logger.error(`Failed to assign default plan to user ${user.id}`, error);
      // Non-blocking error for subscription assignment
    }
  }
}
