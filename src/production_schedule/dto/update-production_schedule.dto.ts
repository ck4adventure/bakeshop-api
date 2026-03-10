import { IsInt, Min } from 'class-validator';

export class UpdateProductionScheduleDto {
  @IsInt()
  @Min(0)
  quantity: number;
}
