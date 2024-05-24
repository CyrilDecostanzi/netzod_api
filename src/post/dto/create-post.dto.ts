import { Injectable } from '@nestjs/common';
import { IsString, IsOptional, Length, IsInt } from 'class-validator';

@Injectable()
export class CreatePostDto {
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  @Length(5, 150, { message: 'Le titre doit faire entre 5 et 150 caractères' })
  @IsOptional()
  title: string;

  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @Length(5, 450, {
    message: 'La description doit faire entre 5 et 450 caractères',
  })
  @IsOptional()
  description: string;

  @IsString({ message: 'Le contenu doit être une chaîne de caractères' })
  @IsOptional()
  content: string;

  @IsString({ message: 'La couverture doit être une chaîne de caractères' })
  @Length(3, 250, {
    message: 'La couverture doit faire entre 1 et 250 caractères',
  })
  @IsOptional()
  cover: string;

  @IsInt({ message: 'Le category_id doit être un nombre entier' })
  @IsOptional()
  category_id?: number;

  @IsOptional()
  published_at: Date;
}
