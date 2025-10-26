import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InventoryItemForm } from "./inventory-item-form";
import { useCreateInventoryItem } from "../../hooks";

interface CreateInventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  productId?: string;
  initialWarehouseId?: string;
}

export function CreateInventoryItemDialog({
  open,
  onOpenChange,
  onSuccess,
  productId,
  initialWarehouseId,
}: CreateInventoryItemDialogProps) {
  const { mutateAsync: createInventoryItem, isPending } =
    useCreateInventoryItem();

  const handleSubmit = async (data: any) => {
    await createInventoryItem(data);
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
          <DialogTitle>Create New Inventory Item</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <InventoryItemForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isPending}
            productId={productId}
            initialWarehouseId={initialWarehouseId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
