import { AppService, TestResponse } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): TestResponse;
}