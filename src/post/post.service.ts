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

@Injectable()
@UseInterceptors()
export class PostService {
  logger: Logger = new Logger(PostService.name);

  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async create(createPostDto: CreatePostDto, req: any) {
    try {
      const post = PostLib.createPost(createPostDto, req);
      // return the newly created post with its relations category and user
      const newPost = await this.postRepository.save(post);
      return await this.postRepository.findOne({
        where: { id: newPost.id },
        relations: ['user', 'category.tags'],
      });
    } catch (error) {
      const currentFilePath = path.resolve(__filename);
      logError(this.logger, error, currentFilePath);
      throw new HttpException(
        error.message ?? "Une erreur est survenue lors de l'enregistrement",
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
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
      relations: ['user', 'category.tags'],
    });
    if (!post) {
      throw new HttpException('No post found', HttpStatus.NOT_FOUND);
    }
    return post;
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
  async update(id: number, updatePostDto: UpdatePostDto, req: any) {
    try {
      const post = await this.postRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!post) {
        throw new HttpException('No post found', HttpStatus.NOT_FOUND);
      }

      const user = await this.userRepository.findOne({
        where: { id: req.user.id },
      });

      if (user.id !== post.user.id && user.role_id !== Role.ADMIN) {
        throw new HttpException(
          "Vous n'êtes pas autorisé à modifier ce post",
          HttpStatus.UNAUTHORIZED,
        );
      }
      return await this.postRepository.save({ ...post, ...updatePostDto });
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
      const posts = await this.postRepository.find({
        take: 4,
        // TODO: choisir et definir la logique de selection des posts en vedette
        order: { created_at: 'DESC' },
        relations: ['category', 'user'],
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
