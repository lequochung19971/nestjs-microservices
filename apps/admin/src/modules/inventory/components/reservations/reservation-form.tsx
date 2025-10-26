import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type {
  CreateInventoryReservationDto,
  InventoryReservationDto,
  UpdateInventoryReservationDto,
} from "../../types";

// Define schema for form validation
const reservationFormSchema = z.object({
  inventoryItemId: z.string().min(1, { message: "Inventory item is required" }),
  quantity: z.coerce
    .number()
    .int()
    .min(1, { message: "Quantity must be a positive number" }),
  orderId: z.string().min(1, { message: "Order ID is required" }),
  expiresAt: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationFormSchema>;

export interface ReservationFormProps {
  reservation?: InventoryReservationDto;
  onSubmit: (
    data: CreateInventoryReservationDto | UpdateInventoryReservationDto,
  ) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialInventoryItemId?: string;
  initialOrderId?: string;
}

export function ReservationForm({
  reservation,
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialInventoryItemId,
  initialOrderId,
}: ReservationFormProps) {
  // Get inventory items for dropdown
  const { data: inventoryItems, isLoading: inventoryItemsLoading } =
    useInventoryItems({
      status: "AVAILABLE",
    });

  // Set default expiration date to 7 days from now
  const defaultExpiresAt = format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm");

  const form = useForm({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      inventoryItemId:
        reservation?.inventoryItemId || initialInventoryItemId || "",
      quantity: reservation?.quantity || 1,
      orderId: reservation?.orderId || initialOrderId || "",
      expiresAt: reservation?.expiresAt
        ? format(new Date(reservation.expiresAt), "yyyy-MM-dd'T'HH:mm")
        : defaultExpiresAt,
    },
  });

  // Set inventory item ID if provided after items are loaded
  useEffect(() => {
    if (initialInventoryItemId) {
      form.setValue("inventoryItemId", initialInventoryItemId);
    }
    if (initialOrderId) {
      form.setValue("orderId", initialOrderId);
    }
  }, [initialInventoryItemId, initialOrderId, form]);

  const handleSubmit = async (data: ReservationFormData) => {
    try {
      // Filter out empty optional fields for cleaner API payload
      const formData = {
        ...data,
      };
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting reservation form:", error);
    }
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
                    !!reservation ||
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
                        {`Item ${item.id.substring(0, 8)} - Available: ${item.quantity}`}
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
                <FormLabel>Quantity to Reserve</FormLabel>
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

          <FormField
            control={form.control}
            name="orderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order ID</FormLabel>
                <FormControl>
                  <Input placeholder="Order ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiration Date/Time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
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
            {isSubmitting
              ? "Processing..."
              : reservation
                ? "Update Reservation"
                : "Create Reservation"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
