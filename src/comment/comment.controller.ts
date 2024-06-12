import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Public } from '../lib/decorators/public.decorator';

@Controller('comment')
@UseInterceptors(ClassSerializerInterceptor)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Req() req: any) {
    return this.commentService.create(createCommentDto, req);
  }

  @Get()
  findAll() {
    return this.commentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }

  @Get('post/:slug')
  @Public()
  getCommentsByPostSlug(
    @Param('slug') slug: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.commentService.getCommentsByPostSlug(slug, page, limit);
  }

  @Get('user/all')
  @Public()
  getCommentsReceviedByUserPosts(
    @Req() req: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.commentService.getCommentsReceviedByUserPosts(
      req.user.id,
      page,
      limit,
    );
  }
}
