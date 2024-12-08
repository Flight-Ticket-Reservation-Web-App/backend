// src/modules/ticket/ticket.module.ts
import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
    imports: [PrismaModule, MailerModule],
    providers: [TicketService],
  exports: [TicketService]
})
export class TicketModule {}