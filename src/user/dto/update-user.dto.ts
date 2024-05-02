import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsEmail, Length, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsEmail({}, { message: "L'email est invalide" })
  @Length(1, 100, {
    message: "L'email doit contenir entre 1 et 100 caractères",
  })
  @IsOptional()
  email?: string;
}
