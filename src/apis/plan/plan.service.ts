import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PlanRepository } from '../../repositories/plan.repository';

@Injectable()
export class PlanService {
    constructor(private readonly planRepository: PlanRepository) { }

    async getPlans() {
        try {
            return await this.planRepository.findAll();

        } catch (error) {
            console.error('Error getting plans:', error);
            throw new InternalServerErrorException('Failed to get plans');
        }
    }


    async getPlanByName(name: string) {
        try {
            return await this.planRepository.getPlanByName(name);
        } catch (error) {
            console.error('Error getting plan by name:', error);
            throw new InternalServerErrorException('Failed to get plan by name');
        }
    }

    async getPlanById(id: string) {
        try {
            const plan = await this.planRepository.findById(id);
            if (!plan) {
                throw new NotFoundException(`Plan with ID ${id} not found`);
            }
            return plan;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error getting plan by ID:', error);
            throw new InternalServerErrorException('Failed to get plan by ID');
        }
    }
    async seedPlans() {
        try {
            const plans = [
                {
                    name: 'FREE',
                    description: 'For hobbyists and small projects',
                    apiLimit: 100,
                    smsLimit: 10,
                    monthlyPrice: 0,
                    annualPrice: 0,
                },
                {
                    name: 'BASIC',
                    description: 'Perfect for growing startups',
                    apiLimit: 1000,
                    smsLimit: 100,
                    monthlyPrice: 20,
                    annualPrice: 200,
                },
                {
                    name: 'PROFESSIONAL',
                    description: 'Enterprise grade limits and support',
                    apiLimit: 10000,
                    smsLimit: 1000,
                    monthlyPrice: 100,
                    annualPrice: 1000,
                },
            ];

            const results: any[] = [];
            for (const plan of plans) {
                const existing = await this.planRepository.getPlanByName(plan.name);
                if (!existing) {
                    results.push(await this.planRepository.create(plan));
                } else {
                    results.push({ ...existing, status: 'already exists' });
                }
            }
            return results;
        } catch (error) {
            console.error('Error seeding plans:', error);
            throw new InternalServerErrorException('Failed to seed plans');
        }
    }
}
