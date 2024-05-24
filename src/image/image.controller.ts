import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Req,
  SerializeOptions,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  UploadedFile,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { File } from 'buffer';
import { avatarMulterOptions, multerOptions } from './lib/image.lib';

@Controller('images')
@UseInterceptors(ClassSerializerInterceptor)
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('post/:post_id')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async create(@UploadedFile() file: File, @Param('post_id') post_id: string) {
    if (!file) {
      throw new Error('Le format du fichier est invalide');
    }
    // Handle the file, save metadata to DB, etc.
    return this.imageService.create(file, post_id);
  }

  @Post('post/cover/:post_id')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async updateCover(
    @UploadedFile() file: File,
    @Param('post_id') post_id: string,
  ) {
    if (!file) {
      throw new Error('Le format du fichier est invalide');
    }
    // Handle the file, save metadata to DB, etc.
    return this.imageService.updateCover(file, post_id);
  }

  @SerializeOptions({
    groups: ['auth'],
  })
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', avatarMulterOptions))
  async uploadAvatar(@UploadedFile() avatar: File, @Req() req: any) {
    if (!avatar) {
      throw new Error('Le format du fichier est invalide');
    }

    // Handle the file, save metadata to DB, etc.
    return this.imageService.uploadAvatar(avatar, req.user);
  }

  @Get()
  findAll() {
    return this.imageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.imageService.update(+id);
  }

  @Delete(':id')
  // eslint-disable-next-line
  async remove(@Param('id') id: string, @Req() req: any) {
    // remove the file from the file system and the metadata from the DB
    return this.imageService.remove(+id, req.user.id);
  }
}
