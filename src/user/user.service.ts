import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { user as User } from '@prisma/client';

@Injectable()
export class UserService {
  [x: string]: any;
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  // Optimistic Locking
  async updateProfileOptimistic(
    userId: number,
    updateProfileDto: UpdateUserDto,
  ): Promise<User> {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const updatedUser = await prisma.user.updateMany({
        where: {
          id: userId,
        },
        data: {
          ...updateProfileDto,
        },
      });

      if (updatedUser.count === 0) {
        throw new ConflictException('User was updated by another transaction');
      }

      return prisma.user.findUnique({ where: { id: userId } });
    });
  }

  // Pessimistic Locking
  async updateProfilePessimistic(
    userId: number,
    updateProfileDto: UpdateUserDto,
  ): Promise<User> {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Lock the user record for update
      await prisma.$executeRaw`SELECT 1 FROM "user" WHERE id = ${userId} FOR UPDATE`;

      await prisma.user.update({
        where: { id: userId },
        data: updateProfileDto,
      });

      return prisma.user.findUnique({ where: { id: userId } });
    });
  }
}
