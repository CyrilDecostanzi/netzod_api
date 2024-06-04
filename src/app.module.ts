import {
  Module,
  NestModule,
  RequestMethod,
  MiddlewareConsumer,
} from '@nestjs/common';
import { AttachUserMiddleware } from './attach-user.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  UserModule,
  PostModule,
  TagModule,
  ImageModule,
  CategoryModule,
  CommentModule,
  AuthModule,
} from './';
import { getTypeOrmConfig } from './ormconfig';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    UserModule,
    PostModule,
    TagModule,
    ImageModule,
    CategoryModule,
    CommentModule,
    AuthModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AttachUserMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
