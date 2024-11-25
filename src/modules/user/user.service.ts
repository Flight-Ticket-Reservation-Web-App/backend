import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/user/dto/update-user.dto';
import { Role, user as User } from '@prisma/client';
import { hashPasswordHelper } from '@/utils/helper';
import { CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async handleRegister(registerDto: CreateAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: registerDto.username },
    });
    if (user) {
      throw new ConflictException('User with this email already exists');
    }
    const hashPassWord = await hashPasswordHelper(registerDto.password);
    const codeId = uuidv4();
    const newUser = await this.prisma.user.create({
      data: {
        email: registerDto.username,
        password: hashPassWord,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        isActive: false,
        codeId: codeId,
        codeExpired: dayjs().add(5, 'minutes').toISOString(),
      },
    });
    // send email
    this.mailerService.sendMail({
      to: newUser.email,
      subject: 'WELCOME TO QAIRLINE, PLEASE ACTIVATE YOUR ACCOUNT',
      template: 'register',
      context: {
        name: `${newUser.firstName} ${newUser.lastName}`,
        activationCode: codeId,
      },
    });
    const { password, ...userWithoutPassword } = newUser;

    return { userId: newUser.id };
  }
  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }
  async createUser(createUserDto: CreateUserDto) {
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
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role as Role,
        password: hashPassWord,
        codeId: uuidv4(),
        codeExpired: dayjs().add(1, 'minute').toISOString(),
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
