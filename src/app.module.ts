import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

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
    }),],
  controllers: [AppController],
  providers: [AppService,
		 {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
	],
})
export class AppModule {}
