// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { getModelToken } from '@nestjs/mongoose';
// import { Test, TestingModule } from '@nestjs/testing';
// import { Model } from 'mongoose';
// import { Shortener } from './shortener.schema';
// import { ShortenerService } from './shortener.service';

// // Mock nanoid to return a predictable value for testing
// jest.mock('nanoid', () => ({
//   nanoid: jest.fn(() => 'shortCode123'),
// }));

// class shortenerModelMocked {
//     constructor() {
//         this.findOne = jest.fn();
//         this.create = jest.fn();
//         this.save = jest.fn();
//     }
//     findOne = jest.fn();
//     create = jest.fn();
//     save = jest.fn();
// }

// describe('ShortenerService', () => {
//   let service: ShortenerService;
//   let shortenerModel: Model<Shortener>; 
//   let cacheManager: any;
// //   const shortenerModelMocked =  {
// //     findOne: jest.fn(),
// //     create: jest.fn(),
// //     save: jest.fn(),
// //   }
  
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         ShortenerService,
//         {
//           provide: getModelToken(Shortener.name),
//           useValue: {
//                 findOne: jest.fn(),
//                 create: jest.fn(),
//                 save: jest.fn(),
//           },
//         },
//         {
//           provide: CACHE_MANAGER,
//           useValue: {
//             get: jest.fn(),
//             set: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     service = module.get<ShortenerService>(ShortenerService);
//     shortenerModel = module.get(getModelToken(Shortener.name));
//     // shortenerModel = {
//     //     findOne: jest.fn(),
//     //     create: jest.fn().mockImplementation(() => ({
//     //     save: jest.fn().mockResolvedValue(true),
//     // })),
//     // } as Model<ShortenerDocument>;
//     cacheManager = module.get(CACHE_MANAGER);
//   });
  
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('shortenUrl', () => {
//     it('should shorten the URL and return a shortened URL', async () => {
//       const createUrlDto = { originalURL: 'http://example.com' };

//       // Mock findOne to return null (indicating the shortCode is unique)
//     //   shortenerModelMocked.findOne.mockResolvedValue(null);

//     //   const saveMock = shortenerModelMocked.save.mockResolvedValue({
//     //     originalUrl: createUrlDto.originalURL,
//     //     shortCode: 'shortCode123',
//     //   });

//     //   shortenerModel.save = saveMock;

//       const result = await service.shortenUrl(createUrlDto);

//       expect(result).toEqual({
//         shortenedUrl: `${process.env.BACKEND_URL}shortCode123`,
//       });
//     //   expect(saveMock).toHaveBeenCalledTimes(1);
//     });

//     // it('should throw an error if saving the shortened URL fails', async () => {
//     //   const createUrlDto = { originalURL: 'http://example.com' };

//     //   // Mock findOne to return null (indicating the shortCode is unique)
//     //   shortenerModel.findOne = jest.fn().mockResolvedValue(null);

//     //   // Mock the save method to throw an error
//     // //   shortenerModel.save = jest.fn().mockRejectedValue(new Error('Database error'));

//     //   await expect(service.shortenUrl(createUrlDto)).rejects.toThrow(BadRequestException);
//     // });
//   });
// });



import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { Shortener, ShortenerDocument } from './shortener.schema';
import { ShortenerService } from './shortener.service';

describe('ShortenerService', () => {
  let service: ShortenerService;
  let mockModel: Model<ShortenerDocument>;
  let mockCacheManager: Partial<Cache>;

  beforeEach(async () => {
    // Mock the Mongoose model
    mockModel = {
      findOne: jest.fn(),
      // Properly mock the constructor functionality
      constructor: function() {
        return {
          save: jest.fn().mockResolvedValue(undefined)
        };
      }
    } as any;

    // Create a proper mock for new Model() usage
    const mockConstructor = function(this: any, dto: any) {
      this.originalUrl = dto.originalUrl;
      this.shortCode = dto.shortCode;
      this.save = jest.fn().mockResolvedValue(undefined);
      return this;
    };

    // Set up the model to work with 'new' operator
    mockModel = function(dto: any) {
      return new (mockConstructor as any)(dto);
    } as any;
    mockModel.findOne = jest.fn();

    // Mock the cache manager
    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

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
  });

  describe('shortenUrl', () => {
    it('should create a shortened URL successfully', async () => {
      // Mock environment variable
      process.env.BACKEND_URL = 'http://localhost:5000/';
      
      // Mock that the shortCode doesn't exist yet
      (mockModel.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.shortenUrl({ originalURL: 'https://example.com' });

      expect(result).toHaveProperty('shortenedUrl');
      expect(result.shortenedUrl).toMatch(/http:\/\/localhost:5000\/[A-Za-z0-9]{6}/);
    });
  });

  describe('redirectToOriginal', () => {
    it('should return cached URL if it exists', async () => {
      const cachedUrl = 'https://example.com';
      (mockCacheManager.get as jest.Mock).mockResolvedValueOnce(cachedUrl);

      const result = await service.redirectToOriginal('abc123');

      expect(result).toBe(cachedUrl);
      expect(mockModel.findOne).not.toHaveBeenCalled();
    });

    it('should fetch and cache URL if not in cache', async () => {
      const originalUrl = 'https://example.com';
      (mockCacheManager.get as jest.Mock).mockResolvedValueOnce(null);
      (mockModel.findOne as jest.Mock).mockResolvedValueOnce({
        originalUrl,
        clickCount: 0,
        save: jest.fn().mockResolvedValue(undefined),
      });

      const result = await service.redirectToOriginal('abc123');

      expect(result).toBe(originalUrl);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should throw NotFoundException when URL not found', async () => {
      (mockCacheManager.get as jest.Mock).mockResolvedValueOnce(null);
      (mockModel.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.redirectToOriginal('abc123')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});