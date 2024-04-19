import { Injectable } from '@nestjs/common';
import { IsString, IsOptional, Length, IsInt } from 'class-validator';

@Injectable()
export class CreatePostDto {
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  @Length(5, 50, { message: 'Le titre doit faire entre 5 et 50 caractères' })
  title: string;

  @IsString({ message: 'Le contenu doit être une chaîne de caractères' })
  @Length(5, 5000, {
    message: 'Le contenu doit faire entre 5 et 5000 caractères',
  })
  content: string;

  @IsString({ message: 'La couverture doit être une chaîne de caractères' })
  @Length(3, 250, {
    message: 'La couverture doit faire entre 1 et 250 caractères',
  })
  @IsOptional()
  cover: string;

  @IsInt({ message: 'Le statut doit être un entier' })
  category_id: number;

  @IsInt({ message: "L'utilisateur doit être un entier" })
  user_id: number;
}
