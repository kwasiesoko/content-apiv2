import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { APIKeyRepository } from '../../repositories/api-key.repository';
import crypto from 'crypto';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyRepository: APIKeyRepository) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const keyData = await this.apiKeyRepository.findByHash(keyHash);

    if (!keyData || keyData.revoked || keyData.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid or revoked API key');
    }

    // Attach the user associated with the API key to the request
    request.user = keyData.user;

    return true;
  }
}
