// post-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentService } from './comment.service';

@Injectable()
export class PostGuard implements CanActivate {
  constructor(private readonly commentService: CommentService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const commentId = +req.params.id; // Extract post id from request params
    const user = req.user;

    if (!(await this.commentService.isUserAuthorized(commentId, user))) {
      throw new UnauthorizedException(
        "Vous n'êtes pas autorisé à accéder à cette ressource",
      );
    }

    return true;
  }
}
