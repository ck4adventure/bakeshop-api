import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';


// is an Express platform application by default
// but we set it explicity
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet());

	app.use(cookieParser());
  // TODO set CORS to only trusted origins in prod
  app.enableCors({
		origin: ['http://localhost:5173'], // Replace with your frontend's URL and port
    credentials: true, // If you need cookies or auth headers
	});

  // TODO swagger api only avail locally
  // swagger setup
  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // TODO global validation pipe to sanitize and validate incoming requests

  // for express platform http adapter
  app.set('trust proxy', 'loopback'); // Trust requests from the loopback address

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
});
