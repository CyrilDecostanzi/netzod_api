import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsString,
  IsEmail,
  Length,
  IsOptional,
  Matches,
} from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsEmail({}, { message: "L'email est invalide" })
  @Length(1, 100, {
    message: "L'email doit contenir entre 1 et 100 caractères",
  })
  @IsOptional()
  email?: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\S]{8,}$/, {
    message:
      'Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre',
  })
  @Length(8, 150, {
    message: 'Le mot de passe doit contenir entre 8 et 150 caractères',
  })
  @IsOptional()
  old_password?: string;
}
