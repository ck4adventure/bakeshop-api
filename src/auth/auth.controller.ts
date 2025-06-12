
import { Body, Res, Controller, Post, Get, Request, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Public } from './metadata';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('login')
	async signIn(
		@Body() body: { username: string; password: string },
		@Res({ passthrough: true }) res: Response
	) {
		// TODO add a handler for undefined body
		const { access_token } = await this.authService.signIn(body.username, body.password);
		res.cookie('access_token', access_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 3600000, // 1 hour, optional
		});
		return { status: "ok" }
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




	// @UseGuards(AuthGuard)
	@Get('profile')
	getProfile(@Request() req: any) {
		return req.user;
	}

	@Public()
	@Get('greet')
	getGreeting() {
		return "hi";
	}
}
