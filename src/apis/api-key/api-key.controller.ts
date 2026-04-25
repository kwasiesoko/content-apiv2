import { Controller, Post, Req, Body, Get, Delete, Param } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import type { CreateApiKeyPayload } from './api-key.validator';

@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  async createApiKey(@Req() req, @Body() body: CreateApiKeyPayload) {
    return this.apiKeyService.createApiKey(req.user, body);
  }

  @Get()
  async listApiKeys(@Req() req) {
    return this.apiKeyService.listApiKeys(req.user.id);
  }

  @Delete(':id')
  async revokeApiKey(@Param('id') id: string) {
    return this.apiKeyService.revokeApiKey(id);
  }
}
