import { Module } from '@nestjs/common';
import { TopupService } from './topup.service';
import { TopupController } from './topup.controller';
import { PaymentsModule } from '../payment/payment.module';
import { TopupValidator } from './topup.validator';

@Module({
    imports: [PaymentsModule],
    providers: [TopupService, TopupValidator],
    controllers: [TopupController],
    exports: [TopupService]
})
export class TopupModule { }
