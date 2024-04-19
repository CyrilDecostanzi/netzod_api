import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot(),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
