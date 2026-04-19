import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { RepositoriesModule } from '../../repositories/repository.module';

@Module({
  imports: [RepositoriesModule],
  providers: [PlanService],
  controllers: [PlanController]
})
export class PlanModule { }
