import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShortenerController } from './shortener.controller';
import { UrlMapping } from './shortener.schema';
import { ShortenerService } from './shortener.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: UrlMapping.name, schema: UrlMapping }])],
  providers: [ShortenerService],
  controllers: [ShortenerController]
})
export class ShortenerModule {}
