import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InventoryItemForm } from "./inventory-item-form";
import { useInventoryItem, useUpdateInventoryItem } from "../../hooks";
import type { UpdateInventoryItemDto } from "../../types";
import { Loader2 } from "lucide-react";

interface EditInventoryItemDialogProps {
  inventoryItemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditInventoryItemDialog({
  inventoryItemId,
  open,
  onOpenChange,
  onSuccess,
}: EditInventoryItemDialogProps) {
  const { data: inventoryItem, isLoading } = useInventoryItem(
    inventoryItemId || undefined,
  );
  const { mutateAsync: updateInventoryItem, isPending } =
    useUpdateInventoryItem();

  const handleSubmit = async (data: UpdateInventoryItemDto) => {
    if (!inventoryItemId) return;
    await updateInventoryItem({ id: inventoryItemId, item: data });
    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : inventoryItem ? (
            <InventoryItemForm
              inventoryItem={inventoryItem}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isPending}
            />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Inventory item not found or could not be loaded.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
