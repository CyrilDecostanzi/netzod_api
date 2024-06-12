import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../user';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, token: string) {
    const url = `${process.env.FRONT_URL}/confirm/${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: 'Netzod <noreply@netzod.fr>',
      subject: 'Bienvenue sur Netzod.fr',
      template: './confirmation',
      context: {
        name: user.username,
        url,
      },
    });
  }

  async handleContactForm(body: any) {
    await this.mailerService.sendMail({
      to: process.env.MAIL_USER,
      from: body.email,
      subject: body.object,
      template: './contact',
      context: {
        email: body.email,
        firstname: body.firstname,
        lastname: body.lastname,
        mobile: body.mobile,
        company: body.company,
        object: body.object,
        message: body.message,
      },
    });

    return { message: 'Message sent' };
  }
}
