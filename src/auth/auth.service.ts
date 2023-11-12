import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    const passwordIsValid = user
      ? bcrypt.compareSync(pass, user.password)
      : false;

    if (!passwordIsValid || !user) {
      throw new BadRequestException(
        "Le nom d'utilisateur ou le mot de passe est incorrect",
      );
    }

    const payload = { sub: user.id, username: user.username };
    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async signUp(createUserDto: CreateUserDto): Promise<any> {
    const newUser = await this.userService.create(createUserDto);
    const payload = { sub: newUser.id, username: newUser.username };
    return {
      newUser,
      access_token: this.jwtService.sign(payload),
    };
  }
}
