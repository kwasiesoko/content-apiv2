import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PaymentRepository } from '../../repositories/payment.repository';
import { PlanRepository } from '../../repositories/plan.repository';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { PaymentGateway } from '../../common/enums/payment-gateway.enum';
import { PaymentProvider } from '../../common/enums/payment-provider.enum';
import { PaystackService } from '../paystack/paystack.service';

import { v4 as uuidv4 } from 'uuid';
import { BillingCycle, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import prisma from '../../common/prisma';
import { SubscriptionRepository } from '../../repositories/subscription.repository';
import { SubscriptionService } from '../subscription/subscription.service';
import {
    PaymentValidator,
    CreatePaymentPayload,
} from './payment.validator';

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    private readonly integrationsService: any = null;

    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly planRepository: PlanRepository,
        private readonly config: ConfigService,
        private readonly paystack: PaystackService,
        @InjectQueue('payment-queue') private readonly paymentQueue: Queue,
        private readonly subscriptionRepository: SubscriptionRepository,
        private readonly subscriptionService: SubscriptionService,
        private readonly paymentValidator: PaymentValidator,
    ) { }


    async createPayment(body: CreatePaymentPayload, user: any) {
        try {
            const validatedBody = this.paymentValidator.validateCreatePaymentDto(body);
            const plan = await this.planRepository.findById(validatedBody.planId as string);
            if (!plan) {
                throw new NotFoundException(`Plan with ID ${validatedBody.planId} not found`);
            }

            const billingCycle = validatedBody.billingCycle === BillingCycle.ANNUAL
                ? BillingCycle.ANNUAL
                : BillingCycle.MONTHLY;
            const amount = billingCycle === BillingCycle.ANNUAL ? plan.annualPrice : plan.monthlyPrice;
            const paymentReference = uuidv4();

            const payment = await this.paymentRepository.create({
                planId: plan.id,
                userId: user.id,
                amount: Number(amount),
                billingCycle: billingCycle,
                provider: PaymentProvider.PAYSTACK,
                gateway: PaymentGateway.MOBILE_MONEY,
                status: PaymentStatus.PENDING,
                reference: paymentReference,
            });

            const paystackAmount =
                Number(payment.amount) *
                this.config.getOrThrow('PAYSTACK_AMOUNT_MULTIPLIER'); // paystack expects amount in kobo
            const paystack = await this.paystack.initializePayment(
                user.email,
                paystackAmount,
                paymentReference,
            );
            const { reference } = paystack.data;
            const paymentType = 'SUBSCRIPTION';
            await this.enqueuePayment(reference, user.id, paymentType);

            return paystack;
        } catch (error:any) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            if (error instanceof NotFoundException) {
                throw error;
            }

            console.error('Payment creation error:', error);
            throw new BadRequestException(
                'Payment creation failed',
                error?.message || 'Internal server error'
            );
        }
    }

    async createTopup(body: { amount?: number | string }, user: any) {
        try {
            const amount = Number(body.amount);
            if (isNaN(amount) || amount <= 0) {
                throw new BadRequestException('Invalid amount for topup');
            }

            const activeSubscription = await this.subscriptionRepository.findActiveByUserId(user.id);
            const planId = activeSubscription?.planId;

            const paymentReference = uuidv4();

            const payment = await this.paymentRepository.create({
                userId: user.id,
                planId: planId,
                amount: amount,
                provider: PaymentProvider.PAYSTACK,
                gateway: PaymentGateway.MOBILE_MONEY,
                status: PaymentStatus.PENDING,
                reference: paymentReference,
            });

            const paystackAmount =
                Number(payment.amount) *
                this.config.getOrThrow('PAYSTACK_AMOUNT_MULTIPLIER');
            const paystack = await this.paystack.initializePayment(
                user.email,
                paystackAmount,
                paymentReference,
            );
            const { reference } = paystack.data;
            const paymentType = 'TOPUP';
            await this.enqueuePayment(reference, user.id, paymentType);

            return paystack;
        } catch (error: any) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error('Topup creation error:', error);
            throw new BadRequestException(
                'Topup creation failed',
                error?.message || 'Internal server error'
            );
        }
    }

    async enqueuePayment(reference: string, userId: string, paymentType: string, authorization?: string) {
        await this.paymentQueue.add(
            'process-payment',
            { reference, userId, paymentType, authorization },
            {
                jobId: reference,
                attempts: 5,
                backoff: { type: 'exponential', delay: 60000 },
                delay: 120000,
            },
        );
    }


    async processPayment(reference: string, userId: string, paymentType: string, authorization?: string) {
        try {
            const payment = await this.paymentRepository.findByReference(reference);
            if (!payment) {
                this.logger.log('Payment not found');
                return;
            }

            const successfulStatus = await this.getPaymentStatus('success');
            if (payment.status === successfulStatus) {
                this.logger.log(`Payment ${reference} already completed`);
                return;
            }

            const verifiedPayment = await this.paystack.verifyPayment(reference);
            const { status: apiSuccess, data } = verifiedPayment;
            if (!apiSuccess) {
                this.logger.log('Payment verification failed');
                return;
            }

            const {
                status: paystackStatus,
                reference: paymentReference,
            } = data;

            if (paymentReference !== reference) {
                this.logger.log('Payment reference mismatch');
                return;
            }

            const mappedStatus = await this.getPaymentStatus(paystackStatus);

            if (mappedStatus !== PaymentStatus.SUCCESSFUL && mappedStatus !== PaymentStatus.FAILED) {
                this.logger.log(`Payment ${reference} status is ${mappedStatus}, skipping background update.`);
                return;
            }

            await prisma.$transaction(async (tx) => {
                await this.paymentRepository.updateByReference(paymentReference, { status: mappedStatus }, tx);

                if (mappedStatus !== PaymentStatus.SUCCESSFUL) {
                    return;
                }

                if (paymentType === 'SUBSCRIPTION') {
                    const { billingCycle, planId } = payment;
                    if (!billingCycle || !planId) {
                        throw new BadRequestException(`Billing cycle or plan ID missing for payment ${reference}`);
                    }
                    const subScriptionEndDate =
                        this.subscriptionService.calculateSubscriptionEndDate(billingCycle);

                    await this.subscriptionRepository.deactivateActiveSubscriptions(userId, tx);

                    await this.subscriptionRepository.create({
                        user: { connect: { id: userId } },
                        plan: { connect: { id: planId } },
                        billingInterval: billingCycle,
                        status: 'ACTIVE',
                        endDate: subScriptionEndDate,
                    }, tx);

                    const creditAmount = payment.amount ? (Number(payment.amount) / 2).toString() : '0';
                    const payload = {
                        amount: creditAmount,
                        reference: payment.reference as string,
                        reason: 'Subscription payment',
                        source: 'content',
                    };
                    const token = authorization || ""
                    if (this.integrationsService) {
                        await this.integrationsService.creditUserBalance(token, payload);
                    }
                } else if (paymentType === 'TOPUP') {
                    const payload = {
                        amount: payment.amount ? payment.amount.toString() : '0',
                        reference: payment.reference as string,
                        reason: 'Wallet Top-up',
                        source: 'content',
                    };
                    const token = authorization || ""
                    if (this.integrationsService) {
                        await this.integrationsService.creditUserBalance(token, payload);
                    }
                    this.logger.log(`Top-up for user ${userId} processed successfully`);
                }
            });

            this.logger.log(`Payment ${reference} processed successfully`);
        } catch (error: any) {
            this.logger.error(error);
            throw new BadRequestException(
                `Payment processing failed: ${error.message}`,
            );
        }
    }

    async getUserPayments(userId: string, page: number = 1, limit: number = 10) {
        try {
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                this.paymentRepository.findByUserId(userId, skip, limit),
                this.paymentRepository.countByUserId(userId),
            ]);

            return {
                data,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error: any) {
            this.logger.error(`Error getting payments for user ${userId}`, error);
            throw new BadRequestException('Failed to get user payments');
        }
    }

    async getPaymentByReference(reference: string) {
        return this.paymentRepository.findByReference(reference);
    }

    async getPaymentStatus(status: string): Promise<PaymentStatus> {
        const statusMap: Record<string, PaymentStatus> = {
            success: PaymentStatus.SUCCESSFUL,
            failed: PaymentStatus.FAILED,
            abandoned: PaymentStatus.ABANDONED,
            pending: PaymentStatus.PENDING,
        };

        return statusMap[status.toLowerCase()] ?? PaymentStatus.ABANDONED;
    }
}
