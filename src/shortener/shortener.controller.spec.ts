import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';

describe('ShortenerController', () => {
  let controller: ShortenerController;
  let service: ShortenerService;

  const mockShortenerService = {
    shortenUrl: jest.fn(),
    redirectToOriginal: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortenerController],
      providers: [
        {
          provide: ShortenerService,
          useValue: mockShortenerService,
        },
      ],
    }).compile();

    controller = module.get<ShortenerController>(ShortenerController);
    service = module.get<ShortenerService>(ShortenerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('shortenUrl', () => {
    it('should successfully shorten a URL', async () => {
      const createUrlDto = { originalURL: 'https://example.com' };
      const expectedResult = { shortUrl: 'abc123' };
      
      mockShortenerService.shortenUrl.mockResolvedValue(expectedResult);

      const result = await controller.shortenUrl(createUrlDto);
      expect(result).toEqual(expectedResult);
      expect(service.shortenUrl).toHaveBeenCalledWith(createUrlDto);
    });

    it('should throw HttpException when shortening fails', async () => {
      const createUrlDto = { originalURL: 'https://example.com' };
      const error = new Error('Database error');
      
      mockShortenerService.shortenUrl.mockRejectedValue(error);

      await expect(controller.shortenUrl(createUrlDto)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error generating shortened URL.',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('redirectToOriginal', () => {
    it('should successfully redirect to original URL', async () => {
      const shortenedId = 'abc123';
      const originalURL = 'https://example.com';
      const mockResponse = {
        redirect: jest.fn(),
      } as unknown as Response;

      mockShortenerService.redirectToOriginal.mockResolvedValue(originalURL);

      await controller.redirectToOriginal(shortenedId, mockResponse);
      expect(service.redirectToOriginal).toHaveBeenCalledWith(shortenedId);
      expect(mockResponse.redirect).toHaveBeenCalledWith(HttpStatus.FOUND, originalURL);
    });

    it('should throw HttpException when shortened URL is not found', async () => {
      const shortenedId = 'nonexistent';
      const error = new Error('URL not found');
      const mockResponse = {
        redirect: jest.fn(),
      } as unknown as Response;

      mockShortenerService.redirectToOriginal.mockRejectedValue(error);

      await expect(controller.redirectToOriginal(shortenedId, mockResponse)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Shortened URL not found.',
            error: error.message,
          },
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });
});
