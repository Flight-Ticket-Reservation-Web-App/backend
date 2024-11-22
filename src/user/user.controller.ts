import { Controller, Get, Patch, Post, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.userService.getProfile(+id);
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Patch('optimistic/:id')
  updateProfileOptimistic(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateUserDto,
  ) {
    return this.userService.updateProfileOptimistic(+id, updateProfileDto);
  }

  @Patch('pessimistic/:id')
  updateProfilePessimistic(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateUserDto,
  ) {
    return this.userService.updateProfilePessimistic(+id, updateProfileDto);
  }
  @Patch('distributed/:id')
  updateProfileDistributed(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateUserDto,
  ) {
    return this.userService.updateProfileDistributed(+id, updateProfileDto);
  }
}
