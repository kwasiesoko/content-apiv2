import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { TopupService } from './topup.service';

@Controller('topup')
export class TopupController {
    constructor(private readonly topupService: TopupService) { }

    @Post('')
    initiateTopup(@Body() body: any, @Req() request: any) {
        return this.topupService.initiateTopup(body, request.user);
    }
}
