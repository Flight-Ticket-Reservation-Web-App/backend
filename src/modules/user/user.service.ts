import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/user/dto/update-user.dto';
import { user as User } from '@prisma/client';
import { hashPasswordHelper } from '@/utils/helper';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }
  async createUser(createUserDto: CreateUserDto) {
    console.log('createUserDto', createUserDto);
    const user = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (user) {
      throw new ConflictException('User with this email already exists');
    }
    const hashPassWord = await hashPasswordHelper(createUserDto.password);
    const newUser = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashPassWord,
      },
    });
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async getProfile(userId: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }
}
