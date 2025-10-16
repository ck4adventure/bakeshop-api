import { InventoryReason, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const items_demo_data = [
  { name: "Chocolate Chip Cookies", slug: "chocolate-chip-cookies" },
  { name: "Brookies", slug: "brookies" },
  { name: "Snickerdoodles", slug: "snickerdoodles" },
  { name: "Oatmeal Raisin", slug: "oatmeal-raisin" },
];

// createMany
// async function main() {
//   await prisma.item.createMany({
//     data: items_demo_data,
//     skipDuplicates: true, // optional if you don't want duplicate errors
//   })
// }

// looping
// async function main() {
//   for (const item of items_demo_data) {
//     await prisma.item.create({
//       data: item
//     })
//   }
// }

// in parallel (smaller datasets only)
async function main() {
  for (const item of items_demo_data) {
		// create item
    const itemResult = await prisma.item.create({
      data: item,
    });
    console.log("item created: ", itemResult);
		// create batch for item to give it a quantity
		const qty = itemResult.id * 10;
		const batchResult = await prisma.inventoryTransaction.create({
			data: {
				itemId: itemResult.id,
				quantity: qty,
				reason: InventoryReason.BATCH
			}
		});
		console.log("batch created: ", batchResult);

  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
