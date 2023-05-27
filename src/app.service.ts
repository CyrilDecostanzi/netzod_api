import { Injectable } from '@nestjs/common';

export interface TestResponse {
  message: string;
  status: number;
}

@Injectable()
export class AppService {
  getHello(): TestResponse {
    const response: TestResponse = {
      message: 'Test numero 2',
      status: 200,
    };
    return response;
  }
}
