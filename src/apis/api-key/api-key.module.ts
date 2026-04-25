import { Module } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyValidator } from './api-key.validator';
import { RepositoriesModule } from '../../repositories/repository.module';

@Module({
  imports: [RepositoriesModule],
  providers: [ApiKeyService, ApiKeyValidator],
  controllers: [ApiKeyController],
  exports: [ApiKeyService],

})
export class ApiKeyModule { }
