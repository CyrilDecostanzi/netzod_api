import { Comment } from '../entities/comment.entity';
import { CommentStatus } from '../entities/comment.status.enum';
import { CreateCommentDto } from '../dto/create-comment.dto';

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
    comment.status = CommentStatus.AWAITING_APPROVAL;
    return comment;
  };
}
