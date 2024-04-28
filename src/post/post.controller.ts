import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { Roles } from '../lib/decorators/roles.decorator';
import { Role } from '../role/entities/role.enum';
import { Public } from '../lib/decorators/public.decorator';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: any,
  ) {
    return this.postService.update(+id, updatePostDto, req);
  }

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
  @Get('featured/cardlist')
  @Public()
  findFeaturedPosts() {
    return this.postService.findFeaturedPosts();
  }

  /**
   * Find posts by category
   * @returns {Promise<Post[]>} - 4 latest posts
   * @example /posts/latest/cardlist
   */
  @Get('category/:id')
  @Public()
  findPostsByCategory(@Param('id') id: string) {
    return this.postService.findPostsByCategory(+id);
  }
}
