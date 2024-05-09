import {
  Controller,
  Get,
  // Post,
  Body,
  Req,
  Param,
  Delete,
  SerializeOptions,
  UseInterceptors,
  ClassSerializerInterceptor,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
// import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../role/entities/role.enum';
import { Roles } from '../lib/decorators/roles.decorator';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @SerializeOptions({
    groups: ['admin'],
  })
  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  @SerializeOptions({
    groups: ['user_detail'],
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @SerializeOptions({
    groups: ['auth'],
  })
  @Patch()
  update(@Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    return this.userService.update(req.user.id, updateUserDto);
  }

  @Delete('delete')
  remove(@Req() req: any) {
    return this.userService.remove(req.user.id);
  }
}
