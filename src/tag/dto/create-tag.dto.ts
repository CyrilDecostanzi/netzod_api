import { Injectable } from '@nestjs/common';
import { IsInt, IsString, Length } from 'class-validator';

@Injectable()
export class CreateTagDto {
  @IsString()
  @Length(1, 50, {
    message: 'Le prénom doit contenir entre 1 et 50 caractères',
  })
  name: string;

  @IsInt({ message: 'La catégorie doit être un entier' })
  category_id: number;
}
