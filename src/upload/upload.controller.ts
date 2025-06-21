import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Request,
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request as ExpressRequest } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { JwtService } from '../user/jwt.service';

@Controller('upload')
export class UploadController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Add file type validation
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: ExpressRequest,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const token = req.header('Authorization')?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const userId = this.jwtService.getUserIdFromToken(token);
      
      // Verify user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      user.imgSrc = file.path;
      await this.userRepository.save(user);
    
      
      return {
        message: 'File uploaded successfully!',
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        userId: userId,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'File upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
