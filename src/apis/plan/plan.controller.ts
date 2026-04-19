import { Controller, Get, Post, Param } from '@nestjs/common';
import { PlanService } from './plan.service';

@Controller('plans')
export class PlanController {
    constructor(private readonly planService: PlanService) { }

    @Get('')
    async getPlans() {
        return this.planService.getPlans();
    }

    @Get(':id')
    async getPlanById(@Param('id') id: string) {
        return this.planService.getPlanById(id);
    }

    @Post('')
    async seedPlans() {
        return this.planService.seedPlans();
    }
}
