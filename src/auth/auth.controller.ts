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
import { CodeAuthDto, CreateAuthDto } from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  //@UseGuards(JwtAuthGuard)
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
  // @Get('mail')
  // @Public()
  // testMail() {
  //   this.mailerService.sendMail({
  //     to: 'nguyethang083@gmail.com',
  //     subject: 'Testing Nest MailerModule ✔',
  //     text: 'welcome',
  //     template: 'register',
  //     context: {
  //       name: 'Hang',
  //       activationCode: 123456,
  //     },
  //   });
  //   return 'ok';
  // }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
