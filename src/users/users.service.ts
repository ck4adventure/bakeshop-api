
import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'baker',
      password: 'quartersheet',
    },
    {
      userId: 2,
      username: 'manager',
      password: 'halfsheet',
    },
    {
      userId: 3,
      username: 'admin',
      password: 'fullsheet',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}
