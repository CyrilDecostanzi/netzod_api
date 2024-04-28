import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { logInfo } from '../lib/logger/logger';

@Injectable()
export class AuthService {
  logger: Logger = new Logger(AuthService.name);
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  private createToken(user: User): { access_token: string } {
    logInfo(
      this.logger,
      `Création du token pour l'utilisateur ${user.id}, ${user.username}, ${user.email}`,
    );

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      firstname: user.firstname,
      lastname: user.lastname,
      avatar: user.avatar,
      mobile: user.mobile,
      status: user.status,
    };
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '2d',
      }),
    };
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException({
        field: 'email',
        message: `L'utilisateur n'existe pas.`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      throw new BadRequestException({
        field: 'password',
        message: `Le mot de passe est incorrect.`,
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    return user;
  }

  async signIn(email: string, password: string): Promise<any> {
    try {
      const user = await this.validateUser(email, password);
      return {
        user,
        ...this.createToken(user),
      };
    } catch (error) {
      throw new HttpException(
        {
          field: error.response.field,
          message: error.response.message,
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async signUp(createUserDto: CreateUserDto): Promise<any> {
    try {
      const user = await this.userService.create(createUserDto);
      return {
        user,
        ...this.createToken(user),
      };
    } catch (error) {
      throw new HttpException(
        {
          field: error.field,
          message: error.message,
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
