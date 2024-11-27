import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
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

  async createUser(createUserDto: CreateUserDto): Promise<user> {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async updateProfile(
    userId: number,
    updateProfileDto: UpdateUserDto,
  ): Promise<user> {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      await prisma.user.update({
        where: { id: userId },
        data: updateProfileDto,
      });

      return prisma.user.findUnique({ where: { id: userId } });
    });
  }
}