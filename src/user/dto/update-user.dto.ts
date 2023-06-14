import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsEmail, Length } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsEmail({}, { message: "L'email est invalide" })
  @Length(1, 100, {
    message: "L'email doit contenir entre 1 et 100 caractères",
  })
  email: string;
}
