import { Injectable } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

@Injectable()
export class ShowUserDto extends PartialType(CreateUserDto) {}
