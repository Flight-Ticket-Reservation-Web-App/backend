import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { LocalAuthGuard } from '@/auth/passport/local-auth.guard';
import { Public } from '@/decorator/public-decorator';
import { CodeAuthDto, CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { ChangePassAuthDto, UpdateAuthDto } from '@/auth/dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('register')
  @Public()
  async register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }

  @Post('checkCode')
  @Public()
  async checkCode(@Body() checkCodeDto: CodeAuthDto) {
    return this.authService.checkCode(checkCodeDto);
  }

  @Post('reactivate')
  @Public()
  async reactivate(@Body() data: UpdateAuthDto) {
    if (!data.email && !data.id) {
      throw new BadRequestException('Either email or id must be provided');
    }
    return this.authService.reactivate(data);
  }

  @Post('updatePassword')
  @Public()
  async updatePassword(@Body() data: UpdateAuthDto) {
    if (!data.email && !data.id) {
      throw new BadRequestException('Either email or id must be provided');
    }
    return this.authService.updatePassword(data);
  }

  @Post('changePassword')
  @Public()
  async changePassword(@Body() data: ChangePassAuthDto) {
    return this.authService.changePassword(data);
  }
}
