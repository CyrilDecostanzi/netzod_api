import {
  Body,
  Controller,
  Get,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { UserService } from '../user/user.service';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @SerializeOptions({
    groups: ['auth'],
  })
  @Post('login')
  signIn(@Body() signInDto: any) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @SerializeOptions({
    groups: ['auth'],
  })
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    const user = this.userService.findOne(req.user.sub);
    return user;
  }
}
