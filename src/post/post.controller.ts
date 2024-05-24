import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { Roles } from '../lib/decorators/roles.decorator';
import { Role } from '../role/entities/role.enum';
import { Public } from '../lib/decorators/public.decorator';
import { PostGuard } from './post.guard';
import { Post as PostEntity } from './entities/post.entity';

@Controller('posts')
@UseInterceptors(ClassSerializerInterceptor)
export class PostController {
  constructor(private readonly postService: PostService) {}

  // ##############################################################
  // ######################## CRUD ROUTES #########################
  // ##############################################################

  @Post()
  create(@Body() createPostDto: CreatePostDto, @Req() req: any) {
    return this.postService.create(createPostDto, req);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.postService.findAll();
  }

  @UseGuards(PostGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @UseGuards(PostGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req,
  ) {
    return this.postService.update(+id, updatePostDto, req);
  }

  @UseGuards(PostGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }

  // ##############################################################
  // ######################## CUSTOM ROUTES #######################
  // ##############################################################

  /**
   * Find 4 featured posts for the home page
   * @returns {Promise<Post[]>} - 4 featured posts
   * @example /posts/featured/cardlist
   */
  @Get('featured/list')
  @Public()
  findFeaturedPosts(): Promise<PostEntity[]> {
    return this.postService.findFeaturedPosts();
  }

  /**
   * Find 4 latest posts for the home page
   * @returns {Promise<Post[]>} - 4 latest posts
   * @example /posts/latest/cardlist
   */
  @Get('latest/list')
  @Public()
  findLatestPosts(): Promise<PostEntity[]> {
    return this.postService.findLatestPosts();
  }

  /**
   * Find posts by category
   * @returns {Promise<Post[]>} - 4 latest posts
   * @example /posts/latest/cardlist
   */
  @Get('category/:id')
  @Public()
  findPostsByCategory(@Param('id') id: string): Promise<PostEntity[]> {
    return this.postService.findPostsByCategory(+id);
  }

  @Get('user/list')
  findPostsByUser(@Req() req) {
    return this.postService.findPostsByUser(+req.user.id);
  }

  @Get('detail/:slug')
  @Public()
  findBySlug(@Param('slug') slug: string) {
    return this.postService.findBySlug(slug);
  }

  @UseGuards(PostGuard)
  @Patch('desactivate/:id')
  desactivate(@Param('id') id: string) {
    return this.postService.desactivate(+id);
  }
}
