## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Current Status
Working on initial feature, Items, and developing my workflow.

1. Add changes to Prisma schema
2. Push changes to local db `npx prisma db push`
3. Create feature folder under `src`	
4. Create jest feature spec file `[feature-name].spec.ts`
5. Create feature `.service.ts` file, this holds all the methods available like getItems
6. Create feature `.service.spec.ts` file and mock what's needed to run tests
7. Create feature `.module.ts` file
8. Create feature `.controller.ts` file and declare routes, connecting to service
9. Create feature `.controller.spec.ts` file to test routes

10. `npm run start` to test the route using Postman


## Project setup

```bash
$ npm install
```

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

# e2e tests
$ npm run test:e2e

# test coverage
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