import { Module } from '@nestjs/common';
import { TopupService } from './topup.service';
import { TopupController } from './topup.controller';
import { PaymentsModule } from '../payment/payment.module';

@Module({
    imports: [PaymentsModule],
    providers: [TopupService],
    controllers: [TopupController],
    exports: [TopupService]
})
export class TopupModule { }
