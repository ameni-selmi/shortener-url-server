import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerExceptionFilter } from './filters/throttler-exception.filter';
import { ShortenerModule } from './shortener/shortener.module';

@Module({
  imports:  [
    ConfigModule.forRoot({
      isGlobal: true, // Makes environment variables globally accessible
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'), // Reads MONGO_URI from .env
      }),
    }),
    ThrottlerModule.forRoot([{
      ttl: 60, // 1 minute time-to-live
      limit: 20, // Max requests allowed per ttl
    }]),
    ShortenerModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,  // Apply the filter globally
      useClass: ThrottlerExceptionFilter,
    },
    AppService
  ],
})
export class AppModule {}
