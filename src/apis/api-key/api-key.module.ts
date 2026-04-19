import { Module } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { ApiKeyController } from './api-key.controller';

import { RepositoriesModule } from '../../repositories/repository.module';

@Module({
  imports: [RepositoriesModule],
  providers: [ApiKeyService],
  controllers: [ApiKeyController],
  exports: [ApiKeyService],

})
export class ApiKeyModule { }

