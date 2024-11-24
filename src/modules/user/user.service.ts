import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { user as User } from '@prisma/client';
import Redlock from 'redlock';
import { Redis } from 'ioredis';
import { hashSync } from 'bcrypt';

@Injectable()
export class UserService {
  private redlock: Redlock;

  constructor(private readonly prisma: PrismaService) {
    const redisHost = process.env.REDIS_HOST || 'redis';
    const redisPort = parseInt(process.env.REDIS_PORT, 10) || 6379;
    const redis = new Redis({
      host: redisHost,
      port: redisPort,
    });
    this.redlock = new Redlock([redis], {
      driftFactor: 0.01,
      retryCount: 10,
      retryDelay: 200,
      retryJitter: 200,
    });
  }

  async getProfile(userId: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async createUser(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (user) {
      throw new ConflictException('User with this email already exists');
    }
    const newUser = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashSync(createUserDto.password, 10),
      },
    });

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // Distributed Locking with Redis
  async updateProfileDistributed(
    userId: number,
    updateProfileDto: UpdateUserDto,
  ): Promise<User> {
    const resource = `user:${userId}`;
    const ttl = 10000; // lock time-to-live in ms

    return this.redlock
      .using([resource], ttl, async () => {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        if (!user) {
          throw new NotFoundException(`User with ID ${userId} not found`);
        }

        await this.prisma.user.update({
          where: { id: userId },
          data: updateProfileDto,
        });

        return this.prisma.user.findUnique({ where: { id: userId } });
      })
      .catch((err) => {
        if (err.name === 'LockError') {
          throw new ConflictException('Could not acquire lock');
        }
        throw err;
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
