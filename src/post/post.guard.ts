// post-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PostService } from './post.service';

@Injectable()
export class PostGuard implements CanActivate {
  constructor(private readonly postService: PostService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const postId = +req.params.id; // Extract post id from request params
    const user = req.user;

    if (!(await this.postService.isUserAuthorized(postId, user))) {
      throw new UnauthorizedException(
        "Vous n'êtes pas autorisé à accéder à cette ressource",
      );
    }

    return true;
  }
}
