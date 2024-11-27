import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { user } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number): Promise<user> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async updateProfile(
    userId: number,
    updateProfileDto: UpdateUserDto,
  ): Promise<user> {
    await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
    });
    return this.getProfile(userId);
  }
}
