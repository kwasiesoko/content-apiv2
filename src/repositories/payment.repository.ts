import { BillingCycle, Prisma } from "@prisma/client";
import prisma from "../common/prisma";
import { PaymentProvider } from "../common/enums/payment-provider.enum";
import { PaymentGateway } from "../common/enums/payment-gateway.enum";
import { PaymentStatus } from "../common/enums/payment-status.enum";

export class PaymentRepository {
  private prisma = prisma;

  async create(data: {
    planId?: string;
    userId: string;
    amount: number;
    billingCycle?: BillingCycle;
    provider: PaymentProvider;
    gateway?: PaymentGateway;
    status: PaymentStatus;
    externalReference?: string;
    reference: string;
  }) {
    return this.prisma.payment.create({
      data: data as any
    });
  }

  async findById(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        user: true,
        plan: true,
      },
    });
  }

  async findByReference(reference: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;
    return client.payment.findUnique({
      where: { reference },
    });
  }

  async update(id: string, data: Prisma.PaymentUpdateInput, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;
    return client.payment.update({
      where: { id },
      data,
    });
  }

  async updateByReference(reference: string, data: Prisma.PaymentUpdateInput, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;
    return client.payment.update({
      where: { reference },
      data,
    });
  }

  async updateStatus(id: string, status: PaymentStatus, externalReference?: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;
    return client.payment.update({
      where: { id },
      data: {
        status,
        externalReference,
      },
    });
  }

  async findByUserId(userId: string, skip: number = 0, take: number = 10) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        plan: true,
      },
    });
  }

  async countByUserId(userId: string) {
    return this.prisma.payment.count({
      where: { userId },
    });
  }

  async findPendingByUserId(userId: string) {
    return this.prisma.payment.findMany({
      where: {
        userId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

}
