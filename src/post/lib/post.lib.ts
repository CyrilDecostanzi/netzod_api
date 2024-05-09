import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { Post } from '../entities/post.entity';
import { PostStatus } from '../entities/post.status.enum';

export class PostLib {
  /**
   * @description Slugify a text
   * @param {string} text
   * @returns {string}
   * @memberof PostLib
   * @static
   * @example PostLib.slugifier(text);
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
   * @param {CreatePostDto} createPostDto
   * @param {any} req
   * @returns {Post}
   * @memberof PostLib
   * @static
   * @example PostLib.createPost(createPostDto, req);
   *
   * */
  static createPost = (createPostDto: CreatePostDto, req: any): Post => {
    const post = new Post(createPostDto);
    post.slug = this.slugifier(post.title);
    // TODO: Add a check for the slug
    // check if the slug already exists
    // if it does, add a random string to the slug
    // to make it unique

    post.status = PostStatus.DRAFT;
    post.user_id = req.user.id;
    return post;
  };

  static updatePost = (post: Post, updatePostDto: UpdatePostDto): Post => {
    const updatedData = new Post(updatePostDto);

    if (updatePostDto.title) {
      updatedData.slug = this.slugifier(updatePostDto.title);
    }
    return new Post({
      ...post,
      ...updatedData,
    });
  };
}
