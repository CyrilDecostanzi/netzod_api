import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Image } from './entities/image.entity';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import * as fs from 'fs';
import { User } from '../user';
import { Post } from '../post';

@Injectable()
export class ImageService {
  logger = new Logger(ImageService.name);

  constructor(
    @InjectRepository(Image) private imageRepository: Repository<Image>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async create(file: any, post_id: string) {
    // save image url to DB and the id of the post
    try {
      const image = new Image({
        url: file.path,
        post_id: parseInt(post_id),
      });
      return this.imageRepository.save(image);
    } catch (error) {
      this.logger.error(error);
      throw new Error("Erreur lors de l'enregistrement de l'image");
    }
  }

  async updateCover(file: any, post_id: string) {
    // save image url to DB and the id of the post
    try {
      const t_post = await this.postRepository.findOne({
        where: { id: +post_id },
      });

      if (t_post.cover) {
        // delete old cover file if exists
        fs.unlinkSync(t_post.cover);
      }

      const post = await this.postRepository.save({
        ...t_post,
        cover: file.path,
      });

      return new Post(post);
    } catch (error) {
      this.logger.error(error);
      throw new Error("Erreur lors de l'enregistrement de l'image");
    }
  }

  async uploadAvatar(file: any, user: User) {
    try {
      const path = file.path;

      const t_user = await this.userRepository.findOne({
        where: { id: +user.id },
      });

      if (t_user.avatar) {
        // delete old avatar file if exists
        fs.unlinkSync(t_user.avatar);
      }

      const plainUser = await this.userRepository.save({
        ...t_user,
        avatar: path,
      });

      return new User(plainUser);
    } catch (error) {
      this.logger.error(error);
      throw new Error("Erreur lors de l'enregistrement de l'image");
    }
  }

  findAll() {
    return `This action returns all image`;
  }

  async findOne(id: number) {
    const image = await this.imageRepository.findOne({
      where: { id },
      relations: ['post'],
    });
    if (!image) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
    return image;
  }

  update(id: number) {
    return `This action updates a #${id} image`;
  }

  async remove(id: number, user_id: number) {
    const image = await this.findOne(id);
    if (image.post.user_id !== user_id) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    // delete image file from disk
    fs.unlinkSync(image.url);
    return await this.imageRepository.remove(image);
  }
}
