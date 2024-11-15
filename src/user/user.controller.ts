import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.userService.getProfile(+id);
  }

  @Patch(':id')
  updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(+id, updateProfileDto);
  }
}
