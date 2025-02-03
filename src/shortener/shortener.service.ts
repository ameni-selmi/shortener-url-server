import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { UrlMapping } from './url-mapping.schema';

@Injectable()
export class UrlShortenerService {
  constructor(
    @InjectModel(UrlMapping.name) private urlModel: Model<UrlMapping>
  ) {}

  async shortenUrl(originalUrl: string): Promise<string> {
    // Validate URL
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
      '((\\d{1,3}\\.){3}\\d{1,3}))'+
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
      '(\\?[;&a-z\\d%_.~+=-]*)?'+
      '(\\#[-a-z\\d_]*)?$','i');
    
    if (!urlPattern.test(originalUrl)) {
      throw new Error('Invalid URL');
    }

    // Generate unique short code
    const shortCode = nanoid(6);

    const urlMapping = new this.urlModel({
      shortCode,
      originalUrl
    });

    await urlMapping.save();
    return shortCode;
  }

  async getOriginalUrl(shortCode: string): Promise<string> {
    const urlMapping = await this.urlModel.findOne({ shortCode });
    
    if (!urlMapping) {
      throw new Error('URL not found');
    }

    // Increment click count
    urlMapping.clickCount += 1;
    await urlMapping.save();

    return urlMapping.originalUrl;
  }
}