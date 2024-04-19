import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateCategoryDto {
  name: string;
  description: string;
  parent_id: number;
}
