import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService, TestResponse } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return { message: "Test numero 2", status: 200 }', () => {
      const response: TestResponse = {
        message: 'Test numero 2',
        status: 200,
      };

      expect(appController.getHello()).toEqual(response);
    });
  });
});
