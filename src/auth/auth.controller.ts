import {
  Body,
  Controller,
  Get,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Public } from '../lib/decorators/public.decorator';

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
  @Public()
  @Post('login')
  signIn(@Body() signInDto: any) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @SerializeOptions({
    groups: ['auth', 'user_detail'],
  })
  @Get('profile')
  getProfile(@Req() req) {
    const user = this.userService.findOne(req.user.id);
    return user;
  }

  @SerializeOptions({
    groups: ['auth'],
  })
  @Public()
  @Post('register')
  signUp(@Body() signUpDto: CreateUserDto) {
    return this.authService.signUp(signUpDto);
  }

  @SerializeOptions({
    groups: ['auth'],
  })
  @Public()
  @Post('refresh')
  refresh(@Body() data: any) {
    return this.authService.refresh(data.token);
  }

  @SerializeOptions({
    groups: ['auth'],
  })
  @Post('logout')
  logout(@Req() req) {
    return this.authService.logout(req.user);
  }

  @SerializeOptions({
    groups: ['auth'],
  })
  @Public()
  @Post('verify-email')
  verifyEmail(@Body() data: any) {
    return this.authService.verifyEmail(data.token);
  }
}
