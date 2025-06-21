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
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('log-in')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    const token = req.headers.authorization.substring(7); // Remove 'Bearer ' prefix
    return this.userService.getProfile(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accept only image files

        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
    }),
  )
  async uploadImage(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|gif)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const userId = req.user.sub; // Get user ID from JWT payload
    const imagePath = `/uploads/${file.filename}`; // Path to access the image
    const result = await this.userService.uploadImage(userId, imagePath);
    return {
      message: 'Image uploaded successfully',
      imagePath: result.user.imgSrc,
      user: result.user,
    };
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('')
  update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.sub; // Get user ID from JWT payload
    return this.userService.update(userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  remove(@Request() req) {
    const userId = req.user.sub; // Get user ID from JWT payload
    return this.userService.remove(userId);
  }
}
