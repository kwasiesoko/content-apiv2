import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { APIKeyRepository } from '../../repositories/api-key.repository';

import { ConfigService } from '@nestjs/config';
import { ApiKeyValidator, CreateApiKeyPayload } from './api-key.validator';

@Injectable()
export class ApiKeyService {
  constructor(
    private readonly apiKeyRepository: APIKeyRepository,
    private readonly config: ConfigService,
    private readonly apiKeyValidator: ApiKeyValidator,
  ) {}

  async createApiKey(user: { id: string }, body: CreateApiKeyPayload) {
    try {
      const validatedBody = this.apiKeyValidator.validateCreateApiKeyDto(body);
      const name = validatedBody.name;
      const userId = user.id;
      const prefix = this.config.getOrThrow<string>('API_KEY_PREFIX');

      const rawKey = await this.apiKeyRepository.createApiKey({
        userId,
        name,
        prefix,
      });
      return {
        statusCode: HttpStatus.CREATED,
        message: 'success',
        data: { apiKey: `${rawKey}` },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating API key:', error);
      throw new InternalServerErrorException('Failed to create API key');
      // throw error;
    }
  }

  async revokeApiKey(id: string) {
    try {
      await this.apiKeyRepository.revokeApiKey(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'API key revoked successfully',
      };
    } catch (error) {
      console.error('Error revoking API key:', error);
      throw new InternalServerErrorException('Failed to revoke API key');
    }
  }

  async listApiKeys(userId: string) {
    try {
      const keys = await this.apiKeyRepository.listAllByUserId(userId);
      return { statusCode: HttpStatus.OK, message: 'success', data: keys };
    } catch (error) {
      console.error('Error listing API keys:', error);
      throw new InternalServerErrorException('Failed to list API keys');
    }
  }
}
