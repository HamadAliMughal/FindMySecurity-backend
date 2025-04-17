import 'reflect-metadata';
import { Handler, Context } from 'aws-lambda';
import { Server } from 'http';
import { createServer, proxy } from 'aws-serverless-express';
import { eventContext } from 'aws-serverless-express/middleware';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import * as cors from 'cors';

let cachedServer: Server;

async function bootstrapServer(): Promise<Server> {
  const expressApp = express();

  // ✅ CORS middleware setup
  expressApp.use(
    cors({
      origin: '*', // Change to 'https://yourfrontend.com' in production
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: false, // Set to true if sending cookies or auth headers
    }),
  );

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.use(eventContext());
  await app.init();

  return createServer(expressApp);
}

export const handler: Handler = async (event: any, context: Context) => {
  try {
    if (!cachedServer) {
      cachedServer = await bootstrapServer();
    }
    return proxy(cachedServer, event, context, 'PROMISE').promise;
  } catch (error) {
    console.error('Lambda handler error:', error);
    throw error;
  }
};
