import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task } from './entities/task.entity';
import { User } from '../user/entities/user.entity';
import { Project } from '../project/entities/project.entity';
import { JwtService } from '../user/jwt.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User, Project]),
    JwtModule.register({
      secret: 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [TaskController],
  providers: [TaskService, JwtService],
})
export class TaskModule {}
