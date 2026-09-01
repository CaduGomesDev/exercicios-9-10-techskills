import { IUser } from '../models/user';

export class UserService {
  private users: IUser[] = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', isActive: true },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', isActive: false },
  ];

  getAll(): IUser[] {
    return [...this.users];
  }

  getById(id: number): IUser | undefined {
    return this.users.find((user) => user.id === id);
  }

  create(data: Omit<IUser, 'id'>): IUser {
    const nextId = this.users.length > 0 ? Math.max(...this.users.map((user) => user.id)) + 1 : 1;
    const user: IUser = { id: nextId, ...data };

    this.users.push(user);

    return user;
  }

  update(id: number, changes: Partial<IUser>): IUser | undefined {
    const index = this.users.findIndex((user) => user.id === id);

    if (index === -1) {
      return undefined;
    }

    const updated: IUser = { ...this.users[index], ...changes, id };

    this.users[index] = updated;

    return updated;
  }

  delete(id: number): IUser | undefined {
    const index = this.users.findIndex((user) => user.id === id);

    if (index === -1) {
      return undefined;
    }

    const [removed] = this.users.splice(index, 1);

    return removed;
  }
}
