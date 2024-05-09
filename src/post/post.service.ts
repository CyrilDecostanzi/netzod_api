import { Injectable, Logger, UseInterceptors } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { logError } from '../lib/logger/logger';
import * as path from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PostLib } from './lib/post.lib';
import { User } from '../user';
import { Role } from '../role/entities/role.enum';
import { PostStatus } from './entities/post.status.enum';
import { Category } from '../category';

@Injectable()
@UseInterceptors()
export class PostService {
  logger: Logger = new Logger(PostService.name);

  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async isUserAuthorized(id: number, user: User): Promise<boolean> {
    const post = await this.postRepository.findOne({
      where: { id },
    });
    if (!post) {
      throw new HttpException('No post found', HttpStatus.NOT_FOUND);
    }
    return user.id === post.user_id || user.role_id === Role.ADMIN;
  }

  async create(createPostDto: CreatePostDto, req: any) {
    try {
      const post = PostLib.createPost(createPostDto, req);
      // return the newly created post with its relations category and user
      const newPost = await this.postRepository.save(post);
      return new Post(
        await this.postRepository.findOne({
          where: { id: newPost.id },
          relations: ['user', 'category.tags'],
        }),
      );
    } catch (error) {
      const currentFilePath = path.resolve(__filename);
      logError(this.logger, error, currentFilePath);
      throw new HttpException(
        {
          field: error.field,
          message: error.message,
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    try {
      const posts = await this.postRepository.find();

      return posts;
    } catch (error) {
      throw new HttpException(
        {
          field: 'posts',
          message: 'Une erreur est survenue lors de la récupération des posts',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'category'],
    });
    if (!post) {
      throw new HttpException('No post found', HttpStatus.NOT_FOUND);
    }
    return new Post(post);
  }

  /**
   *
   * @param id
   * @param updatePostDto
   * @param req
   * @returns {Promise<Post>}
   * @memberof PostService
   * @example PostService.update(id, updatePostDto, req);
   */
  async update(id: number, updatePostDto: UpdatePostDto) {
    try {
      const post = await this.postRepository.findOne({
        where: { id },
        relations: ['user', 'category'],
      });

      if (!post) {
        throw new HttpException('No post found', HttpStatus.NOT_FOUND);
      }

      if (updatePostDto.category_id) {
        const category = await this.categoryRepository.findOne({
          where: { id: updatePostDto.category_id },
        });
        if (!category) {
          throw new HttpException('No category found', HttpStatus.NOT_FOUND);
        }
        post.category = category;
      }

      return this.postRepository.save(PostLib.updatePost(post, updatePostDto));
    } catch (error) {
      const currentFilePath = path.resolve(__filename);
      logError(this.logger, error, currentFilePath);
      throw new HttpException(
        error.message ?? "Une erreur est survenue lors de l'enregistrement",
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    try {
      const post = await this.postRepository.findOne({ where: { id } });
      if (!post) {
        throw new HttpException('No post found', HttpStatus.NOT_FOUND);
      }
      return await this.postRepository.softRemove(post);
    } catch (error) {
      const currentFilePath = path.resolve(__filename);
      logError(this.logger, error, currentFilePath);
      throw new HttpException(
        error.message ?? 'Une erreur est survenue lors de la suppression',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ###############################################################
  // ##################### CUSTOM METHODS ##########################
  // ###############################################################

  async findFeaturedPosts() {
    try {
      const posts = this.postRepository
        .createQueryBuilder('post')
        .where('post.status = :status', { status: PostStatus.ACTIVE })
        .andWhere('post.published_at IS NOT NULL')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.category', 'category')
        .andWhere('user.id IS NOT NULL') // Assure que le post a un utilisateur associé
        .take(4)
        .orderBy('post.created_at', 'DESC')
        .getMany();

      return posts;
    } catch (error) {
      throw new HttpException(
        {
          field: 'posts',
          message: 'Une erreur est survenue lors de la récupération des posts',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPostsByCategory(categoryId: number) {
    try {
      const posts = await this.postRepository.find({
        where: { category_id: categoryId },
        order: { created_at: 'DESC' },
      });

      return posts;
    } catch (error) {
      throw new HttpException(
        {
          field: 'posts',
          message: 'Une erreur est survenue lors de la récupération des posts',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
