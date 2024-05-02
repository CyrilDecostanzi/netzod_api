import {
  BadRequestException,
  HttpException,
  UnauthorizedException,
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
import { MailService } from '../mail/mail.service';
import { jwtConstants } from './constants';

@Injectable()
export class AuthService {
  logger: Logger = new Logger(AuthService.name);
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private createAccessToken(user: User): string {
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

    return this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: '15m',
    });
  }

  private createRefreshToken(user: User): string {
    const payload = { id: user.id };
    return this.jwtService.sign(payload, {
      secret: jwtConstants.refreshSecret,
      expiresIn: '7d',
    });
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
      const refresh_token = this.createRefreshToken(user);
      const access_token = this.createAccessToken(user);

      // Stocker le refresh token dans la base de données
      await this.userService.update(user.id, { refresh_token: refresh_token });

      return {
        user,
        access_token,
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
      const refresh_token = this.createRefreshToken(user);
      const access_token = this.createAccessToken(user);

      // Stocker le refresh token dans la base de données
      await this.userService.update(user.id, { refresh_token: refresh_token });

      // TODO : send email confirmation with token to user
      const token = Math.floor(1000 + Math.random() * 9000).toString();
      this.mailService.sendUserConfirmation(user, token).catch((error) => {
        console.error('error email: ', error);
      });

      return {
        user,
        access_token,
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

  async refresh(token: string): Promise<any> {
    const data = this.jwtService.decode(token);

    const user = await this.userService.findOne(data.id);

    if (!user || !user.refresh_token) {
      throw new UnauthorizedException({
        field: 'refresh_token',
        message: 'Invalid or Expired Refresh Token',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    try {
      await this.jwtService.verifyAsync(user.refresh_token, {
        secret: jwtConstants.refreshSecret,
      });

      const newAccessToken = this.createAccessToken(user);

      return {
        user: user,
        access_token: newAccessToken,
      };
    } catch {
      throw new UnauthorizedException({
        field: 'refresh_token',
        message: 'Invalid or Expired Refresh Token',
        status: HttpStatus.UNAUTHORIZED,
      });
    }
  }

  async logout(user: User): Promise<any> {
    await this.userService.update(user.id, { refresh_token: null });
    return {
      message: 'User logged out',
    };
  }
}
