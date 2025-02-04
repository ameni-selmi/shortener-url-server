import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShortenerController } from './shortener.controller';
import { Shortener, ShortenerSchema } from './shortener.schema';
import { ShortenerService } from './shortener.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Shortener.name, schema: ShortenerSchema }]),
  CacheModule.register(),
],
  providers: [ShortenerService],
  controllers: [ShortenerController]
})
export class ShortenerModule {}
