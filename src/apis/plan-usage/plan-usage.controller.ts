import { Controller, Get, Param, Req } from '@nestjs/common';
import { PlanUsageService } from './plan-usage.service';

@Controller('plan-usage')
export class PlanUsageController {
    constructor(private readonly planUsageService: PlanUsageService) { }

    @Get('subscription/:id')
    getSubscriptionUsage(@Param('id') subscriptionId: string) {
        return this.planUsageService.getSubscriptionUsage(subscriptionId);
    }
}
