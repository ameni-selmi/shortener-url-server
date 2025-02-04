import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

/**
 * DTO for creating a shortened URL. Validates that the URL is a proper string and a valid URL.
 */
export class CreateUrlDto {
  /**
   * The original URL that needs to be shortened.
   * This must be a valid URL format.
   */
  @ApiProperty({
    description: 'The original URL to be shortened',
    example: 'https://www.example.com/very/long/url/that/needs/shortening',
    required: true
  })
  @IsString({ message: 'The original URL must be a string.' })
  @IsUrl({}, { message: 'The original URL must be a valid URL format.' })
  originalURL: string;
}