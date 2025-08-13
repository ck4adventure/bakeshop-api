import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Items Model', () => {
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

  it('fails to create item without name', async () => {
    await expect(prisma.items.create({ data: {} as any })).rejects.toThrow();
  });
});
