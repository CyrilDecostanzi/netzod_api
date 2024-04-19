import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { logError } from '../lib/logger/logger';
import * as path from 'path';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TagService {
  logger = new Logger(TagService.name);

  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto) {
    try {
      const tag = new Tag(createTagDto);
      return await this.tagRepository.save(tag);
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
    const tags = await this.tagRepository.find();
    if (!tags) {
      throw new HttpException('No tags found', HttpStatus.NOT_FOUND);
    }
    return tags;
  }

  async findOne(id: number) {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new HttpException('No tag found', HttpStatus.NOT_FOUND);
    }
    return tag;
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    try {
      const tag = await this.tagRepository.findOne({ where: { id } });
      if (!tag) {
        throw new HttpException('No tag found', HttpStatus.NOT_FOUND);
      }
      return await this.tagRepository.save({
        ...tag,
        ...updateTagDto,
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
      const tag = await this.tagRepository.findOne({ where: { id } });
      if (!tag) {
        throw new HttpException('No tag found', HttpStatus.NOT_FOUND);
      }
      return await this.tagRepository.softRemove(tag);
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
