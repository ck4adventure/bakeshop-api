import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const items_demo_data = [
	{ name: "Chocolate Chip Cookies"},
	{ name: "Brookies"},
	{ name: "Snickerdoodles"},
	{ name: "Oatmeal Raisin"},
]

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
    const result = await prisma.items.create({
      data: item
    })
		console.log(result)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
