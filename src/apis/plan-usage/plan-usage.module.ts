import { Module } from '@nestjs/common';
import { PlanUsageService } from './plan-usage.service';
import { PlanUsageController } from './plan-usage.controller';
import { RepositoriesModule } from '../../repositories/repository.module';

@Module({
    imports: [RepositoriesModule],
    providers: [PlanUsageService],
    controllers: [PlanUsageController],
    exports: [PlanUsageService]
})
export class PlanUsageModule { }
