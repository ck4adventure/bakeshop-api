import { IsEnum, IsInt, Min } from 'class-validator';
import { Weekday } from '@prisma/client';

export class CreateProductionScheduleDto {
  @IsInt()
  @Min(1)
  itemId: number;

  @IsEnum(Weekday)
  weekday: Weekday;

  @IsInt()
  @Min(0)
  quantity: number;
}
