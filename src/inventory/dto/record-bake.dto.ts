import { IsInt, IsOptional, IsString } from 'class-validator';

export class RecordBakeDto {
  @IsInt()
  itemId!: number;

  @IsInt()
  quantity!: number;

  @IsString()
  @IsOptional()
  note?: string;
}
