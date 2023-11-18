import { Injectable, Logger, UseInterceptors } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { logError } from '../lib/logger/logger';
import * as path from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PostHelper } from './helpers/post.helper';

@Injectable()
@UseInterceptors()
export class PostService {
  logger: Logger = new Logger(PostService.name);

  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}
  async create(createPostDto: CreatePostDto, req: any) {
    try {
      const post = PostHelper.createPost(createPostDto, req);
      return await this.postRepository.save(post);
    } catch (error) {
      const currentFilePath = path.resolve(__filename);
      logError(this.logger, error, currentFilePath);
      const message = "Une erreur est survenue lors de l'enregistrement";
      throw new HttpException(
        error.message ?? message,
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const posts = await this.postRepository.find();
    if (!posts) {
      throw new HttpException('No posts found', HttpStatus.NOT_FOUND);
    }
    return posts;
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

  async update(id: number, updatePostDto: UpdatePostDto) {
    try {
      const post = await this.postRepository.findOne({ where: { id } });
      if (!post) {
        throw new HttpException('No post found', HttpStatus.NOT_FOUND);
      }
      return await this.postRepository.save({ ...post, ...updatePostDto });
    } catch (error) {
      const currentFilePath = path.resolve(__filename);
      logError(this.logger, error, currentFilePath);
      const message = "Une erreur est survenue lors de l'enregistrement";
      throw new HttpException(
        error.message ?? message,
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
      const message = 'Une erreur est survenue lors de la suppression';
      throw new HttpException(
        error.message ?? message,
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
