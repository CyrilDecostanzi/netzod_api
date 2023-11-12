import { Injectable } from '@nestjs/common';
import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

@Injectable()
export class CreatePostDto {
  @IsString()
  @Min(10)
  @Max(150)
  title: string;

  @IsString()
  @Min(50)
  content: string;

  @IsString()
  @Min(5)
  @Max(250)
  @IsOptional()
  cover: string;

  @IsInt()
  @Min(0)
  @Max(99)
  @IsOptional()
  status: number;

  @IsInt()
  category_id: number;
}
