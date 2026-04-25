import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { TopupService } from './topup.service';
import type { CreateTopupPayload } from './topup.validator';

@Controller('topup')
export class TopupController {
    constructor(private readonly topupService: TopupService) { }

    @Post('')
    initiateTopup(@Body() body: CreateTopupPayload, @Req() request: any) {
        return this.topupService.initiateTopup(body, request.user);
    }
}
