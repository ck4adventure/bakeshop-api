import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class UpsertOverrideDto {
  @IsInt()
  itemId!: number;

  @IsDateString()
  date!: string;

  @IsInt()
  @Min(0)
  quantity!: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  specialOrderQty?: number;
}
