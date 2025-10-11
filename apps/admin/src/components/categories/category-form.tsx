import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '@/hooks/use-categories';
import type { ApiSchema } from '@/http-clients';

type CategoryDto = ApiSchema['CategoryDto'];
type CreateCategoryDto = ApiSchema['CreateCategoryDto'];
type UpdateCategoryDto = ApiSchema['UpdateCategoryDto'];

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255, 'Slug is too long')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    ),
  parentId: z.string().optional().nullable(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

export interface CategoryFormProps {
  category?: CategoryDto;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const isEditing = Boolean(category);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      parentId: category?.parentId || null,
    },
  });

  const { data: categoriesData } = useCategoriesQuery({
    flat: true,
    limit: 100,
  });

  const createCategory = useCreateCategoryMutation();
  const updateCategory = useUpdateCategoryMutation();

  // Auto-generate slug from name
  const watchedName = form.watch('name');
  useEffect(() => {
    if (!isEditing && watchedName) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      form.setValue('slug', slug);
    }
  }, [watchedName, form, isEditing]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditing && category) {
        const updateData: UpdateCategoryDto = {
          name: data.name,
          slug: data.slug,
          parentId: data.parentId!,
        };
        await updateCategory.mutateAsync({ id: category.id, data: updateData });
      } else {
        const createData: CreateCategoryDto = {
          name: data.name,
          slug: data.slug,
          parentId: data.parentId!,
        };
        await createCategory.mutateAsync(createData);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const isPending = createCategory.isPending || updateCategory.isPending;

  // Filter out the current category and its descendants from parent options
  const availableParentCategories = (categoriesData?.data || []).filter((cat) => {
    if (!isEditing) return true;
    if (cat.id === category?.id) return false;
    // For now, we'll allow selecting any category as parent
    // In a more complex implementation, we'd prevent circular references
    return true;
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter category name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="category-slug" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category (Optional)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                value={field.value || 'none'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No parent (Root category)</SelectItem>
                  {availableParentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? isEditing
                ? 'Updating...'
                : 'Creating...'
              : isEditing
                ? 'Update Category'
                : 'Create Category'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
