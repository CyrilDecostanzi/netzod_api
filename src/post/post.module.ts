import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from '../user';
import { Category } from '../category';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Category])],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
