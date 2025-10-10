# Products Service Implementation Plan

## Overview
This document outlines the step-by-step implementation plan for the Products Service based on the [Products Feature PRD](./prd/products-feature-prd.md).

## Current State Analysis

### ✅ Already Implemented
- Database schema with all necessary tables
- Categories module with full CRUD operations
- Basic service structure (DrizzleModule, AppConfigModule, etc.)
- Authentication and authorization setup
- Database migrations

### ❌ Missing Implementation
- Product DTOs and contracts in shared package
- Products controller with CRUD operations
- Products service with business logic
- Products module setup
- Media integration for product images
- API Gateway routes for products

## Implementation Phases

### Phase 1: Foundation Setup (Days 1-2)
**Goal**: Create the basic structure and contracts

#### 1.1 Create Product DTOs and Contracts
**Location**: `packages/nest-shared/src/contracts/products/`

**Files to create**:
- `product.dto.ts` - Core product DTOs
- `create-product.dto.ts` - Product creation validation
- `update-product.dto.ts` - Product update validation  
- `query-product.dto.ts` - Product search and filtering
- `product-variant.dto.ts` - Product variant DTOs
- `product-media.dto.ts` - Product media DTOs
- `index.ts` - Export all DTOs

**Key DTOs needed**:
```typescript
// Core DTOs
- ProductDto
- CreateProductDto
- UpdateProductDto
- QueryProductRequest
- QueryProductResponse

// Variant DTOs
- ProductVariantDto
- CreateProductVariantDto
- UpdateProductVariantDto

// Media DTOs
- ProductMediaDto
- AttachMediaToProductDto
```

#### 1.2 Update Shared Package Exports
**Location**: `packages/nest-shared/src/contracts/index.ts`
- Export all new product contracts

### Phase 2: Core Service Implementation (Days 3-5)
**Goal**: Implement the products service with basic CRUD operations

#### 2.1 Products Service Implementation
**Location**: `services/products/src/modules/products/products.service.ts`

**Key methods to implement**:
```typescript
// Core CRUD
- create(dto: CreateProductDto): Promise<ProductDto>
- findAll(query: QueryProductRequest): Promise<QueryProductResponse>
- findOne(id: string): Promise<ProductDto>
- update(id: string, dto: UpdateProductDto): Promise<ProductDto>
- remove(id: string): Promise<ProductDto>

// Advanced queries
- findByCategory(categoryId: string, query?: QueryProductRequest): Promise<QueryProductResponse>
- findBySku(sku: string): Promise<ProductDto>
- searchProducts(searchTerm: string, query?: QueryProductRequest): Promise<QueryProductResponse>

// Variant management
- addVariant(productId: string, dto: CreateProductVariantDto): Promise<ProductVariantDto>
- updateVariant(productId: string, variantId: string, dto: UpdateProductVariantDto): Promise<ProductVariantDto>
- removeVariant(productId: string, variantId: string): Promise<void>
- getVariants(productId: string): Promise<ProductVariantDto[]>
```

**Business Logic to implement**:
- SKU uniqueness validation
- Price validation (positive numbers)
- Category assignment validation
- Product activation/deactivation
- Soft delete implementation
- Query optimization with proper joins

#### 2.2 Products Controller Implementation  
**Location**: `services/products/src/modules/products/products.controller.ts`

**Endpoints to implement**:
```typescript
// Core CRUD endpoints
POST   /products              - Create product
GET    /products              - List products with filtering/pagination
GET    /products/search       - Advanced search
GET    /products/:id          - Get product by ID
GET    /products/sku/:sku     - Get product by SKU
PUT    /products/:id          - Update product
DELETE /products/:id          - Delete product

// Category-related endpoints
GET    /products/category/:categoryId - Get products by category

// Variant endpoints
POST   /products/:id/variants          - Add variant
GET    /products/:id/variants          - Get variants
PUT    /products/:id/variants/:variantId - Update variant
DELETE /products/:id/variants/:variantId - Delete variant
```

**Features to implement**:
- JWT authentication guards
- Input validation with DTOs
- Swagger documentation
- Error handling and HTTP status codes
- Request/response transformation

#### 2.3 Products Module Setup
**Location**: `services/products/src/modules/products/products.module.ts`

**Module configuration**:
```typescript
@Module({
  imports: [DrizzleModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
```

#### 2.4 Update App Module
**Location**: `services/products/src/app.module.ts`
- Import ProductsModule
- Ensure proper module configuration

### Phase 3: Media Integration (Days 6-7)
**Goal**: Integrate with media service for product images

#### 3.1 Media Service Integration
**Location**: `services/products/src/modules/products/products.service.ts`

**New methods to add**:
```typescript
// Media management
- attachMedia(productId: string, dto: AttachMediaToProductDto): Promise<ProductMediaDto>
- detachMedia(productId: string, mediaId: string): Promise<void>
- getProductMedia(productId: string): Promise<ProductMediaDto[]>
- updatePrimaryImage(productId: string, mediaId: string): Promise<ProductDto>
```

#### 3.2 Media Controller Endpoints
**Location**: `services/products/src/modules/products/products.controller.ts`

**New endpoints**:
```typescript
POST   /products/:id/media        - Attach media to product
GET    /products/:id/media        - Get product media
DELETE /products/:id/media/:mediaId - Remove media from product
PUT    /products/:id/media/:mediaId/primary - Set as primary image
```

