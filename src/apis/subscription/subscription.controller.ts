import { Controller, Get, Req, Query, Param } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Controller('subscriptions')
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) { }

    @Get('')
    async getUserSubscriptions(
        @Req() request: any,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return this.subscriptionService.getUserSubscriptions(request.user.id, Number(page), Number(limit));
    }


    @Get(':id')
    async getSubscriptionById(
        @Req() request: any,
        @Param('id') id: string
    ) {
        return this.subscriptionService.getSubscriptionById(id, request.user.id);
    }
}

