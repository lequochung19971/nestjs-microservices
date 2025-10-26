import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useInventoryItems } from "../../hooks";
import type { CreateInventoryTransactionDto } from "../../types";

// Define schema for form validation
const transactionFormSchema = z.object({
  inventoryItemId: z.string().min(1, { message: "Inventory item is required" }),
  quantity: z.coerce
    .number()
    .int()
    .min(1, { message: "Quantity must be a positive number" }),
  type: z.enum(["PURCHASE", "SALE", "RETURN", "ADJUSTMENT", "TRANSFER"]),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionFormSchema>;

export interface TransactionFormProps {
  onSubmit: (data: CreateInventoryTransactionDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialInventoryItemId?: string;
}

export function TransactionForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialInventoryItemId,
}: TransactionFormProps) {
  // Get inventory items for dropdown
  const { data: inventoryItems, isLoading: inventoryItemsLoading } =
    useInventoryItems();

  const form = useForm({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      inventoryItemId: initialInventoryItemId || "",
      quantity: 1,
      type: "PURCHASE",
      referenceId: "",
      referenceType: "",
      notes: "",
    },
  });

  // Set inventory item ID if provided after items are loaded
  useEffect(() => {
    if (initialInventoryItemId) {
      form.setValue("inventoryItemId", initialInventoryItemId);
    }
  }, [initialInventoryItemId, form]);

  const handleSubmit = async (data: TransactionFormData) => {
    try {
      // Filter out empty optional fields for cleaner API payload
      const formData = {
        ...data,
        referenceId: data.referenceId || undefined,
        referenceType: data.referenceType || undefined,
        notes: data.notes || undefined,
      };
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting transaction form:", error);
    }
  };

  // Determine if transaction type is negative (decreases quantity)
  const isNegativeType = (type: string) => ["SALE", "TRANSFER"].includes(type);

  // Adjust quantity sign based on transaction type
  const adjustQuantitySign = (quantity: number, type: string) => {
    return isNegativeType(type) ? -Math.abs(quantity) : Math.abs(quantity);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="inventoryItemId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inventory Item</FormLabel>
              <FormControl>
                <Select
                  disabled={
                    inventoryItemsLoading ||
                    isSubmitting ||
                    !!initialInventoryItemId
                  }
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an inventory item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems?.data?.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {`Item ${item.id.substring(0, 8)} - Qty: ${item.quantity}`}
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Type</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PURCHASE">Purchase</SelectItem>
                      <SelectItem value="SALE">Sale</SelectItem>
                      <SelectItem value="RETURN">Return</SelectItem>
                      <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                      <SelectItem value="TRANSFER">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field: { value, ...field } }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={value as number}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="referenceId"
            render={({ field: { value, ...field } }) => (
              <FormItem>
                <FormLabel>Reference ID (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Order ID, Purchase ID, etc."
                    value={value as string}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="referenceType"
            render={({ field: { value, ...field } }) => (
              <FormItem>
                <FormLabel>Reference Type (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="order, purchase, etc."
                    value={value as string}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add notes about this transaction"
                  {...field}
                />
              </FormControl>
              <FormMessage />
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
            {isSubmitting ? "Processing..." : "Create Transaction"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
