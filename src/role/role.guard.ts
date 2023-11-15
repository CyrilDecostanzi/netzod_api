import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../role/entities/role.enum';
import { ROLES_KEY } from '../lib/decorators/roles.decorator';
import { UserService } from '../user/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private userService: UserService) {}
  /**
   * This method is used to check if the user has the required role. If not, it throws an UnauthorizedException.
   * @param {ExecutionContext} context - The context of the request
   * @throws UnauthorizedException
   * @returns {Promise<boolean>} - True if the user has the required role, false otherwise
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    const userRole = this.userService.findOne(user.sub);
    const roleId = (await userRole).role_id;
    return requiredRoles.some((role) => role === roleId);
  }
}
