import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WarehouseForm } from "./warehouse-form";
import { useCreateWarehouse } from "../../hooks";
import type { CreateWarehouseDto } from "../../types";

interface CreateWarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateWarehouseDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateWarehouseDialogProps) {
  const { mutateAsync: createWarehouse, isPending } = useCreateWarehouse();

  const handleSubmit = async (data: CreateWarehouseDto) => {
    await createWarehouse(data);
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
          <DialogTitle>Create New Warehouse</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <WarehouseForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
