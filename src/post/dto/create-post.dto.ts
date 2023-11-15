import { Injectable } from '@nestjs/common';
import { IsString, IsInt, IsOptional, Length } from 'class-validator';

@Injectable()
export class CreatePostDto {
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  @Length(5, 50, { message: 'Le titre doit faire entre 5 et 50 caractères' })
  title: string;

  @IsString({ message: 'Le contenu doit être une chaîne de caractères' })
  @Length(5, 250, {
    message: 'Le contenu doit faire entre 5 et 250 caractères',
  })
  content: string;

  @IsString({ message: 'La couverture doit être une chaîne de caractères' })
  @Length(3, 250, {
    message: 'La couverture doit faire entre 1 et 250 caractères',
  })
  @IsOptional()
  cover: string;

  @IsInt({ message: 'Le statut doit être un nombre entier' })
  @IsOptional()
  category_id: number;
}
