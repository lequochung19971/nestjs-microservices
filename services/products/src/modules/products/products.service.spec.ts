import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { DrizzleService } from '../../db/drizzle.service';
import { CreateProductDto, Currency } from 'nest-shared/contracts';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockDrizzleService: Partial<DrizzleService>;

  beforeEach(async () => {
    mockDrizzleService = {
      client: {
        query: {
          products: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
          },
          categories: {
            findFirst: jest.fn(),
          },
          productVariants: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
          },
          productImages: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
          },
        },
        insert: jest.fn().mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{}]),
          }),
        }),
        update: jest.fn().mockReturnValue({
          set: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([{}]),
            }),
          }),
        }),
        delete: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{}]),
        }),
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ count: '0' }]),
          }),
        }),
        transaction: jest
          .fn()
          .mockImplementation((callback) =>
            callback(mockDrizzleService.client),
          ),
      } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: DrizzleService,
          useValue: mockDrizzleService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createDto: CreateProductDto = {
        sku: 'TEST-001',
        name: 'Test Product',
        description: 'Test Description',
        price: '99.99',
        currency: Currency.USD,
        isActive: true,
      };

      const mockProduct = {
        id: '123',
        sku: 'TEST-001',
        name: 'Test Product',
        price: '99.99',
        currency: Currency.USD,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock no existing product with same SKU
      mockDrizzleService.client!.query.products.findFirst = jest
        .fn()
        .mockResolvedValue(null);

      // Mock successful product creation
      mockDrizzleService.client!.insert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockProduct]),
        }),
      });

      // Mock findOne for the created product
      service.findOne = jest.fn().mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(service.findOne).toHaveBeenCalledWith(mockProduct.id);
    });

    it('should throw ConflictException when SKU already exists', async () => {
      const createDto: CreateProductDto = {
        sku: 'EXISTING-SKU',
        name: 'Test Product',
        price: '99.99',
        currency: Currency.USD,
        isActive: true,
      };

      // Mock existing product with same SKU
      mockDrizzleService.client!.query.products.findFirst = jest
        .fn()
        .mockResolvedValue({
          id: 'existing-id',
          sku: 'EXISTING-SKU',
        });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should find a product successfully', async () => {
      const mockProduct = {
        id: '123',
        sku: 'TEST-001',
        name: 'Test Product',
        price: '99.99',
        currency: Currency.USD,
        categories: [],
        variants: [],
        images: [],
      };

      mockDrizzleService.client!.query.products.findFirst = jest
        .fn()
        .mockResolvedValue(mockProduct);

      const result = await service.findOne('123');

      expect(result).toBeDefined();
      expect(result.id).toBe('123');
    });

    it('should throw NotFoundException when product not found', async () => {
      mockDrizzleService.client!.query.products.findFirst = jest
        .fn()
        .mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validateCategories', () => {
    it('should validate existing categories', async () => {
      mockDrizzleService.client!.query.categories.findFirst = jest
        .fn()
        .mockResolvedValue({
          id: 'cat-1',
          name: 'Category 1',
        });

      // This should not throw
      await expect(
        service['validateCategories'](['cat-1']),
      ).resolves.not.toThrow();
    });

    it('should throw BadRequestException for non-existent category', async () => {
      mockDrizzleService.client!.query.categories.findFirst = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        service['validateCategories'](['non-existent']),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
