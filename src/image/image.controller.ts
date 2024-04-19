import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { File } from 'buffer';
import { multerOptions } from './lib/image.lib';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  // @Public()
  @Post('post/:post_id')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async create(
    @UploadedFile() file: File,
    @Param('post_id') post_id: string,
    @Req() req: any,
  ) {
    if (!file) {
      throw new Error('Le format du fichier est invalide');
    }
    // Handle the file, save metadata to DB, etc.
    return this.imageService.create(file, post_id, req.user.sub);
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
    return this.imageService.remove(+id, req.user.sub);
  }
}
