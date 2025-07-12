import {
  Body,
  Res,
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './metadata';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!body || !body.username || !body.password) {
      throw new BadRequestException('Username and password are required');
    }

    const { access_token } = await this.authService.signIn(
      body.username,
      body.password,
    );

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000, // 1 hour
    });

    return { status: 'ok' };
  }

  @Public()
  @Post('logout')
  signOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { status: 'signed out' };
  }

  @Get('profile')
  getProfile(@Req() req: Request & { user?: any }) {
    return req.user || { message: 'No user on request' };
  }

  @Public()
  @Get('greet')
  getGreeting() {
    return 'hi';
  }
}
