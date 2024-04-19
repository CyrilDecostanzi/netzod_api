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

@Injectable()
export class CommentService {
  logger: Logger = new Logger(CommentService.name);

  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto, req: any) {
    try {
      const comment = CommentLib.createComment(createCommentDto, req);
      const newComment = await this.commentRepository.save(comment);
      return await this.commentRepository.findOne({
        where: { id: newComment.id },
        relations: ['user', 'post'],
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
      return await this.commentRepository.softDelete(comment);
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
