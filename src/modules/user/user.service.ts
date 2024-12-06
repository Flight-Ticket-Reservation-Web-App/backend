import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { Role, user as User } from '@prisma/client';
import { hashPasswordHelper } from '@/utils/helper';
import { CodeAuthDto, CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { ChangePassAuthDto, UpdateAuthDto } from '@/auth/dto/update-auth.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async handleChangePassword(data: ChangePassAuthDto) {
    const { email, newPassword } = data;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const currentTime = dayjs();
    if (dayjs(user.codeExpired).isBefore(currentTime)) {
      throw new ConflictException('Activation code has expired');
    }
    const newUserPassword = await hashPasswordHelper(newPassword);
    await this.prisma.user.update({
      where: { email },
      data: { password: newUserPassword },
    });
    return 'Password updated successfully';
  }
  async handleUpdatePassword(data: UpdateAuthDto) {
    const { email, id } = data;

    if (!email && !id) {
      throw new BadRequestException('Either email or id must be provided');
    }

    let user = null;

    if (email) {
      user = await this.prisma.user.findUnique({
        where: { email },
      });
    } else if (id) {
      user = await this.prisma.user.findUnique({
        where: { id },
      });
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const codeId = uuidv4();
    const codeExpired = dayjs().add(5, 'minutes').toISOString();

    await this.prisma.user.update({
      where: { email: user.email },
      data: {
        codeId,
        codeExpired,
      },
    });

    // Send an email with the new activation code
    this.mailerService.sendMail({
      to: user.email,
      subject: 'CHANGE YOUR MEMBERSHIP PASSWORD',
      template: 'register',
      context: {
        name: `${user.firstName} ${user.lastName}`,
        activationCode: codeId,
      },
    });

    return { id: user.id, email: user.email };
  }
  async handleReactivate(data: UpdateAuthDto) {
    const { email, id } = data;

    if (!email && !id) {
      throw new BadRequestException('Either email or id must be provided');
    }

    let user = null;

    if (email) {
      user = await this.prisma.user.findUnique({
        where: { email },
      });
    } else if (id) {
      user = await this.prisma.user.findUnique({
        where: { id },
      });
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const codeId = uuidv4();
    const codeExpired = dayjs().add(1, 'hour').toISOString();

    await this.prisma.user.update({
      where: { email: user.email },
      data: {
        codeId,
        codeExpired,
      },
    });

    // Send an email with the new activation code
    this.mailerService.sendMail({
      to: user.email,
      subject: 'WELCOME TO QAIRLINE, PLEASE ACTIVATE YOUR ACCOUNT',
      template: 'register',
      context: {
        name: `${user.firstName} ${user.lastName}`,
        activationCode: codeId,
      },
    });

    return { message: 'Confirmation email resent successfully' };
  }

  async handleActivate(data: CodeAuthDto) {
    const { id, email, code } = data;
    if (!email && !id) {
      throw new BadRequestException('Either email or id must be provided');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        ...(id ? { id } : {}),
        ...(email ? { email } : {}),
        codeId: code,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found or invalid activation code');
    }

    const currentTime = dayjs();
    if (dayjs(user.codeExpired).isBefore(currentTime)) {
      throw new ConflictException('Activation code has expired');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    return { message: 'User activated successfully' };
  }
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
