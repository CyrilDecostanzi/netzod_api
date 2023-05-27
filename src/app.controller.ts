import { Controller, Get } from '@nestjs/common';
import { AppService, TestResponse } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): TestResponse {
    return this.appService.getHello();
  }
}
