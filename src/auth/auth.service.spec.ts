import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findOne: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    usersService = { findOne: jest.fn() };
    jwtService = { signAsync: jest.fn().mockResolvedValue('signed-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('test-secret') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('signIn returns access_token on valid credentials', async () => {
    const hash = await bcrypt.hash('correct-pass', 10);
    usersService.findOne.mockResolvedValue({
      id: 'uuid-1',
      username: 'baker',
      passwordHash: hash,
      role: 'BAKER',
      bakery: { slug: 'demo-bakery' },
    });

    const result = await service.signIn('baker', 'correct-pass');
    expect(result).toEqual({ access_token: 'signed-token' });
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { sub: 'uuid-1', username: 'baker', role: 'BAKER', bakerySlug: 'demo-bakery' },
      { secret: 'test-secret' },
    );
  });

  it('signIn throws UnauthorizedException if user not found', async () => {
    usersService.findOne.mockResolvedValue(null);
    await expect(service.signIn('nobody', 'pass')).rejects.toThrow(UnauthorizedException);
  });

  it('signIn throws UnauthorizedException on wrong password', async () => {
    const hash = await bcrypt.hash('correct-pass', 10);
    usersService.findOne.mockResolvedValue({
      id: 'uuid-1',
      username: 'baker',
      passwordHash: hash,
      role: 'BAKER',
      bakery: { slug: 'demo-bakery' },
    });
    await expect(service.signIn('baker', 'wrong-pass')).rejects.toThrow(UnauthorizedException);
  });
});
