import { Controller, Post, Body, Req, Get, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import type { Request } from 'express';

@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('')
    createPayment(@Body() body: any, @Req() request: any) {
        return this.paymentService.createPayment(body, request.user);
    }

    @Get('')
    getUserPayments(
        @Req() request: any,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return this.paymentService.getUserPayments(request.user.id, Number(page), Number(limit));
    }
}
