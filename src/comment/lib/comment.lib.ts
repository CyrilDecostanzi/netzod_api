import { Comment } from '../entities/comment.entity';
import { CommentStatus } from '../entities/comment.status.enum';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { Role } from '../../role/entities/role.enum';

export class CommentLib {
  /**
   * @description Create a new comment
   * @param {CreateCommentDto} createCommentDto
   * @param {any} req
   * @returns {Comment}
   * @memberof CommentLib
   * @static
   * @example CommentLib.createComment(createCommentDto);
   *
   * */
  static createComment = (
    createCommentDto: CreateCommentDto,
    req: any,
  ): Comment => {
    const comment = new Comment(createCommentDto);
    comment.user_id = req.user.id;
    // comment.status =
    //   req.user.role_id === Role.ADMIN
    //     ? CommentStatus.ACTIVE
    //     : CommentStatus.AWAITING_APPROVAL;
    // comment.published_at = req.user.role_id === Role.ADMIN ? new Date() : null;
    comment.status = CommentStatus.ACTIVE;
    comment.published_at = new Date();
    return comment;
  };
}
