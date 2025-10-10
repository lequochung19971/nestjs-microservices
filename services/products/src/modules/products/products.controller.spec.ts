import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto, Currency, ProductDto } from 'nest-shared/contracts';

describe('ProductsController', () => {
  let controller: ProductsController;
  let mockProductsService: Partial<ProductsService>;

  beforeEach(async () => {
    mockProductsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findBySku: jest.fn(),
      findByCategory: jest.fn(),
      searchProducts: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      addVariant: jest.fn(),
      getVariants: jest.fn(),
      updateVariant: jest.fn(),
      removeVariant: jest.fn(),
      attachMedia: jest.fn(),
      getProductMedia: jest.fn(),
      detachMedia: jest.fn(),
      updatePrimaryImage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createDto: CreateProductDto = {
        sku: 'TEST-001',
        name: 'Test Product',
        description: 'Test Description',
        price: '99.99',
        currency: Currency.USD,
        isActive: true,
      };

      const mockProduct: ProductDto = {
        id: '123',
        sku: 'TEST-001',
        name: 'Test Product',
        description: 'Test Description',
        price: '99.99',
        currency: Currency.USD,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductsService.create = jest.fn().mockResolvedValue(mockProduct);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findOne', () => {
    it('should find a product by id', async () => {
      const mockProduct: ProductDto = {
        id: '123',
        sku: 'TEST-001',
        name: 'Test Product',
        price: '99.99',
        currency: Currency.USD,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductsService.findOne = jest.fn().mockResolvedValue(mockProduct);

      const result = await controller.findOne('123');

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.findOne).toHaveBeenCalledWith('123');
    });
  });

  describe('findBySku', () => {
    it('should find a product by SKU', async () => {
      const mockProduct: ProductDto = {
        id: '123',
        sku: 'TEST-001',
        name: 'Test Product',
        price: '99.99',
        currency: Currency.USD,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductsService.findBySku = jest.fn().mockResolvedValue(mockProduct);

      const result = await controller.findBySku('TEST-001');

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.findBySku).toHaveBeenCalledWith('TEST-001');
    });
  });
});
