import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class UrlMapping {
  @Prop({ required: true, unique: true })
  shortCode: string;

  @Prop({ required: true })
  originalUrl: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: 0 })
  clickCount: number;
}

export type UrlMappingDocument = HydratedDocument<UrlMapping>;
export const UrlMappingSchema = SchemaFactory.createForClass(UrlMapping);