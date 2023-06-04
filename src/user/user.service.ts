import { HttpException, Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ACTIVE, User } from './entities/user.entity';
import { logError } from '../lib/logger/logger';
import * as path from 'path';

@Injectable()
export class UserService {
  logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = new User();
      user.username = createUserDto.username;
      user.email = createUserDto.email;
      user.password = createUserDto.password;
      user.status = ACTIVE;
      user.role_id = 1;
      user.mobile = createUserDto.mobile;
      user.firstname = createUserDto.firstname;
      user.lastname = createUserDto.lastname;
      user.avatar = createUserDto.avatar;
      user.bio = createUserDto.bio;

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
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user || null;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.username = updateUserDto.username || user.username;
    user.email = updateUserDto.email || user.email;
    user.password = updateUserDto.password || user.password;
    user.status = updateUserDto.status || user.status;
    user.role_id = updateUserDto.role_id || user.role_id;
    user.mobile = updateUserDto.mobile || user.mobile;
    user.firstname = updateUserDto.firstname || user.firstname;
    user.lastname = updateUserDto.lastname || user.lastname;
    user.avatar = updateUserDto.avatar || user.avatar;
    user.bio = updateUserDto.bio || user.bio;

    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.remove(user);
  }
}
