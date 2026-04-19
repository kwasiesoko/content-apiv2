import crypto from 'crypto';
import prisma from '../common/prisma';

export class APIKeyRepository {
  private prisma = prisma;

  async findActiveApiKeyByUserId(userId: string) {
    return this.prisma.apiKey.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        revoked: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByHash(keyHash: string) {
    return this.prisma.apiKey.findUnique({
      where: { keyHash },
      include: { user: true },
    });
  }

  async revokeApiKey(id: string) {
    return this.prisma.apiKey.update({
      where: { id },
      data: {
        status: 'REVOKED',
        revoked: true,
      },
    });
  }

  async saveApiKey(params: { userId: string; name?: string | null; rawKey: string; prefix: string }) {
    const keyHash = crypto.createHash('sha256').update(params.rawKey).digest('hex');

    return this.prisma.apiKey.create({
      data: {
        name: params.name || 'api-key',
        prefix: params.prefix,
        keyHash,
        userId: params.userId,
      },
    });
  }

  async createApiKey(params: { userId: string; name?: string | null; prefix: string }) {
    const activeKey = await this.findActiveApiKeyByUserId(params.userId);
    if (activeKey) {
      await this.revokeApiKey(activeKey.id);
    }

    const rawKey = `${params.prefix}${crypto.randomBytes(16).toString('hex')}`;
    await this.saveApiKey({
      userId: params.userId,
      name: params.name,
      rawKey,
      prefix: params.prefix,
    });

    return rawKey;
  }

  async listAllByUserId(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
