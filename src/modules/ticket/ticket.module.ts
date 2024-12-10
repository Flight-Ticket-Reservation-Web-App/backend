import { Module } from '@nestjs/common';
import { TicketService } from '@/modules/ticket/ticket.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { TicketController } from '@/modules/ticket/ticket.controller';

@Module({
  imports: [PrismaModule, MailerModule],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}
