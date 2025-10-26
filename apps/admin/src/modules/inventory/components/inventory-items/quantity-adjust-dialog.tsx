import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useAdjustInventoryQuantity, useInventoryItem } from "../../hooks";
import type { AdjustQuantityDto } from "../../types";

interface QuantityAdjustDialogProps {
  inventoryItemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const adjustQuantitySchema = z.object({
  quantity: z.coerce.number().int().optional(),
  notes: z.string().optional(),
});

type AdjustQuantityFormData = z.infer<typeof adjustQuantitySchema>;

export function QuantityAdjustDialog({
  inventoryItemId,
  open,
  onOpenChange,
  onSuccess,
}: QuantityAdjustDialogProps) {
  const { data: inventoryItem, isLoading: itemLoading } = useInventoryItem(
    inventoryItemId || undefined,
  );
  const { mutateAsync: adjustQuantity, isPending: isAdjusting } =
    useAdjustInventoryQuantity();
  const [isIncreasing, setIsIncreasing] = useState<boolean>(true);

  const form = useForm({
    resolver: zodResolver(adjustQuantitySchema),
    defaultValues: {
      quantity: 0,
      notes: "",
    },
  });

  const handleSubmit = async (data: AdjustQuantityFormData) => {
    if (!inventoryItemId || !data.quantity) return;

    // Adjust the sign based on increase/decrease selection
    const adjustedQuantity = isIncreasing
      ? Math.abs(data.quantity)
      : -Math.abs(data.quantity);

    const adjustmentData: AdjustQuantityDto = {
      quantity: adjustedQuantity,
      notes: data.notes,
    };

    await adjustQuantity({
      id: inventoryItemId,
      adjustment: adjustmentData,
    });

    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const quantity = useWatch({ control: form.control, name: "quantity" });

  const isSubmitDisabled =
    quantity === undefined ||
    quantity === null ||
    (typeof quantity === "number" && quantity <= 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Inventory Quantity</DialogTitle>
        </DialogHeader>

        {itemLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : inventoryItem ? (
          <div className="py-4 space-y-6">
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                <span className="font-medium text-foreground">
                  Current Quantity:
                </span>{" "}
                {inventoryItem.quantity}
              </div>
              {inventoryItem.warehouseId && (
                <div>
                  <span className="font-medium text-foreground">
                    Warehouse ID:
                  </span>{" "}
                  {inventoryItem.warehouseId}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                type="button"
                variant={isIncreasing ? "default" : "outline"}
                onClick={() => setIsIncreasing(true)}
              >
                Increase
              </Button>
              <Button
                type="button"
                variant={!isIncreasing ? "default" : "outline"}
                onClick={() => setIsIncreasing(false)}
              >
                Decrease
              </Button>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Quantity to {isIncreasing ? "Add" : "Remove"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Enter quantity"
                          {...field}
                          value={
                            field.value === undefined || field.value === null
                              ? ""
                              : field.value.toString()
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add notes about this adjustment"
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
                    onClick={handleCancel}
                    disabled={isAdjusting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitDisabled || isAdjusting}
                  >
                    {isAdjusting
                      ? "Processing..."
                      : `${isIncreasing ? "Add" : "Remove"} Inventory`}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Inventory item not found or could not be loaded.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
