import { PrismaClient } from '@prisma/client'
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
    const result = await prisma.item.create({
      data: item,
    });
    console.log(result);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
