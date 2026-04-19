import prisma from '../common/prisma';

export class UserRepository {
  private prisma = prisma;

  async retrieveUser(ssoId: string) {
    return this.prisma.user.findUnique({
      where: { ssoUserId: ssoId },
    });
  }

  async saveUser(data: any) {
    return this.prisma.user.create({ data });
  }

  async updateUser(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
