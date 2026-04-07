import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class RecordAdjustmentDto {
  @IsInt()
  itemId!: number;

  @IsInt()
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  note!: string;
}
