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

  /**
   * This method is used to validate a user's credentials
   * and return a JWT token.
   * @param email
   * @param password
   * @returns {Promise<{user: User, access_token: string}>} - The user and the JWT token to be used in the Authorization header.
   * @throws BadRequestException
   * @see https://docs.nestjs.com/security/authentication#implementing-passport-jwt
   */
  async signIn(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    const passwordIsValid = user
      ? bcrypt.compareSync(password, user.password)
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

  /**
   * This method is used to create a new user and return a JWT token.
   * @param createUserDto
   * @returns {Promise<{newUser: User, access_token: string}>} - The new user and the JWT token to be used in the Authorization header.
   * @throws BadRequestException
   * @see https://docs.nestjs.com/security/authentication#implementing-passport-jwt
   */
  async signUp(createUserDto: CreateUserDto): Promise<any> {
    const newUser = await this.userService.create(createUserDto);
    const payload = { sub: newUser.id, username: newUser.username };
    return {
      newUser,
      access_token: this.jwtService.sign(payload),
    };
  }
}
