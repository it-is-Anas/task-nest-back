import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private extractUserIdFromToken(authHeader: string): number {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token is required');
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token || token.trim() === '') {
      throw new UnauthorizedException('Token cannot be empty');
    }
    
    try {
      return this.userService.getUserIdFromToken(token);
    } catch (error) {
      throw new UnauthorizedException(`Invalid token: ${error.message}`);
    }
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('log-in')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Get('profile')
  getProfile(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token is required');
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    return this.userService.getProfile(token);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch('') 
  update(@Headers('authorization') authHeader: string, @Body() updateUserDto: UpdateUserDto) {
    const userId = this.extractUserIdFromToken(authHeader);
    return this.userService.update(userId, updateUserDto);
  }

  @Delete()
  remove(@Headers('authorization') authHeader: string) {
    const userId = this.extractUserIdFromToken(authHeader);
    return this.userService.remove(userId);
  }

 
}
