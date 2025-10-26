import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWarehouses } from "../../hooks";
import {
  type CreateInventoryItemDto,
  type InventoryItemDto,
  type UpdateInventoryItemDto,
} from "../../types";

// Define schema for form validation
const inventoryItemFormSchema = z.object({
  warehouseId: z.string().min(1, { message: "Warehouse is required" }),
  quantity: z.coerce
    .number()
    .int()
    .min(0, { message: "Quantity must be a positive number" }),
  status: z
    .enum(["AVAILABLE", "RESERVED", "SOLD", "DAMAGED", "RETURNED"])
    .default("AVAILABLE"),
  reorderPoint: z.coerce.number().int().min(0).optional().nullable(),
  reorderQuantity: z.coerce.number().int().min(0).optional().nullable(),
});

type InventoryItemFormData = z.infer<typeof inventoryItemFormSchema>;

export interface InventoryItemFormProps {
  inventoryItem?: InventoryItemDto;
  onSubmit: (
    data: CreateInventoryItemDto | UpdateInventoryItemDto,
  ) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  productId?: string;
  initialWarehouseId?: string;
}

export function InventoryItemForm({
  inventoryItem,
  onSubmit,
  onCancel,
  isSubmitting = false,
  productId,
  initialWarehouseId,
}: InventoryItemFormProps) {
  // Get warehouses for dropdown
  const { data: warehouses, isLoading: warehousesLoading } = useWarehouses({
    isActive: true,
  });

  const form = useForm({
    resolver: zodResolver(inventoryItemFormSchema),
    defaultValues: {
      warehouseId: inventoryItem?.warehouseId || initialWarehouseId || "",
      quantity: inventoryItem?.quantity || 0,
      status: (inventoryItem?.status || "AVAILABLE") as
        | "AVAILABLE"
        | "RESERVED"
        | "SOLD"
        | "DAMAGED"
        | "RETURNED",
      reorderPoint: inventoryItem?.reorderPoint || null,
      reorderQuantity: inventoryItem?.reorderQuantity || null,
    },
  });

  // Set warehouse ID if provided after warehouses are loaded
  useEffect(() => {
    if (initialWarehouseId && warehouses && warehouses.data?.length > 0) {
      form.setValue("warehouseId", initialWarehouseId);
    }
  }, [initialWarehouseId, warehouses, form]);

  const handleSubmit = async (data: InventoryItemFormData) => {
    try {
      // Filter out empty optional fields for cleaner API payload
      const formData = {
        ...data,
        // Include product ID if provided (for creation)
        ...(productId && { productId }),
      };
      await onSubmit(
        formData as CreateInventoryItemDto | UpdateInventoryItemDto,
      );
    } catch (error) {
      console.error("Error submitting inventory item form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="warehouseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Warehouse</FormLabel>
              <FormControl>
                <Select
                  disabled={warehousesLoading || isSubmitting}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses?.data?.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field: { value, ...field } }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={value as number}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(
                        value as
                          | "AVAILABLE"
                          | "RESERVED"
                          | "SOLD"
                          | "DAMAGED"
                          | "RETURNED",
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="RESERVED">Reserved</SelectItem>
                      <SelectItem value="SOLD">Sold</SelectItem>
                      <SelectItem value="DAMAGED">Damaged</SelectItem>
                      <SelectItem value="RETURNED">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="reorderPoint"
            render={({ field: { value, ...field } }) => (
              <FormItem>
                <FormLabel>Reorder Point</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Optional"
                    {...field}
                    value={value === null ? "" : (value as number)}
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? null
                          : parseInt(e.target.value, 10);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reorderQuantity"
            render={({ field: { value, ...field } }) => (
              <FormItem>
                <FormLabel>Reorder Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Optional"
                    {...field}
                    value={value === null ? "" : (value as number)}
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? null
                          : parseInt(e.target.value, 10);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : inventoryItem
                ? "Update Inventory"
                : "Create Inventory Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
