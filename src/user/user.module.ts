import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtService } from './jwt.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'your-secret-key', // In production, use environment variable
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtService],
  exports: [JwtService, JwtModule],
})
export class UserModule {}
