import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { WarehouseDto } from "../../types";

// Define schema for form validation
const warehouseFormSchema = z.object({
  name: z.string().min(1, { message: "Warehouse name is required" }).max(255),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
});

type WarehouseFormData = z.infer<typeof warehouseFormSchema>;

export interface WarehouseFormProps {
  warehouse?: WarehouseDto;
  onSubmit: (data: WarehouseFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function WarehouseForm({
  warehouse,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: WarehouseFormProps) {
  const form = useForm({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      name: warehouse?.name || "",
      address: warehouse?.address || "",
      isActive: warehouse?.isActive ?? true,
    },
  });

  const handleSubmit = async (data: WarehouseFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting warehouse form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Warehouse name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Warehouse address" {...field} />
              </FormControl>
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
                <FormLabel>Active</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Warehouse is available for inventory operations
                </p>
              </div>
            </FormItem>
          )}
        />

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
              : warehouse
                ? "Update Warehouse"
                : "Create Warehouse"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
