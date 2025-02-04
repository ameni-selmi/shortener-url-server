/**
 * Represents a shortened URL and its associated metadata.
 * 
 * The `Shortener` schema defines a document in the MongoDB database that stores a shortened URL, the original URL, and the number of times the shortened URL has been clicked.
 * 
 * The `shortCode` property is a unique, indexed string that represents the shortened URL.
 * The `originalUrl` property is the full, original URL that the shortened URL points to.
 * The `clickCount` property is a number that keeps track of how many times the shortened URL has been accessed.
 *
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Shortener {
  @Prop({ required: true, unique: true, index: true })
  shortCode: string;

  @Prop({ required: true })
  originalUrl: string;
 
  @Prop({ default: 0 })
  clickCount: number;
}

export type ShortenerDocument = HydratedDocument<Shortener>;
export const ShortenerSchema = SchemaFactory.createForClass(Shortener);

