import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/modules/products/hooks/use-products";
import { useCategoriesQuery } from "@/modules/categories/hooks/use-categories";
import type { ApiSchema } from "@/http-clients";

type ProductDto = ApiSchema["ProductDto"];
type CreateProductDto = ApiSchema["CreateProductDto"];
type UpdateProductDto = ApiSchema["UpdateProductDto"];

const productFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  sku: z.string().min(1, "SKU is required").max(100, "SKU is too long"),
  description: z.string().optional(),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid price (e.g., 29.99)"),
  currency: z.enum(["USD", "EUR", "GBP", "JPY", "CAD", "AUD"]),
  isActive: z.boolean(),
  categoryIds: z.array(z.string()).optional(),
  variants: z
    .array(
      z.object({
        name: z.string().min(1, "Variant name is required"),
        value: z.string().min(1, "Variant value is required"),
      }),
    )
    .optional(),
  imageIds: z.array(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export interface ProductFormProps {
  product?: ProductDto;
  onSuccess: () => void;
  onCancel: () => void;
  selectedImageIds?: string[];
  onOpenMediaSelector?: () => void;
}

export function ProductForm({
  product,
  onSuccess,
  onCancel,
  selectedImageIds = [],
  onOpenMediaSelector,
}: ProductFormProps) {
  const isEditing = Boolean(product);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    product?.categories?.map((cat) => cat.id) || [],
  );

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      sku: product?.sku || "",
      description: product?.description || "",
      price: product?.price || "",
      currency: product?.currency || "USD",
      isActive: product?.isActive ?? true,
      categoryIds: product?.categories?.map((cat) => cat.id) || [],
      variants:
        product?.variants?.map((variant) => ({
          name: variant.name,
          value: variant.value,
        })) || [],
      imageIds: selectedImageIds,
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const { data: categoriesData } = useCategoriesQuery({
    flat: true,
    limit: 100,
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  // Auto-generate SKU from name
  const watchedName = form.watch("name");
  useEffect(() => {
    if (!isEditing && watchedName) {
      const sku = watchedName
        .toUpperCase()
        .replace(/[^A-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 20);
      form.setValue("sku", sku);
    }
  }, [watchedName, form, isEditing]);

  // Update imageIds when selectedImageIds changes
  useEffect(() => {
    form.setValue("imageIds", selectedImageIds);
  }, [selectedImageIds, form]);

  // Update categoryIds when selectedCategoryIds changes
  useEffect(() => {
    form.setValue("categoryIds", selectedCategoryIds);
  }, [selectedCategoryIds, form]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isEditing && product) {
        const updateData: UpdateProductDto = {
          name: data.name,
          sku: data.sku,
          description: data.description,
          price: data.price,
          currency: data.currency,
          isActive: data.isActive,
          categoryIds: data.categoryIds,
          imageIds: data.imageIds,
        };
        await updateProduct.mutateAsync({
          id: product.id,
          product: updateData,
        });
      } else {
        const createData: CreateProductDto = {
          name: data.name,
          sku: data.sku,
          description: data.description,
          price: data.price,
          currency: data.currency,
          isActive: data.isActive,
          categoryIds: data.categoryIds,
          variants: data.variants,
          imageIds: data.imageIds,
        };
        await createProduct.mutateAsync(createData);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="PRODUCT-001" {...field} />
                  </FormControl>
                  <FormDescription>
                    Stock Keeping Unit - must be unique
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input placeholder="29.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active Product</FormLabel>
                    <FormDescription>
                      Product is visible and available for purchase
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Categories */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Categories</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {selectedCategoryIds.length > 0 ? (
                selectedCategoryIds.map((categoryId) => {
                  const category = categoriesData?.data?.find(
                    (cat) => cat.id === categoryId,
                  );
                  return category ? (
                    <Badge
                      key={categoryId}
                      variant="secondary"
                      className="gap-1"
                    >
                      {category.name}
                      <button
                        type="button"
                        onClick={() => handleCategoryToggle(categoryId)}
                        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })
              ) : (
                <span className="text-sm text-muted-foreground">
                  No categories selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {categoriesData?.data?.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-muted p-2 rounded"
                >
                  <Checkbox
                    checked={selectedCategoryIds.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Product Variants */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Product Variants</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendVariant({ name: "", value: "" })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </div>

          {variantFields.length > 0 ? (
            <div className="space-y-3">
              {variantFields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-end">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Variant Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Color, Size" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variants.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Variant Value</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Red, Large" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeVariant(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No variants added. Variants help you track different options like
              color, size, etc.
            </p>
          )}
        </div>

        <Separator />

        {/* Media Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Product Images</h3>
            {onOpenMediaSelector && (
              <Button
                type="button"
                variant="outline"
                onClick={onOpenMediaSelector}
              >
                Select Images
              </Button>
            )}
          </div>

          {selectedImageIds.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {selectedImageIds.length} image
              {selectedImageIds.length !== 1 ? "s" : ""} selected
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No images selected</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
                ? "Update Product"
                : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
