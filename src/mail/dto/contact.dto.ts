import { Injectable } from '@nestjs/common';
import {
  IsString,
  Length,
  IsEmail,
  Matches,
  IsOptional,
} from 'class-validator';

@Injectable()
export class ContactDto {
  @IsString()
  @IsEmail({}, { message: "L'email est invalide" })
  @Length(5, 100, {
    message: "L'email doit contenir entre 5 et 100 caractères",
  })
  email: string;

  @IsString()
  @Length(3, 50, {
    message: 'Le prénom doit contenir entre 3 et 50 caractères',
  })
  firstname: string;

  @IsString()
  @Length(3, 50, {
    message: 'Le nom doit contenir entre 3 et 50 caractères',
  })
  lastname: string;

  @IsString()
  @Matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, {
    message: 'Le numéro de téléphone est invalide',
  })
  @IsOptional()
  mobile: string;

  @IsString()
  @Length(3, 50, {
    message: 'Le nom de la société doit contenir entre 3 et 50 caractères',
  })
  @IsOptional()
  company: string;

  @IsString()
  @Length(3, 50, {
    message: "L'objet doit contenir entre 3 et 50 caractères",
  })
  object: string;

  @IsString()
  @Length(1, 3000, {
    message: 'Le message doit contenir entre 1 et 3000 caractères',
  })
  message: string;
}
