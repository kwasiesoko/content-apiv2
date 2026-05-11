// import { Module } from '@nestjs/common';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserMiddleware } from './common/middlewares/user.middleware';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationService } from './helpers/authentication';
import { ApiKeyModule } from './apis/api-key/api-key.module';
import { RepositoriesModule } from './repositories/repository.module';
import { LoggingInterceptor } from './common/interceptors/logger.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { QueueProducerModule } from './queues/processors/queue-producer.module';
import { QueuesProcessorModule } from './queues/queues-processor.module';
import { PlanModule } from './apis/plan/plan.module';
import { PaymentsModule } from './apis/payment/payment.module';

import { SubscriptionMiddleware } from './common/middlewares/subscription.middleware';

import { TopupModule } from './apis/topup/topup.module';
import { PlanUsageModule } from './apis/plan-usage/plan-usage.module';
import { SeedModule } from './apis/seed/seed.module';
import { CommodityModule } from './apis/commodity/commodity.module';
import { MarketModule } from './apis/market/market.module';
import { SubscriptionModule } from './apis/subscription/subscription.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.getOrThrow('REDIS_PORT'),
          // password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    ApiKeyModule,
    RepositoriesModule,
    QueueProducerModule,
    QueuesProcessorModule,
    PlanModule,
    PaymentsModule,
    TopupModule,
    PlanUsageModule,
    SeedModule,
    CommodityModule,
    MarketModule,
    SubscriptionModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthenticationService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    SubscriptionMiddleware
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserMiddleware)
      .exclude({ path: 'developers/(.*)', method: RequestMethod.ALL })
      .forRoutes('*');
  }

  //   consumer
  //     .apply(SubscriptionMiddleware)
  //     .exclude({ path: 'developers/(.*)', method: RequestMethod.ALL })
  //     .forRoutes('*');
  // }
}
