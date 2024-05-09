import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { User } from '../user';
import { Post } from '../post';

@Module({
  imports: [TypeOrmModule.forFeature([Image, User, Post])],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
