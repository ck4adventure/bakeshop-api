import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users: User[];
  constructor(private configService: ConfigService) {
    this.users = [
      {
        userId: 1,
        username: this.configService.get<string>('USER1_USERNAME'),
        password: this.configService.get<string>('USER1_PASSWORD'),
      },
      {
        userId: 2,
        username: this.configService.get<string>('USER2_USERNAME'),
        password: this.configService.get<string>('USER2_PASSWORD'),
      },
      {
        userId: 3,
        username: this.configService.get<string>('USER3_USERNAME'),
        password: this.configService.get<string>('USER3_PASSWORD'),
      },
    ];
  }

  async findOne(username: string): Promise<User | undefined> {
    return await this.users.find((user) => user.username === username);
  }
}
