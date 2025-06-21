import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  constructor(private jwtService: NestJwtService) {}

  generateToken(userId: number, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  getUserIdFromToken(token: string): number {
    const payload = this.verifyToken(token);
    return payload.sub;
  }
}