#### 3.3 Media DTOs Implementation
**Location**: `packages/nest-shared/src/contracts/products/product-media.dto.ts`

### Phase 4: API Gateway Integration (Day 8)
**Goal**: Expose products endpoints through API Gateway

#### 4.1 API Gateway Routes
**Location**: `services/api-gateway/src/modules/products/`

**Files to create**:
- `products.controller.ts` - Proxy controller
- `products.service.ts` - API client service  
- `products.module.ts` - Module setup

#### 4.2 API Client Generation
**Location**: `services/api-gateway/src/api-clients/`
- Generate products API client
- Update existing API client configurations

#### 4.3 Update API Gateway App Module
**Location**: `services/api-gateway/src/app.module.ts`
- Import ProductsModule
- Configure routing

### Phase 5: Testing and Documentation (Days 9-10)
**Goal**: Comprehensive testing and documentation

#### 5.1 Unit Tests
**Location**: `services/products/src/modules/products/`
- `products.service.spec.ts` - Service unit tests
- `products.controller.spec.ts` - Controller unit tests

#### 5.2 Integration Tests
**Location**: `services/products/test/`
- End-to-end API tests
- Database integration tests

#### 5.3 API Documentation
- Complete Swagger documentation
- Update service README
- API usage examples

## Technical Considerations

### Database Optimization
- **Indexing Strategy**: 
  - Products: SKU, name, isActive, createdAt
  - Product categories: productId, categoryId
  - Product variants: productId, name+value composite
  - Product media: productId, mediaId

- **Query Optimization**:
  - Use proper joins for related data
  - Implement efficient pagination
  - Consider query complexity for large datasets

### Error Handling
- **Validation Errors**: Proper DTO validation with meaningful messages
- **Database Errors**: Handle unique constraint violations, foreign key errors
- **Business Logic Errors**: Custom exceptions for business rules
- **External Service Errors**: Graceful handling of media service failures

### Performance Considerations
- **Caching Strategy**: Consider caching frequently accessed products
- **Pagination**: Efficient offset-based pagination for large catalogs
- **Query Optimization**: Use database indexes and efficient joins
- **Media Loading**: Lazy loading of product images when needed

### Security
- **Authentication**: JWT validation on all protected endpoints
- **Authorization**: Ensure users can only access permitted data
- **Input Validation**: Comprehensive validation of all inputs
- **SQL Injection**: Use parameterized queries through Drizzle ORM

## File Structure Overview

```
services/products/
├── prd/
│   └── products-feature-prd.md          # ✅ Created
├── src/
│   ├── modules/
│   │   ├── products/
│   │   │   ├── products.controller.ts   # ❌ To implement
│   │   │   ├── products.service.ts      # ❌ To implement
│   │   │   ├── products.module.ts       # ❌ To implement
│   │   │   ├── products.service.spec.ts # ❌ To implement
│   │   │   └── products.controller.spec.ts # ❌ To implement
│   │   └── categories/                  # ✅ Already implemented
│   └── app.module.ts                    # ❌ Needs update

packages/nest-shared/src/contracts/
├── products/                            # ❌ To create
│   ├── product.dto.ts
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   ├── query-product.dto.ts
│   ├── product-variant.dto.ts
│   ├── product-media.dto.ts
│   └── index.ts
└── index.ts                             # ❌ Needs update

services/api-gateway/src/modules/
└── products/                            # ❌ To create
    ├── products.controller.ts
    ├── products.service.ts
    └── products.module.ts
```

## Success Metrics

### Functional Success
- [ ] All CRUD operations working correctly
- [ ] Product search and filtering functional
- [ ] Variant management operational
- [ ] Media integration complete
- [ ] API Gateway integration working

### Performance Success
- [ ] Response times < 200ms for standard queries
- [ ] Support for 10K+ products with efficient pagination
- [ ] Database queries optimized with proper indexing
- [ ] No N+1 query problems

### Code Quality Success
- [ ] 90%+ test coverage
- [ ] All linting rules passing
- [ ] Complete API documentation
- [ ] Proper error handling throughout
- [ ] Type safety maintained

## Dependencies and Risks

### Internal Dependencies
- **Categories Service**: Already implemented ✅
- **Media Service**: Required for media integration
- **API Gateway**: Required for external access
- **Authentication**: JWT setup already working ✅

### External Dependencies
- **Database**: PostgreSQL with Drizzle ORM ✅
- **Authentication**: Keycloak integration ✅

### Risk Mitigation
- **Database Schema Changes**: Minimal risk as schema is already defined
- **Media Service Integration**: Implement graceful degradation if media service is unavailable
- **Performance**: Implement proper indexing and query optimization from the start
- **Testing**: Comprehensive testing to catch issues early

## Next Steps

1. **Start with Phase 1**: Create all necessary DTOs and contracts
2. **Follow sequential implementation**: Each phase builds on the previous
3. **Test continuously**: Don't wait until the end to test functionality
4. **Document as you go**: Keep documentation up to date with implementation
5. **Performance monitoring**: Monitor query performance as you implement

This implementation plan provides a structured approach to building a robust, scalable products service that integrates seamlessly with the existing microservices architecture.
