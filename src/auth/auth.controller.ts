
import { Body, Controller, Post,Get, Request, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Public } from './metadata';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@HttpCode(HttpStatus.OK)
	@Post('login')
	signIn(@Body() body: { username: string; password: string }) {
		// TODO add a handler for undefined body
		return this.authService.signIn(body.username, body.password);
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
