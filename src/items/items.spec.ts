// items.spec.ts
import { PrismaClient } from '@prisma/client';


jest.mock('@prisma/client', () => {
  const items: any[] = [];
  let idCounter = 1;
  function slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      item: {
        create: jest.fn(({ data }) => {
          if (!data.name) throw new Error('Name is required');
          const now = new Date();
          const newItem = {
            id: idCounter++,
            name: data.name,
            slug: slugify(data.name),
            createdAt: now,
            updatedAt: now,
            ...data,
          };
          items.push(newItem);
          return Promise.resolve(newItem);
        }),
        findUnique: jest.fn(({ where }) => {
          const found = items.find((i) => i.id === where.id) || null;
          return Promise.resolve(found);
        }),
        findMany: jest.fn(() => Promise.resolve([...items])),
        update: jest.fn(({ where, data }) => {
          const index = items.findIndex((i) => i.id === where.id);
          if (index === -1) throw new Error('Item not found');
          const now = new Date();
          items[index] = {
            ...items[index],
            ...data,
            slug: data.name ? slugify(data.name) : items[index].slug,
            updatedAt: now,
          };
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
  let itemId: number;

  afterAll(async () => {
    await prisma.item.deleteMany();
    await prisma.$disconnect();
  });

  it('creates an item', async () => {
    const item = await prisma.item.create({
      data: { name: 'Test Item', slug: "test-item" },
    });
    itemId = item.id;
    expect(item.name).toBe('Test Item');
    expect(item.slug).toBe('test-item');
    expect(item.createdAt).toBeInstanceOf(Date);
    expect(item.updatedAt).toBeInstanceOf(Date);
  });

  it('reads an item', async () => {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    expect(item).not.toBeNull();
    expect(item?.id).toBe(itemId);
    expect(item?.slug).toBe('test-item');
  });

  it('updates an item', async () => {
    const updated = await prisma.item.update({
      where: { id: itemId },
      data: { name: 'Updated' },
    });
    expect(updated.name).toBe('Updated');
    expect(updated.slug).toBe('updated');
    expect(updated.updatedAt).toBeInstanceOf(Date);
  });

  it('deletes an item', async () => {
    await prisma.item.delete({ where: { id: itemId } });
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    expect(item).toBeNull();
  });

  it('fails to create item without name', () => {
    expect(() => prisma.item.create({ data: {} as any })).toThrow(
      'Name is required',
    );
  });
});
