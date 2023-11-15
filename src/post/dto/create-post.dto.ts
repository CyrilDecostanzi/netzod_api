import { Injectable } from '@nestjs/common';
import { IsString, IsInt, Min, Max, IsOptional, Length } from 'class-validator';

@Injectable()
export class CreatePostDto {
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  @Length(1, 50, { message: 'Le titre doit faire entre 1 et 50 caractères' })
  title: string;

  @IsString({ message: 'Le contenu doit être une chaîne de caractères' })
  @Length(1, 250, {
    message: 'Le contenu doit faire entre 1 et 250 caractères',
  })
  content: string;

  @IsString({ message: 'La couverture doit être une chaîne de caractères' })
  @Length(1, 250, {
    message: 'La couverture doit faire entre 1 et 250 caractères',
  })
  @IsOptional()
  cover: string;

  @IsInt()
  category_id: number;
}
