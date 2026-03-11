import { Module } from '@nestjs/common';
import { BakeryController } from './bakery.controller';
import { BakeryService } from './bakery.service';

@Module({
  controllers: [BakeryController],
  providers: [BakeryService],
})
export class BakeryModule {}
