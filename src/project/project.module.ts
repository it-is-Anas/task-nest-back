import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { Project } from './entities/project.entity';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../user/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, User]),
    JwtModule.register({
      secret: 'your-secret-key', // In production, use environment variable
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [ProjectController],
  providers: [ProjectService, JwtAuthGuard],
})
export class ProjectModule {}
