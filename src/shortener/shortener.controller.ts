import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    Post
} from '@nestjs/common';
import { UrlShortenerService } from './url-shortener.service';
  
  @Controller()
  export class UrlShortenerController {
    constructor(
      private readonly urlShortenerService: UrlShortenerService
    ) {}
  
    @Post('/shorten')
    @HttpCode(HttpStatus.CREATED)
    async shortenUrl(@Body('url') originalUrl: string) {
      const shortCode = await this.urlShortenerService.shortenUrl(originalUrl);
      return { 
        shortUrl: `http://localhost:3000/${shortCode}` 
      };
    }
  
    @Get('/:shortCode')
    @HttpCode(HttpStatus.PERMANENT_REDIRECT)
    async redirectToOriginalUrl(@Param('shortCode') shortCode: string) {
      try {
        const originalUrl = await this.urlShortenerService.getOriginalUrl(shortCode);
        return { 
          url: originalUrl,
          statusCode: HttpStatus.PERMANENT_REDIRECT
        };
      } catch (error) {
        throw new NotFoundException('Shortened URL not found');
      }
    }
  }