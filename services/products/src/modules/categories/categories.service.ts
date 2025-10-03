import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, desc, eq, isNull, like, sql, SQL } from 'drizzle-orm';
import {
  CategoryDto,
  CreateCategoryDto,
  QueryCategoryRequest,
  QueryCategoryResponse,
  SortField,
  SortOrder,
  UpdateCategoryDto,
} from 'nest-shared/contracts';
import { DrizzleService } from '../../db/drizzle.service';
import { categories } from '../../db/schema';

@Injectable()
export class CategoriesService {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(dto: CreateCategoryDto): Promise<CategoryDto> {
    // Check if parent exists if parentId is provided
    // if (dto.parentId) {
    //   const parentLevel = await this.getCategoryLevel(dto.parentId);

    //   // Check if adding this category would exceed the 3-level nesting limit
    //   if (parentLevel >= 3) {
    //     throw new BadRequestException(
    //       'Cannot create category: maximum nesting level (3) exceeded',
    //     );
    //   }
    // }

    // Check if slug is unique
    const existingCategory = await this.drizzle.client
      .select()
      .from(categories)
      .where(eq(categories.slug, dto.slug))
      .execute();

    if (existingCategory.length > 0) {
      throw new BadRequestException(
        `Category with slug '${dto.slug}' already exists`,
      );
    }

    // Create the category
    const [newCategory] = await this.drizzle.client
      .insert(categories)
      .values({
        name: dto.name,
        slug: dto.slug,
        parentId: dto.parentId || null,
      })
      .returning()
      .execute();

    return new CategoryDto(newCategory);
  }

  async findAll(query?: QueryCategoryRequest): Promise<QueryCategoryResponse> {
    // Start with a base query
    const baseQuery = this.drizzle.client.select().from(categories);

    // Build conditions array
    const conditions: SQL[] = [];

    // Add search condition if provided
    if (query?.search) {
      conditions.push(like(categories.name, `%${query.search}%`));
    }

    // Add parent ID condition if provided
    if (query?.parentId) {
      conditions.push(eq(categories.parentId, query.parentId));
    } else if (query?.parentId === '') {
      conditions.push(isNull(categories.parentId));
    }

    if (conditions.length > 0) {
      baseQuery.where(and(...conditions));
    }

    const [totalCount] = await this.drizzle.client
      .select({
        count: count(),
      })
      .from(categories)
      .where(and(...conditions));

    // Sort the results in memory since we already have them
    if (query?.sortBy === SortField.NAME) {
      baseQuery.orderBy(
        query.sortOrder === SortOrder.ASC
          ? asc(categories[query.sortBy])
          : desc(categories[query.sortBy]),
      );
    }

    // If flat structure is requested, apply pagination and return
    if (query?.page && query?.limit) {
      const page = query?.page || 1;
      const limit = query?.limit || 10;
      const offset = (page - 1) * limit;

      baseQuery.limit(limit).offset(offset);
    }

    const allCategories = await baseQuery.execute();

    // For hierarchical structure, build the tree
    const rootCategories = allCategories.filter((c) => !c.parentId);
    const categoriesMap = new Map<string, CategoryDto>();

    // Create a map for quick lookup
    allCategories.forEach((category) => {
      categoriesMap.set(
        category.id,
        new CategoryDto({
          ...category,
          children: [],
        }),
      );
    });

    // Build the tree
    allCategories.forEach((category) => {
      if (category.parentId) {
        const parent = categoriesMap.get(category.parentId);
        if (parent) {
          parent.children!.push(categoriesMap.get(category.id)!);
        }
      }
    });

    // Return only root categories with their children
    return {
      data: rootCategories.map((c) => categoriesMap.get(c.id)!),
      meta: {
        page: query?.page || 1,
        limit: query?.limit || 10,
        totalCount: totalCount.count,
        totalPages: Math.ceil(totalCount.count / (query?.limit || 10)),
      },
    };
  }

