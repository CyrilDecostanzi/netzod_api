import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { UserService } from '../../user/user.service';

@ValidatorConstraint({ async: true })
export class IsEmailUniqueValidator implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(email: string, args: ValidationArguments) {
    const user = await this.userService.findByEmail(email);
    return !user;
  }
}
