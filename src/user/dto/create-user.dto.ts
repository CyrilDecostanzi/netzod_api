import { Injectable } from '@nestjs/common';
import {
  IsString,
  IsEmail,
  Length,
  Validate,
  Matches,
  IsOptional,
} from 'class-validator';
import { IsEmailUniqueValidator } from '../../lib/validators/email-validator';

@Injectable()
export class CreateUserDto {
  @IsString()
  @Length(3, 50, {
    message: 'Le pseudo doit contenir entre 3 et 50 caractères',
  })
  username: string;

  @IsString()
  @IsEmail({}, { message: "L'email est invalide" })
  @Length(5, 100, {
    message: "L'email doit contenir entre 5 et 100 caractères",
  })
  @Validate(IsEmailUniqueValidator, {
    message: "L'email est déjà utilisé",
  })
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\S]{8,}$/, {
    message:
      'Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre',
  })
  @Length(8, 150, {
    message: 'Le mot de passe doit contenir entre 8 et 150 caractères',
  })
  password: string;

  @IsString()
  @Matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, {
    message: 'Le numéro de téléphone est invalide',
  })
  @IsOptional()
  mobile: string;

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
  @Length(1, 600, {
    message: "L'avatar doit contenir entre 1 et 600 caractères",
  })
  @IsOptional()
  avatar: string;

  @IsString()
  @Length(10, 600, {
    message: 'La biographie doit contenir entre 10 et 600 caractères',
  })
  @IsOptional()
  bio: string;

  @IsString()
  @IsOptional()
  refresh_token: string;
}
