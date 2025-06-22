import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { UploadController } from './upload/upload.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from './user/jwt.service';
import { MsgModule } from './msg/msg.module';
import { Msg } from './msg/entities/msg.entity';
import { ProjectModule } from './project/project.module';
import { Project } from './project/entities/project.entity';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'task_nest',
      entities: [User, Msg, Project],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'your-secret-key', // In production, use environment variable
      signOptions: { expiresIn: '24h' },
    }),
    UserModule,
    MsgModule,
    ProjectModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService, JwtService],
})
export class AppModule {}
