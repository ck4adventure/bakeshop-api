import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: { user: { findUnique: jest.Mock } };

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findOne returns user when found', async () => {
    const mockUser = { id: '1', username: 'baker', passwordHash: 'hash', role: 'BAKER' };
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await service.findOne('baker');
    expect(result).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { username: 'baker' } });
  });

  it('findOne returns null when not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const result = await service.findOne('nobody');
    expect(result).toBeNull();
  });
});
