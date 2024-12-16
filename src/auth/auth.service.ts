import { UserService } from '@/modules/user/user.service';
import { comparePasswordHelper } from '@/utils/helper';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CodeAuthDto, CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { ChangePassAuthDto, UpdateAuthDto } from '@/auth/dto/update-auth.dto';
import { CurrentUser } from '@/common/dto/currentUser';
import { Role } from '@/common/enums';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateJwtUser(id: number): Promise<any> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const currentUser: CurrentUser = {
      id: user.id,
      role: user.role as unknown as Role,
    };
    return currentUser;
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user) {
      return null;
    }
    const isValidPassword = await comparePasswordHelper(pass, user.password);
    if (isValidPassword) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user) {
      throw new UnauthorizedException();
    }
    const isValidPassword = await comparePasswordHelper(pass, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException();
    }
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id };
    return {
      id: user.id,
      email: user.email,
      username: user.firstName,
      isVerify: user.isActive,
      role: user.role,
      access_token: this.jwtService.sign(payload),
    };
  }

  handleRegister = async (registerDto: CreateAuthDto) => {
    return await this.usersService.handleRegister(registerDto);
  };

  checkCode = async (data: CodeAuthDto) => {
    return await this.usersService.handleActivate(data);
  };
  reactivate = async (data: UpdateAuthDto) => {
    return await this.usersService.handleReactivate(data);
  };

  updatePassword = async (data: UpdateAuthDto) => {
    return await this.usersService.handleUpdatePassword(data);
  };

  changePassword = async (data: ChangePassAuthDto) => {
    return await this.usersService.handleChangePassword(data);
  };

  async checkAdminEmail(email: string) {
    const admin = await this.usersService.findByEmail(email);
    if (!admin || admin.role !== Role.ADMIN) {
      return { isAdmin: false };
    }
    return { isAdmin: true };
  }
}
