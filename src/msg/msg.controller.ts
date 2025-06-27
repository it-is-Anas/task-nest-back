import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  UseGuards,
  Request,
  Param,
  Patch,
} from '@nestjs/common';
import { MsgService } from './msg.service';
import { CreateMsgDto } from './dto/create-msg.dto';
import { JwtAuthGuard } from '../user/jwt-auth.guard';
// import { UpdateMsgDto } from './dto/update-msg.dto';

interface RequestWithUser extends Request {
  user: {
    sub: number;
    email: string;
    iat: number;
    exp: number;
  };
}

@Controller('msg')
@UseGuards(JwtAuthGuard)
export class MsgController {
  constructor(private readonly msgService: MsgService) {}

  @Post()
  create(@Request() req: RequestWithUser, @Body() createMsgDto: CreateMsgDto) {
    const userId = req.user.sub; // Get user ID from JWT payload
    return this.msgService.create(createMsgDto, userId);
  }

  @Get()
  getMyMsgs(@Request() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.msgService.getMyMsgs(userId);
  }

  @Get('my-chats')
  getMyChats(@Request() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.msgService.getMyChats(userId);
  }

  @Get('my-chat/:id')
  getMyChat(@Request() req: RequestWithUser, @Param('id') id: number) {
    const userId = req.user.sub;
    return this.msgService.getMyChat(userId, id);
  }

  @Patch('delivered/:id')
  delivered(@Request() req: RequestWithUser, @Param('id') id: number) {
    const userId = req.user.sub;
    return this.msgService.delivered(userId, id);
  }

  @Patch('read/:id')
  read(@Request() req: RequestWithUser, @Param('id') id: number) {
    const userId = req.user.sub;
    return this.msgService.read(userId, id);
  }
}
