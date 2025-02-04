import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { CreateUrlDto } from './dto/create-url.dto';
import { Shortener, ShortenerDocument } from './shortener.schema';
import { ShortenerService } from './shortener.service';

jest.mock('nanoid', () => ({
  nanoid: jest.fn()
    .mockReturnValueOnce('abc123') // First attempt
    .mockReturnValueOnce('newCode123'), // Retry attempt
}));

describe('ShortenerService', () => {
  let service: ShortenerService;
  let model: Model<ShortenerDocument>;
  let cacheManager: Cache;

  const mockShortener = {
    originalUrl: 'https://example.com',
    shortCode: 'abc123',
    clickCount: 0,
    save: jest.fn().mockResolvedValue(undefined),
  };

  const mockModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    constructor: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortenerService,
        {
          provide: getModelToken(Shortener.name),
          useValue: mockModel,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ShortenerService>(ShortenerService);
    model = module.get<Model<ShortenerDocument>>(getModelToken(Shortener.name));
    cacheManager = module.get<Cache>(CACHE_MANAGER);

    jest.clearAllMocks();

    (model as any).constructor = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue(undefined),
    }));
  });

  describe('shortenUrl', () => {
    const createUrlDto: CreateUrlDto = {
      originalURL: 'https://example.com',
    };

    beforeEach(() => {
      process.env.BACKEND_URL = 'http://localhost:5000/';
    });

    it('should create a shortened URL successfully', async () => {
      const mockDocument = {
        originalUrl: createUrlDto.originalURL,
        shortCode: 'abc123',
        save: jest.fn().mockResolvedValue(undefined),
      };

      // mockModel.findOne.mockResolvedValueOnce(mockDocument);


      // (model as any).constructor.mockReturnValue(mockDocument);

      const result = await service.shortenUrl(createUrlDto);

      expect(result).toEqual({
        shortenedUrl: 'http://localhost:5000/abc123',
      });
      // expect(mockModel.findOne).toHaveBeenCalledWith({ shortCode: 'abc123' });
      // expect(mockDocument.save).toHaveBeenCalled();
    });

    // it('should throw BadRequestException when save fails', async () => {
    //   mockModel.findOne.mockResolvedValueOnce(null);

    //   const mockDocument = {
    //     originalUrl: createUrlDto.originalURL,
    //     shortCode: 'abc123',
    //     save: jest.fn().mockRejectedValue(new Error('Database error')),
    //   };

    //   (model as any).constructor.mockReturnValue(mockDocument);

    //   await expect(service.shortenUrl(createUrlDto)).rejects.toThrow(
    //     BadRequestException,
    //   );
    //   expect(mockDocument.save).toHaveBeenCalled();
    // });

    // it('should retry if shortCode already exists', async () => {
    //   mockModel.findOne
    //     .mockResolvedValueOnce(mockShortener)
    //     .mockResolvedValueOnce(null);

    //   const mockDocument = {
    //     originalUrl: createUrlDto.originalURL,
    //     shortCode: 'newCode123',
    //     save: jest.fn().mockResolvedValue(undefined),
    //   };

    //   (model as any).constructor.mockReturnValue(mockDocument);

    //   const result = await service.shortenUrl(createUrlDto);

    //   expect(result).toEqual({
    //     shortenedUrl: 'http://localhost:5000/newCode123',
    //   });
    //   expect(mockModel.findOne).toHaveBeenCalledTimes(2);
    //   expect(mockDocument.save).toHaveBeenCalled();
    // });
  });

  describe('redirectToOriginal', () => {
    it('should return original URL when shortCode exists', async () => {
      mockModel.findOne.mockResolvedValueOnce(mockShortener);

      const result = await service.redirectToOriginal(mockShortener.shortCode);

      expect(result).toBe(mockShortener.originalUrl);
      expect(mockModel.findOne).toHaveBeenCalledWith({ shortCode: mockShortener.shortCode });
    });

    it('should throw NotFoundException when shortCode does not exist', async () => {
      const shortCode = 'nonexistent';
      mockModel.findOne.mockResolvedValueOnce(null);

      await expect(service.redirectToOriginal(shortCode)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockModel.findOne).toHaveBeenCalledWith({ shortCode });
    });
  });});
