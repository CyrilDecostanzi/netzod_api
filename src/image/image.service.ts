import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Image } from './entities/image.entity';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import * as fs from 'fs';

@Injectable()
export class ImageService {
  logger = new Logger(ImageService.name);

  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  create(file: any, post_id: string, user_id: string) {
    console.log('user_id', user_id);

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
    console.log('image', image);
    if (image.post.user_id !== user_id) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    fs.unlinkSync(image.url);
    return await this.imageRepository.remove(image);
  }
}
