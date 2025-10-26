import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useUpdateWarehouse, useWarehouse } from "../../hooks";
import type { UpdateWarehouseDto } from "../../types";
import { WarehouseForm } from "./warehouse-form";

interface EditWarehouseDialogProps {
  warehouseId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditWarehouseDialog({
  warehouseId,
  open,
  onOpenChange,
  onSuccess,
}: EditWarehouseDialogProps) {
  const { data: warehouse, isLoading } = useWarehouse(warehouseId || undefined);
  const { mutateAsync: updateWarehouse, isPending } = useUpdateWarehouse();

  const handleSubmit = async (data: UpdateWarehouseDto) => {
    if (!warehouseId) return;
    await updateWarehouse({ id: warehouseId, warehouse: data });
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
          <DialogTitle>Edit Warehouse</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : warehouse ? (
            <WarehouseForm
              warehouse={warehouse}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isPending}
            />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Warehouse not found or could not be loaded.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
