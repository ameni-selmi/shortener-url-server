// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { getModelToken } from '@nestjs/mongoose';
// import { Test, TestingModule } from '@nestjs/testing';
// import { CreateUrlDto } from './dto/create-url.dto';
// import { Shortener } from './shortener.schema';
// import { ShortenerService } from './shortener.service';

// // Mock nanoid
// jest.mock('nanoid', () => ({
//   nanoid: jest.fn(() => 'abcdef'), 
// }));

// describe('ShortenerService', () => {
//   let service: ShortenerService;
//   let shortenerModel: any;

//   beforeEach(async () => {
//     const mockModel = {
//       findOne: jest.fn(),
//       create: jest.fn(),
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         ShortenerService,
//         { provide: getModelToken(Shortener.name), useValue: mockModel },
//         { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn() } },
//       ],
//     }).compile();

//     service = module.get<ShortenerService>(ShortenerService);
//     shortenerModel = module.get(getModelToken(Shortener.name));
//   });

//   it('should shorten a URL successfully', async () => {
//     const createUrlDto: CreateUrlDto = { originalURL: 'https://example.com' };

//     // Mock database operations
//     shortenerModel.findOne.mockResolvedValueOnce(null); // No existing shortcode
//     shortenerModel.create.mockReturnValueOnce({
//       save: jest.fn().mockResolvedValueOnce(true), // Simulate successful database save
//     });
//     console.log(Object.getOwnPropertyNames(service));
//     console.log(service);
    
//     // const result = await service.shortenUrl(createUrlDto);

//     // expect(result).toEqual({
//     //   shortenedUrl: `${process.env.BACKEND_URL}abcdef`,
//     // });

//     // expect(shortenerModel.findOne).toHaveBeenCalledWith({ shortCode: 'abcdef' });
//     // expect(shortenerModel.create).toHaveBeenCalledWith({
//     //   originalUrl: 'https://example.com',
//     //   shortCode: 'abcdef',
//     // });
//   });
// });

import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { nanoid } from 'nanoid';
import { ShortenerService } from './shortener.service';

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(),
}));

// Mock mongoose and Schema constructor
jest.mock('mongoose', () => ({
  model: jest.fn().mockReturnValue({
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue(undefined), // Mock save method
    })),
  }),
  Schema: jest.fn().mockImplementation(() => ({})), // Mock Schema constructor
}));

describe('ShortenerService - shortenUrl', () => {
  let service: ShortenerService;
  let shortenerModelMock: any;
  let cacheManagerMock: any;

  beforeEach(async () => {
    // Mock the CACHE_MANAGER dependency
    cacheManagerMock = {
      set: jest.fn(),
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortenerService,
        { provide: 'CACHE_MANAGER', useValue: cacheManagerMock },
      ],
    }).compile();

    service = module.get<ShortenerService>(ShortenerService);

    // Get the mocked model created by mongoose.mock
    shortenerModelMock = require('mongoose').model();
  });

  it('should shorten the URL and return the shortened URL', async () => {
    const mockOriginalURL = 'https://example.com';
    const mockShortCode = 'abc123';
    const mockBackendUrl = 'http://localhost:3000/';

    process.env.BACKEND_URL = mockBackendUrl;

    (nanoid as jest.Mock).mockReturnValue(mockShortCode);
    shortenerModelMock.findOne.mockResolvedValue(null); // Mock findOne to return null (no existing code)

    const result = await service.shortenUrl({ originalURL: mockOriginalURL });

    expect(result).toEqual({ shortenedUrl: `${mockBackendUrl}${mockShortCode}` });
    expect(nanoid).toHaveBeenCalledWith(6);
    expect(shortenerModelMock.findOne).toHaveBeenCalledWith({ shortCode: mockShortCode });
  });

  it('should throw BadRequestException if saving to database fails', async () => {
    const mockOriginalURL = 'https://example.com';
    const mockShortCode = 'abc123';

    (nanoid as jest.Mock).mockReturnValue(mockShortCode);
    shortenerModelMock.findOne.mockResolvedValue(null); // Mock findOne to return null (no existing code)

    // Simulate an error in the create method
    shortenerModelMock.create.mockImplementation(() => {
      throw new Error('Database error');
    });

    // Ensure BadRequestException is thrown when an error occurs during the saving process
    await expect(service.shortenUrl({ originalURL: mockOriginalURL })).rejects.toThrowError(
      new BadRequestException('Error saving shortened URL to the database'),
    );
  });
});
