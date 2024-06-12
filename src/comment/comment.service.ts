import { Injectable, Logger } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentLib } from './lib/comment.lib';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { logError } from '../lib/logger/logger';
import * as path from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Post } from '../post';
import { CommentStatus } from './entities/comment.status.enum';
import { User } from '../user';

@Injectable()
export class CommentService {
  logger: Logger = new Logger(CommentService.name);

  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async isUserAuthorized(id: number, user: User): Promise<boolean> {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });
    if (!comment) {
      throw new HttpException('No comment found', HttpStatus.NOT_FOUND);
    }
    return user.id === comment.user_id;
  }

  async create(createCommentDto: CreateCommentDto, req: any) {
    try {
      const postToComment = await this.postRepository.findOne({
        where: { slug: createCommentDto.slug },
      });

      const comment = CommentLib.createComment(createCommentDto, req);
      comment.post_id = postToComment.id;
      const newComment = await this.commentRepository.save(comment);
      return await this.commentRepository.findOne({
        where: { id: newComment.id },
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
    const comment = await this.commentRepository.find();
    if (!comment) {
      throw new HttpException('No categories found', HttpStatus.NOT_FOUND);
    }
    return comment;
  }

  async findOne(id: number) {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new HttpException('No category found', HttpStatus.NOT_FOUND);
    }
    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    try {
      const comment = await this.commentRepository.findOne({ where: { id } });
      if (!comment) {
        throw new HttpException('No comment found', HttpStatus.NOT_FOUND);
      }

      return await this.commentRepository.save({
        ...comment,
        ...updateCommentDto,
      });
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
      const comment = await this.commentRepository.findOne({ where: { id } });
      if (!comment) {
        throw new HttpException('No comment found', HttpStatus.NOT_FOUND);
      }
      return await this.commentRepository.softDelete(comment.id);
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

  async getCommentsByPostSlug(
    slug: string,
    page: number,
    limit: number,
  ): Promise<any> {
    try {
      const post = await this.postRepository.findOne({
        where: { slug: slug },
      });

      if (!post) {
        throw new HttpException('No post found', HttpStatus.NOT_FOUND);
      }

      const [comments, total] = await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .where('comment.post = :postId', { postId: post.id })
        .andWhere('comment.status = :status', {
          status: CommentStatus.ACTIVE,
        })
        .orderBy('comment.created_at', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        data: comments,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new HttpException(
        {
          field: 'comments',
          message:
            'Une erreur est survenue lors de la récupération des commentaires',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCommentsReceviedByUserPosts(
    userId: number,
    page: number,
    limit: number,
  ): Promise<any> {
    try {
      const [comments, total] = await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.post', 'post')
        .leftJoinAndSelect('comment.user', 'user')
        .where('post.user = :userId', { userId })
        .orderBy('comment.created_at', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        data: comments,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
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
}
