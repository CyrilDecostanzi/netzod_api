import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

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
      access_token: this.jwtService.sign(payload),
    };
  }
}
