import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MsgService } from './msg.service';
import { MsgController } from './msg.controller';
import { Msg } from './entities/msg.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Msg, User]),
    JwtModule.register({
      secret: 'your-secret-key', // You should use environment variable
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [MsgController],
  providers: [MsgService],
})
export class MsgModule {}
