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

  MAXLimit = 50;

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
      const postLib = new PostLib(this.postRepository);
      const post = await postLib.createPost(createPostDto, req);

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

  async update(id: number, updatePostDto: UpdatePostDto, req: any) {
    try {
      const post = await this.postRepository.findOne({
        where: { id },
        relations: ['user', 'category', 'liked_by'],
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

      if (updatePostDto.published_at) {
        const user = await this.userRepository.findOne({
          where: { id: req.user.id },
        });
        post.published_at = updatePostDto.published_at;
        post.status =
          user.role_id === Role.ADMIN
            ? PostStatus.ACTIVE
            : PostStatus.AWAITING_APPROVAL;
      }

      const postLib = new PostLib(this.postRepository);

      return this.postRepository.save(
        await postLib.updatePost(post, updatePostDto),
      );
    } catch (error) {
      const currentFilePath = path.resolve(__filename);
      logError(this.logger, error, currentFilePath);
      throw new HttpException(
        error.message ?? "Une erreur est survenue lors de l'enregistrement",
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    category = null,
  ): Promise<{
    data: Post[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    try {
      limit = Math.min(limit, this.MAXLimit); // Assure la limite maximale
      const [results, total] = await this.postRepository.findAndCount({
        relations: ['user', 'category', 'liked_by'],
        where: category
          ? { category_id: category, status: PostStatus.ACTIVE }
          : { status: PostStatus.ACTIVE },
        order: { published_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        data: results,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
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
      relations: ['user', 'category', 'liked_by'],
    });
    if (!post) {
      throw new HttpException('No post found', HttpStatus.NOT_FOUND);
    }
    return new Post(post);
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
        .andWhere('post.featured = :featured', { featured: true })
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.category', 'category')
        .leftJoinAndSelect('post.liked_by', 'liked_by')
        .andWhere('user.id IS NOT NULL') // Assure que le post a un utilisateur associé
        .orderBy('post.published_at', 'DESC')
        .take(4)
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

  async findLatestPosts() {
    try {
      const posts = this.postRepository
        .createQueryBuilder('post')
        .where('post.status = :status', { status: PostStatus.ACTIVE })
        .andWhere('post.published_at IS NOT NULL')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.category', 'category')
        .leftJoinAndSelect('post.liked_by', 'liked_by')
        .andWhere('user.id IS NOT NULL') // Assure que le post a un utilisateur associé
        .orderBy('post.published_at', 'DESC')
        .take(4)
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
        where: { category_id: categoryId, status: PostStatus.ACTIVE },
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

  async findPostsByUser(userId: number, page: number, limit: number) {
    try {
      // const posts = await this.postRepository.find({
      //   where: { user_id: userId },
      //   order: { created_at: 'DESC' },
      // });

      limit = Math.min(limit, this.MAXLimit); // Assure la limite maximale
      const [results, total] = await this.postRepository.findAndCount({
        where: { user_id: userId },
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        data: results,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
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

  async findBySlug(slug: string, user: any) {
    try {
      const query = this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.category', 'category')
        .leftJoinAndSelect('post.liked_by', 'liked_by')
        .where('post.slug = :slug', { slug });

      if (user) {
        query.andWhere(
          '(post.status = :status OR post.user.id = :userId OR :userRole = :adminRole)',
          {
            status: PostStatus.ACTIVE,
            userId: user.id,
            adminRole: Role.ADMIN,
            userRole: user.role_id,
          },
        );
      } else {
        query.andWhere('post.status = :status', { status: PostStatus.ACTIVE });
      }

      const post = await query.getOne();
      if (!post) {
        throw new HttpException('No post found', HttpStatus.NOT_FOUND);
      }

      return new Post(post);
    } catch (error) {
      throw new HttpException(
        {
          field: 'posts',
          message: 'Une erreur est survenue lors de la récupération des posts',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async desactivate(id: number) {
    try {
      const post = await this.postRepository.findOne({ where: { id } });
      if (!post) {
        throw new HttpException('No post found', HttpStatus.NOT_FOUND);
      }
      post.status = PostStatus.INACTIVE;
      return await this.postRepository.save(post);
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

  async likePost(userId: number, postId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['liked_by'],
    });

    if (!post.liked_by.includes(user)) {
      post.liked_by.push(user);
      return await this.postRepository.save(post);
    }
  }

  async unlikePost(userId: number, postId: number) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['liked_by'],
    });

    post.liked_by = post.liked_by.filter((u) => u.id !== userId);
    return await this.postRepository.save(post);
  }
}
