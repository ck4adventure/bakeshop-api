// items.spec.ts
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const items: any[] = [];
  let idCounter = 1;

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      items: {
        create: jest.fn(({ data }) => {
          if (!data.name) throw new Error('Name is required');
          const newItem = { id: String(idCounter++), ...data };
          items.push(newItem);
          return Promise.resolve(newItem);
        }),
        findUnique: jest.fn(({ where }) => {
          const found = items.find((i) => i.id === where.id) || null;
          return Promise.resolve(found);
        }),
        update: jest.fn(({ where, data }) => {
          const index = items.findIndex((i) => i.id === where.id);
          if (index === -1) throw new Error('Item not found');
          items[index] = { ...items[index], ...data };
          return Promise.resolve(items[index]);
        }),
        delete: jest.fn(({ where }) => {
          const index = items.findIndex((i) => i.id === where.id);
          if (index === -1) throw new Error('Item not found');
          const deleted = items.splice(index, 1)[0];
          return Promise.resolve(deleted);
        }),
        deleteMany: jest.fn(() => {
          items.length = 0;
          return Promise.resolve({ count: 0 });
        }),
      },
      $disconnect: jest.fn(),
    })),
  };
});

const prisma = new PrismaClient();

describe('Items Model (Mocked Prisma)', () => {
  let itemId: string;

  afterAll(async () => {
    await prisma.items.deleteMany();
    await prisma.$disconnect();
  });

  it('creates an item', async () => {
    const item = await prisma.items.create({
      data: { name: 'Test Item' },
    });
    itemId = item.id;
    expect(item.name).toBe('Test Item');
  });

  it('reads an item', async () => {
    const item = await prisma.items.findUnique({ where: { id: itemId } });
    expect(item).not.toBeNull();
    expect(item?.id).toBe(itemId);
  });

  it('updates an item', async () => {
    const updated = await prisma.items.update({
      where: { id: itemId },
      data: { name: 'Updated' },
    });
    expect(updated.name).toBe('Updated');
  });

  it('deletes an item', async () => {
    await prisma.items.delete({ where: { id: itemId } });
    const item = await prisma.items.findUnique({ where: { id: itemId } });
    expect(item).toBeNull();
  });

  it('fails to create item without name', () => {
    expect(() => prisma.items.create({ data: {} as any })).toThrow(
      'Name is required',
    );
  });
});
