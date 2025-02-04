import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateUrlDto } from './dto/create-url.dto';
import { ShortenerService } from './shortener.service';

/**
 * The ShortenerController class provides endpoints for shortening URLs and redirecting to the original URLs.
 */
@ApiTags('URL Shortener')
@Controller()
export class ShortenerController {
  constructor(private readonly shortenerService: ShortenerService) {}

  /**
   * Endpoint to shorten a URL.
   * @param createUrlDto - The DTO containing the URL to be shortened.
   * @returns The shortened URL.
   * @throws {HttpException} If there is an error generating the shortened URL.
   */
  @Post('/shorten')
  @ApiOperation({ summary: 'Shorten a URL', description: 'Creates a shortened version of the provided URL' })
  @ApiResponse({ status: 201, description: 'URL successfully shortened' })
  @ApiResponse({ status: 500, description: 'Internal server error while shortening URL' })
  async shortenUrl(@Body() createUrlDto: CreateUrlDto) {
    try {
      return await this.shortenerService.shortenUrl(createUrlDto);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error generating shortened URL.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint to redirect to the original URL based on the provided shortened URL ID.
   * @param shortenedId - The ID of the shortened URL to redirect to.
   * @param res - The Express response object to handle the redirect.
   * @returns Redirects the user to the original URL or throws a 404 error if the shortened URL is not found.
   */
  @Get(':shortenedId')
  @ApiOperation({ summary: 'Redirect to original URL', description: 'Redirects to the original URL using the shortened ID' })
  @ApiResponse({ status: 302, description: 'Successfully redirected to original URL' })
  @ApiResponse({ status: 404, description: 'Shortened URL not found' })
  async redirectToOriginal(@Param('shortenedId') shortenedId: string, @Res() res: Response) {
    try {
      const originalUrl = await this.shortenerService.redirectToOriginal(shortenedId);
      res?.redirect(HttpStatus.FOUND, originalUrl);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Shortened URL not found.',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

}