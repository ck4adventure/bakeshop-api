## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Backend Stack
- Nestjs
- Jest for testing
- Prisma ORM to talk to the db
- Postgresql, currently only supported locally
- JWT sessions, global authguard
- Swagger for API routes and dtos.


## API Routes

### Bakery
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/bakery/settings` | JWT | Get bakery name and operating days (any role) |
| PATCH | `/bakery/settings` | JWT + ADMIN | Update operating days. Body: `{ operatingDays: Weekday[] }` |

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | Public | Sign in, sets HttpOnly access token cookie |
| POST | `/auth/logout` | Public | Clear auth cookie |
| GET | `/auth/profile` | JWT | Get current user profile |

### Items
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/items` | JWT | Create a new item |
| GET | `/items` | JWT | List all items for the bakery |
| GET | `/items/:slug` | JWT | Get item by slug |
| PATCH | `/items/:slug` | JWT | Update item by slug |
| DELETE | `/items/:id` | JWT | Delete item by ID |

### Batches (Raw dough → Freezer)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/batches` | JWT | List last 100 raw dough batch transactions, newest first |
| POST | `/batches` | JWT | Log a new raw dough batch; adds to frozen inventory (BATCH transaction) |

### Inventory
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/inventory` | JWT | Get all current frozen stock levels with item info |

| POST | `/inventory/bake` | JWT | Record a completed morning bake; deducts from frozen inventory (BAKE transaction). Body: `{ itemId, quantity, note? }` |

| POST | `/inventory/adjust` | JWT | Manual stock correction. Body: `{ itemId, quantity, note }` — quantity can be negative (waste/loss). Note is required. |

### Production Schedule (Daily bake quotas)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/production-schedule` | JWT | Get full weekly quota schedule |
| GET | `/production-schedule/item/:itemId` | JWT | Get all weekday quotas for one item |
| POST | `/production-schedule` | JWT | Create or upsert a schedule entry |
| PATCH | `/production-schedule/:itemId/:weekday` | JWT | Update quota for one item/weekday |
| DELETE | `/production-schedule/:itemId/:weekday` | JWT | Remove a schedule entry |
| GET | `/production-schedule/overrides?date=YYYY-MM-DD` | JWT | Get all overrides for a specific date |
| POST | `/production-schedule/overrides` | JWT | Upsert a one-day quota override. Body: `{ itemId, date, quantity }` |
| DELETE | `/production-schedule/overrides/:itemId/:date` | JWT | Remove a one-day override |

> **Missing:** Daily override — one-off quota adjustment for a specific date without touching the weekly template. Not yet built.

---

## Current Status
### Feature: Items
Working on initial feature, Items, and developing my workflow.

### Nest Module


1. Add changes to Prisma schema
2. Create migration, update db and generate: `npx prisma migrate dev`
1. Generate boilerplate CRUD for a resource with `nest g resource [name]`
OR
3. Create feature folder under `src`	
4. Create jest feature spec file `[feature-name].spec.ts`
5. Create feature `.service.ts` file, this holds all the methods available like getItems
6. Create feature `.service.spec.ts` file and mock what's needed to run tests
7. Create feature `.module.ts` file
8. Create feature `.controller.ts` file and declare routes, connecting to service
9. Create feature `.controller.spec.ts` file to test routes

Then
10. `npm run start` to test the route using Postman

## Common Actions
### Prisma
- All in one migration and application `npx prisma migrate dev`
- Make a change to the migration file? Need to reset db data? `npx prisma migrate reset` 
- To just seed the db `npx prisma db seed`



## Project setup

```bash
$ npm install
```

Then create a `.env` file and ensure `DATABASE_URL` is set. See examples for format. Localhost port is 5432.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests with jest
$ npm run test

# e2e tests with playwright
$ npm run test:e2e

# jest test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.