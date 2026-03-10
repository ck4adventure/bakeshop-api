import { InventoryReason, PrismaClient, Role, Weekday } from '@prisma/client'
import * as bcrypt from 'bcrypt'
const prisma = new PrismaClient()

const SALT_ROUNDS = 10

const demo_bakery = { name: "Demo Bakery", slug: "demo-bakery" }

const users_demo_data = [
	{ username: 'admin', email: 'admin@bakeshop.dev', password: 'admin123', role: Role.ADMIN },
	{ username: 'manager', email: 'manager@bakeshop.dev', password: 'manager123', role: Role.MANAGER },
	{ username: 'baker', email: 'baker@bakeshop.dev', password: 'baker123', role: Role.BAKER },
]

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

async function main() {
	// seed demo bakery
	const bakery = await prisma.bakery.upsert({
		where: { slug: demo_bakery.slug },
		update: {},
		create: demo_bakery,
	})
	console.log(`bakery seeded: ${bakery.slug}`)

	// seed users, linked to demo bakery
	for (const u of users_demo_data) {
		const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS)
		await prisma.user.upsert({
			where: { username: u.username },
			update: { bakeryId: bakery.id },
			create: { username: u.username, email: u.email, passwordHash, role: u.role, bakeryId: bakery.id },
		})
		console.log(`user seeded: ${u.username}`)
	}

	// seed items
	for (const item of items_demo_data) {

		// create item (skip if already exists), always link to bakery
		const itemResult = await prisma.item.upsert({
			where: { slug: item.slug },
			update: { bakeryId: bakery.id },
			create: { ...item, bakeryId: bakery.id },
		});
		console.log("item seeded: ", itemResult.slug);

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

		// give item a production schedule
		// itemId, weekday 0-6, quantity
		// const schedResult = await prisma.productionSchedule.create({
		// 	data: {
		// 		itemId: itemResult.id,
		// 		quantity: 10,
		// 		weekday: Weekday.Sunday
		// 	}
		// })
		const schedResult = await prisma.productionSchedule.createMany({ skipDuplicates: true,
			data: [
				{
					itemId: itemResult.id,
					quantity: 0,
					weekday: Weekday.Monday
				},
				{
					itemId: itemResult.id,
					quantity: 0,
					weekday: Weekday.Tuesday
				},
				{
					itemId: itemResult.id,
					quantity: 10,
					weekday: Weekday.Wednesday
				},
				{
					itemId: itemResult.id,
					quantity: 10,
					weekday: Weekday.Thursday
				},
				{
					itemId: itemResult.id,
					quantity: 15,
					weekday: Weekday.Friday
				},
				{
					itemId: itemResult.id,
					quantity: 15,
					weekday: Weekday.Saturday
				},
				{
					itemId: itemResult.id,
					quantity: 10,
					weekday: Weekday.Sunday
				}
			]
		})
		console.log("production schedule results: ", schedResult)

	}
}

main()
	.then(() => prisma.$disconnect())
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