  async findOne(id: string): Promise<CategoryDto> {
    const [category] = await this.drizzle.client
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .execute();

    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    // Get children for this category
    const children = await this.drizzle.client
      .select()
      .from(categories)
      .where(eq(categories.parentId, id))
      .execute();

    return new CategoryDto({
      ...category,
      children: children.map((child) => new CategoryDto(child)),
    });
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDto> {
    // Check if category exists
    const [existingCategory] = await this.drizzle.client
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .execute();

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    // Check nesting level if parentId is being updated
    if (dto.parentId && dto.parentId !== existingCategory.parentId) {
      // Prevent circular references
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      // Check if new parent exists
      const [parentCategory] = await this.drizzle.client
        .select()
        .from(categories)
        .where(eq(categories.id, dto.parentId))
        .execute();

      if (!parentCategory) {
        throw new NotFoundException(
          `Parent category with ID '${dto.parentId}' not found`,
        );
      }

      // Check if the new parent is a descendant of the current category
      // This would create a cycle in the tree
      const isDescendant = await this.isDescendant(id, dto.parentId);
      if (isDescendant) {
        throw new BadRequestException(
          'Cannot set a descendant as parent (would create a cycle)',
        );
      }

      // // Check if moving would exceed max nesting level
      // const parentLevel = await this.getCategoryLevel(dto.parentId);
      // if (parentLevel >= 3) {
      //   throw new BadRequestException(
      //     'Cannot move category: maximum nesting level (3) exceeded',
      //   );
      // }
    }

    // Check slug uniqueness if it's being updated
    if (dto.slug && dto.slug !== existingCategory.slug) {
      const slugExists = await this.drizzle.client
        .select()
        .from(categories)
        .where(
          and(eq(categories.slug, dto.slug), sql`${categories.id} != ${id}`),
        )
        .execute();

      if (slugExists.length > 0) {
        throw new BadRequestException(
          `Category with slug '${dto.slug}' already exists`,
        );
      }
    }

    // Update the category
    const [updatedCategory] = await this.drizzle.client
      .update(categories)
      .set({
        name: dto.name !== undefined ? dto.name : existingCategory.name,
        slug: dto.slug !== undefined ? dto.slug : existingCategory.slug,
        parentId:
          dto.parentId !== undefined ? dto.parentId : existingCategory.parentId,
      })
      .where(eq(categories.id, id))
      .returning()
      .execute();

    return new CategoryDto(updatedCategory);
  }

  async remove(id: string): Promise<CategoryDto> {
    // Check if category exists
    const [existingCategory] = await this.drizzle.client
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .execute();

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    // Check if category has children
    const children = await this.drizzle.client
      .select()
      .from(categories)
      .where(eq(categories.parentId, id))
      .execute();

    if (children.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with children. Delete children first or move them to another category.',
      );
    }

    // Delete the category
    const [deletedCategory] = await this.drizzle.client
      .delete(categories)
      .where(eq(categories.id, id))
      .returning()
      .execute();

    return new CategoryDto(deletedCategory);
  }

  /**
   * Helper method to get the nesting level of a category
   * Level 1: Root category (no parent)
   * Level 2: Child of root category
   * Level 3: Child of level 2 category
   */
  private async getCategoryLevel(categoryId: string | null): Promise<number> {
    if (!categoryId) return 1; // Root level

    let currentId = categoryId;
    let level = 1;

    while (currentId && level <= 3) {
      const [category] = await this.drizzle.client
        .select()
        .from(categories)
        .where(eq(categories.id, currentId))
        .execute();

      if (!category) break;
      if (!category.parentId) break;

      currentId = category.parentId;
      level++;
    }

    return level;
  }

  /**
   * Check if potentialDescendantId is a descendant of ancestorId
   */
  private async isDescendant(
    ancestorId: string,
    potentialDescendantId: string,
  ): Promise<boolean> {
    let currentId = potentialDescendantId;

    while (currentId) {
      const [category] = await this.drizzle.client
        .select()
        .from(categories)
        .where(eq(categories.id, currentId))
        .execute();

      if (!category || !category.parentId) break;

      if (category.parentId === ancestorId) {
        return true;
      }

      currentId = category.parentId;
    }

    return false;
  }
}

export default CategoriesService;
