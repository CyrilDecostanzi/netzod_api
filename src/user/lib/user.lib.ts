import { User } from '../entities/user.entity';
import bcrypt from 'bcrypt';
import { UserStatus } from '../entities/user.status.enum';
import { Role } from '../../role/entities/role.enum';
import { CreateUserDto } from '../dto/create-user.dto';

export class UserLib {
  /**
   * This method is used to create a new user. It hashes the password and sets the user's role to 'USER'.
   * @param createUserDto - The user to be created
   * @memberof UserHelper
   * @returns {Promise<User>} - The user created
   */
  static createUser(createUserDto: CreateUserDto): User {
    const user = new User(createUserDto);
    const verifToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    user.status = UserStatus.INACTIVE;
    user.role_id = Role.USER;
    user.verif_token = verifToken;

    const salt = bcrypt.genSaltSync(+process.env.SALT_ROUNDS);
    user.password = bcrypt.hashSync(user.password, salt);
    return user;
  }
}
