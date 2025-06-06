import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

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
    }), AuthModule, UsersModule,],
  controllers: [AppController],
  providers: [AppService,
		 {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
	],
})
export class AppModule {}
