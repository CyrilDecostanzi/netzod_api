import { Injectable } from '@nestjs/common';
import { IsString, Length } from 'class-validator';

@Injectable()
export class CreateCommentDto {
  @IsString({ message: 'Le contenu doit être une chaîne de caractères' })
  @Length(5, 5000, {
    message: 'Le contenu doit faire entre 5 et 5000 caractères',
  })
  content: string;

  @IsString({ message: 'Le slug doit être une chaîne de caractères' })
  slug: string;
}
