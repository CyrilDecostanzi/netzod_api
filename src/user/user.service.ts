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

@Injectable()
export class UserService {
  logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = new User(createUserDto);
      const salt = bcrypt.genSaltSync(+process.env.SALT_ROUNDS);
      user.password = bcrypt.hashSync(user.password, salt);
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
      // relations: ['posts'],
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user || null;
  }

  async findByName(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new Error('User not found');
      }

      // Check if email is already taken
      const userWithSameEmail = await this.findByEmail(updateUserDto.email);

      if (userWithSameEmail && userWithSameEmail.id !== id) {
        const msg = 'Cette adresse email est déjà utilisée';
        throw new BadRequestException(msg);
      }
      if (updateUserDto.password) {
        const salt = bcrypt.genSaltSync(+process.env.SALT_ROUNDS);
        updateUserDto.password = bcrypt.hashSync(updateUserDto.password, salt);
      }
      return await this.userRepository.save({
        ...user,
        ...updateUserDto,
      });
    } catch (error) {
      const currentFilePath = path.resolve(__filename);
      logError(this.logger, error, currentFilePath);
      return error.response;
    }
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.softRemove(user);
  }
}
