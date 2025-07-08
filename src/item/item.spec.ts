// test/item.e2e-spec.ts
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

describe('Item Model', () => {
  let itemId: string;

  afterAll(async () => {
    await prisma.item.deleteMany();
    await prisma.$disconnect();
  });

  it('creates an item', async () => {
    const item = await prisma.item.create({
      data: { name: 'Test Item' },
    });
    itemId = item.id;
    expect(item.name).toBe('Test Item');
    expect(item.active).toBe(true);
  });

  it('reads an item', async () => {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    expect(item).not.toBeNull();
    expect(item?.id).toBe(itemId);
  });

  it('updates an item', async () => {
    const updated = await prisma.item.update({
      where: { id: itemId },
      data: { name: 'Updated', active: false },
    });
    expect(updated.name).toBe('Updated');
    expect(updated.active).toBe(false);
  });

  it('deletes an item', async () => {
    await prisma.item.delete({ where: { id: itemId } });
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    expect(item).toBeNull();
  });

  it('fails to create item without name', async () => {
    await expect(
      prisma.item.create({ data: {} as any })
    ).rejects.toThrow();
  });
});