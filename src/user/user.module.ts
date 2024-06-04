import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsEmailUniqueValidator } from '../lib/validators/email-validator';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), MailModule],
  controllers: [UserController],
  providers: [UserService, IsEmailUniqueValidator],
  exports: [UserService],
})
export class UserModule {}
