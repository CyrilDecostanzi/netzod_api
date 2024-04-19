import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé.');
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      throw new BadRequestException('Mot de passe incorrect.');
    }

    return user;
  }

  async signIn(email: string, password: string): Promise<any> {
    const user = await this.validateUser(email, password);
    return {
      user,
      ...this.createToken(user),
    };
  }

  async signUp(createUserDto: CreateUserDto): Promise<any> {
    const newUser = await this.userService.create(createUserDto);
    return {
      newUser,
      ...this.createToken(newUser),
    };
  }
}
