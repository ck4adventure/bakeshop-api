
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {
  constructor(
		private usersService: UsersService,
    private jwtService: JwtService,
		private configService: ConfigService
	) {}
	
  async signIn(username: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    const payload = { sub: user.userId, username: user.username };
		const secret = this.configService.get<string>('JWT_TOKEN');

    return {
      access_token: await this.jwtService.signAsync(payload, { secret }),
    };
  }
}
