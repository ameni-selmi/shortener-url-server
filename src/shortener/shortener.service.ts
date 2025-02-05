import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { CreateUrlDto } from './dto/create-url.dto';
import { Shortener, ShortenerDocument } from './shortener.schema';

/**
 * Service to handle business logic for shortening URLs and handling redirections.
 */
@Injectable()
export class ShortenerService {
  constructor(
    @InjectModel(Shortener.name) private shortenerModel: Model<ShortenerDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache, 
  ) {}

  /**
   * Shorten the provided URL and return a shortened version.
   * @param createUrlDto - DTO containing the original URL.
   * @returns The shortened URL.
   */
  async shortenUrl(createUrlDto: CreateUrlDto) {
    const { originalURL } = createUrlDto;
    // Generate a unique shortcode (6 characters long) using nanoid
    let shortCode;
    let existingCode;
    do {
      shortCode = nanoid(6);  // Generate a 6-character unique ID
      existingCode = await this.shortenerModel.findOne({ shortCode });  // Check if code already exists
    } while (existingCode);  // Retry generating the code if it already exists

    try {
      // Create the new shortened URL record
      const newUrl = new this.shortenerModel({
        originalUrl: originalURL,
        shortCode,
      });

      await newUrl.save();

      return {
        shortenedUrl: `${process.env.BACKEND_URL}${shortCode}`,
      };
    } catch (error) {
      console.log("error",error);
      throw new BadRequestException('Error saving shortened URL to the database');
    }
  }

  
  /**
   * Redirects the user to the original URL associated with the provided shortened ID.
   * 
   * This method first checks if the URL is cached, and if so, returns the cached URL.
   * If the URL is not cached, it fetches the original URL from the database using the provided shortened ID.
   * If the shortened URL is not found, it throws a NotFoundException.
   * Otherwise, it increments the click count for the shortened URL, saves the updated record, caches the URL for 1 hour, and returns the original URL.
   * 
   * @param shortenedId - The shortened ID of the URL to redirect to.
   * @returns The original URL associated with the provided shortened ID.
   */
  async redirectToOriginal(shortenedId: string): Promise<string> {
    const cacheKey = `shortenedUrl:${shortenedId}`;
    
    // Check if URL is cached
    const cachedUrl = await this.cacheManager.get<string>(cacheKey);
    if (cachedUrl) {
      return cachedUrl;
    }
  
    // Fetch from database if not cached
    const shortUrl = await this.shortenerModel.findOne({ shortCode: shortenedId });
    if (!shortUrl) {
      throw new NotFoundException('Shortened URL not found');
    }
  
    // Increment the click count and save
    shortUrl.clickCount += 1;
    await shortUrl.save();
  
    // Cache the URL for 1 hour
    await this.cacheManager.set(cacheKey, shortUrl.originalUrl, 3600000);
    return shortUrl.originalUrl; // Return the original URL as a string
  }  

}
