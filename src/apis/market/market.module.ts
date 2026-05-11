import { Module } from '@nestjs/common';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { MarketValidator } from './market.validator';
import { RepositoriesModule } from '../../repositories/repository.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [MarketController],
  providers: [MarketService, MarketValidator],
  exports: [MarketService],
})
export class MarketModule {}
