import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(username: string): Promise<User & { bakery: { id: string; slug: string } | null } | null> {
    return this.prisma.user.findUnique({
      where: { username },
      include: { bakery: { select: { id: true, slug: true } } },
    });
  }
}
