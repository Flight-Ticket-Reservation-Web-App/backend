import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  firstName?: string;
  lastName?: string;
}
