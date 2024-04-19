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

@Injectable()
export class UserService {
  /**
   * Logger instance
   * @private
   * @type {Logger}
   * @memberof UserService
   * @see https://docs.nestjs.com/techniques/logger
   */
  logger: Logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  /**
   * This method is used to create a new user. It hashes the password and sets the user's role to 'USER'.
   * @param createUserDto - The user to be created
   * @returns {Promise<User>} - The user created
   * @throws HttpException - If an error occurs during the creation process
   * @see https://docs.nestjs.com/techniques/database#repository
   */
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

  /**
   * This method is used to retrieve all users. It returns an empty array if no users are found.
   * @returns {Promise<User[]>} - All users
   * @throws HttpException - If no users are found in the database
   * @see https://docs.nestjs.com/techniques/database#repository
   */
  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    if (!users) {
      throw new HttpException('No users found', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  /**
   * This method is used to retrieve a user by its id.
   * @param {number} id - The user's id
   * @returns {Promise<User>} - The user found
   * @throws HttpException - If no user is found in the database
   * @returns
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      // relations: ['posts', 'role'],
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  /**
   * This method is used to retrieve a user by its email address.
   * @param {string} email - The user's email address
   * @returns {Promise<User | null>} - The user found or null if no user is found
   * @see https://docs.nestjs.com/techniques/database#repository
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user || null;
  }

  /**
   * This method is used to retrieve a user by its username.
   * @param {string} username - The user's username
   * @returns {Promise<User | undefined>} - The user found or undefined if no user is found
   * @see https://docs.nestjs.com/techniques/database#repository
   */
  async findByName(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  /**
   * This method is used to update a user.
   * @param {number} id - The user's id
   * @param {UpdateUserDto} updateUserDto - The user's new data
   * @returns {Promise<User>} - The user updated
   * @throws HttpException - If no user is found in the database or if an error occurs during the update process
   * @throws BadRequestException - If the email is already taken
   * @see https://docs.nestjs.com/techniques/database#repository
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
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

  /**
   * This method is used to delete a user.
   * @param {number} id - The user's id
   * @returns {Promise<void>} - Nothing
   * @throws HttpException - If no user is found in the database or if an error occurs during the deletion process
   * @see https://docs.nestjs.com/techniques/database#repository
   */
  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    await this.userRepository.softRemove(user);
  }
}
