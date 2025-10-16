import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { logger } from './common/middleware/logging.middleware';
import { AuthController } from './auth/auth.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ItemsModule } from './items/items.module';
import { ItemsController } from './items/items.controller';
import { BatchesModule } from './batches/batches.module';
import { BatchesController } from './batches/batches.controller';
import { InventoryModule } from './inventory/inventory.module';
import { InventoryController } from './inventory/inventory.controller';
import { ProductionScheduleModule } from './production_schedule/production_schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 10,
        },
      ],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ItemsModule,
    BatchesModule,
    InventoryModule,
    ProductionScheduleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(logger)
      .forRoutes(
        AuthController,
        ItemsController,
        BatchesController,
        InventoryController,
      );
  }
}
