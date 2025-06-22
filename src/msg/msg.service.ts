import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateMsgDto } from './dto/create-msg.dto';
import { Msg } from './entities/msg.entity';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MsgService {
  constructor(
    @InjectRepository(Msg)
    private msgRepository: Repository<Msg>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(createMsgDto: CreateMsgDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const recipient = await this.userRepository.findOne({
      where: { id: parseInt(createMsgDto.to) },
    });
    if (!recipient) {
      throw new Error('Recipient not found');
    }

    const message = new Msg();
    message.msg = createMsgDto.msg;
    message.from = user;
    message.to = recipient;
    message.seen = createMsgDto.seen ?? false;
    message.delivered = createMsgDto.delivered ?? false;
    message.createdAt = new Date();
    message.updatedAt = new Date();
    const savedMsg = await this.msgRepository.save(message);
    return savedMsg;
  }

  async getMyMsgs(userId: number) {
    const messages = await this.msgRepository.find({
      where: [{ from: { id: userId } }, { to: { id: userId } }],
      relations: ['from', 'to'],
      order: { createdAt: 'DESC' },
    });

    return {
      msg: 'my messages',
      data: messages,
    };
  }

  async getMyChats(userId: number) {
    const chats = await this.msgRepository.query(
      `SELECT 
        m.id,
        m.msg,
        m.createdAt,
        u.id as to_id,
        u.firstName,
        u.lastName,
        u.imgSrc
      FROM msg m
      INNER JOIN user u ON m.\`to\` = u.id
      INNER JOIN (
        SELECT 
          \`to\` as receiver_id,
          MAX(createdAt) as latest_time
        FROM msg 
        WHERE \`from\` = ?
        GROUP BY \`to\`
      ) latest ON m.\`to\` = latest.receiver_id AND m.createdAt = latest.latest_time
      WHERE m.\`from\` = ?
      ORDER BY m.createdAt DESC`,
      [userId, userId]
    );

    const reciveChats = await this.msgRepository.query(
      `SELECT 
        m.id,
        m.msg,
        m.createdAt,
        u.id as from_id,
        u.firstName,
        u.lastName,
        u.imgSrc
      FROM msg m
      INNER JOIN user u ON m.\`from\` = u.id
      INNER JOIN (
        SELECT 
          \`from\` as sender_id,
          MAX(createdAt) as latest_time
        FROM msg 
        WHERE \`to\` = ?
        GROUP BY \`from\`
      ) latest ON m.\`from\` = latest.sender_id AND m.createdAt = latest.latest_time
      WHERE m.\`to\` = ?
      ORDER BY m.createdAt DESC`,
      [userId, userId]
    );

    return {
      msg: 'my chats',
      data: [...chats, ...reciveChats]
    };
  }

  async getMyChat(userId: number,id:number) {
    const chats = await this.msgRepository.query(
      `SELECT * FROM msg WHERE \`from\` = ? AND \`to\` = ? ORDER BY id DESC`,
      [userId,id]
    );
    const chats2 = await this.msgRepository.query(
      `SELECT * FROM msg WHERE \`to\` = ? AND \`from\` = ? ORDER BY id DESC`,
      [userId,id]
    );
    return [...chats, ...chats2];
  }

  async delivered(userId: number,id:number) {
    const msg = await this.msgRepository.findOne({ where: { id, to: { id: userId } } });
    if (!msg) {
      throw new Error('Message not found');
    }
    msg.delivered = true;
    await this.msgRepository.save(msg);
    return msg;
  }



  async read(userId: number,id:number) {
    const msg = await this.msgRepository.findOne({ where: { id, to: { id: userId } } });
    if (!msg) {
      throw new Error('Message not found');
    }
    msg.seen = true;
    await this.msgRepository.save(msg);
    return msg;
  }
  
  
}
