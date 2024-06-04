import {
  HttpException,
  Injectable,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { logError } from '../lib/logger/logger';
import bcrypt from 'bcrypt';
import * as path from 'path';
import { UserLib } from './lib/user.lib';
import { ContactDto } from '../mail/dto/contact.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserService {
  logger: Logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = UserLib.createUser(createUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      const currentFilePath = path.resolve(__filename);
      logError(this.logger, error, currentFilePath);
      const message = "Une erreur est survenue lors de l'enregistrement";
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    if (!users) {
      throw new HttpException('No users found', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email: email } });
    return user || null;
  }

  async findByName(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (updateUserDto.email) {
        // Check if email is already taken
        const userWithSameEmail = await this.findByEmail(updateUserDto.email);

        if (userWithSameEmail && userWithSameEmail.id !== id) {
          const msg = 'Cette adresse email est déjà utilisée';
          throw new BadRequestException({
            field: 'email',
            message: msg,
            status: HttpStatus.BAD_REQUEST,
          });
        }
      }
      if (updateUserDto.password) {
        if (!updateUserDto.old_password) {
          throw new BadRequestException({
            field: 'old_password',
            message: `Le mot de passe actuel est requis pour changer le mot de passe.`,
            status: HttpStatus.BAD_REQUEST,
          });
        }
        const salt = bcrypt.genSaltSync(+process.env.SALT_ROUNDS);
        updateUserDto.password = bcrypt.hashSync(updateUserDto.password, salt);

        const passwordIsValid = bcrypt.compareSync(
          updateUserDto.old_password,
          user.password,
        );

        if (!passwordIsValid) {
          throw new BadRequestException({
            field: 'old_password',
            message: `Le mot de passe est incorrect.`,
            status: HttpStatus.BAD_REQUEST,
          });
        }
      }

      const plainUser = await this.userRepository.save({
        ...user,
        ...updateUserDto,
      });

      return new User(plainUser);
    } catch (error) {
      const currentFilePath = path.resolve(__filename);
      logError(this.logger, error, currentFilePath);
      return error.response;
    }
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // TODO: Check if user has any related data before deleting

    await this.userRepository.softRemove(user);
  }

  async contact(contactDto: ContactDto): Promise<any> {
    try {
      return await this.mailService.handleContactForm(contactDto);
    } catch (error) {
      const currentFilePath = path.resolve(__filename);
      logError(this.logger, error, currentFilePath);
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

  async findByVerifToken(token: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { verif_token: token } });
  }

  async changeUserStatus(id: number, status: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.status = status;
    return await this.userRepository.save(user);
  }
}
