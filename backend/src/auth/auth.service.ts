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
    const sqlite = this.db.getDatabase();
    const user = sqlite.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
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
    const sqlite = this.db.getDatabase();
    return sqlite.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(userId);
  }

  async listUsers() {
    const sqlite = this.db.getDatabase();
    return sqlite.prepare('SELECT id, email, name, role, created_at FROM users').all();
  }
}
