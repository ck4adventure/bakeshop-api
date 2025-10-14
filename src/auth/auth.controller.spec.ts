/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let mockRes: Pick<Response, 'cookie' | 'clearCookie'>;

  beforeEach(async () => {
    mockRes = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    const mockAuthService = {
      signIn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should throw BadRequestException if username or password missing', async () => {
      await expect(
        controller.signIn(
          { username: '', password: '' },
          mockRes as unknown as Response,
        ),
      ).rejects.toThrow(BadRequestException);

      await expect(
        controller.signIn(
          { username: 'user', password: '' },
          mockRes as unknown as Response,
        ),
      ).rejects.toThrow(BadRequestException);

      await expect(
        controller.signIn(
          { username: '', password: 'pass' },
          mockRes as unknown as Response,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call authService.signIn and set cookie', async () => {
      jest
        .spyOn(authService, 'signIn')
        .mockResolvedValue({ access_token: 'token' });

      const body = { username: 'user', password: 'pass' };
      const result = await controller.signIn(
        body,
        mockRes as unknown as Response,
      );

      expect(authService.signIn).toHaveBeenCalledWith('user', 'pass');
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        'token',
        expect.any(Object),
      );
      expect(result).toEqual({ status: 'ok' });
    });
  });

  describe('signOut', () => {
    it('should clear access_token cookie and return status', () => {
      const result = controller.signOut(mockRes as unknown as Response);
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.any(Object),
      );
      expect(result).toEqual({ status: 'signed out' });
    });
  });

  describe('getProfile', () => {
    it('should return user from request', () => {
      const req = { user: { id: 1, username: 'user' } };
      expect(controller.getProfile(req as any)).toEqual({
        id: 1,
        username: 'user',
      });
    });

    it('should return message if no user on request', () => {
      const req = {};
      expect(controller.getProfile(req as any)).toEqual({
        message: 'No user on request',
      });
    });
  });

  describe('getGreeting', () => {
    it('should return greeting', () => {
      expect(controller.getGreeting()).toBe('hi');
    });
  });
});
