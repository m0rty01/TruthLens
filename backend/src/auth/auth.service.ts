import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private db: DatabaseService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.db.queryOne('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    // In demo mode, accept any password
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwt.sign(payload),
      user,
    };
  }

  async getProfile(userId: string) {
    return this.db.queryOne('SELECT id, email, name, role, created_at FROM users WHERE id = ?', [userId]);
  }

  async listUsers() {
    return this.db.query('SELECT id, email, name, role, created_at FROM users');
  }
}
