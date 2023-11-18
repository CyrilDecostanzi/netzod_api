import { Post } from '../entities/post.entity';
import { PostStatus } from '../entities/post.status.enum';

export class PostHelper {
  /**
   * @description Slugify a text
   * @param {string} text
   * @returns {string}
   * @memberof PostHelper
   * @static
   * @example PostHelper.slugifier(text);
   */
  static slugifier = (text: string): string => {
    text = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
    return text;
  };

  /**
   * @description Create a new post
   * @param {any} createPostDto
   * @param {any} req
   * @returns {Post}
   * @memberof PostHelper
   * @static
   * @example PostHelper.createPost(createPostDto, req);
   *
   * */
  static createPost = (createPostDto: any, req: any): Post => {
    const post = new Post(createPostDto);
    // construction of the slug
    post.slug = this.slugifier(post.title);
    post.status = PostStatus.DRAFT;
    post.published_at = new Date();
    post.user_id = req.user.sub;
    return post;
  };
}
