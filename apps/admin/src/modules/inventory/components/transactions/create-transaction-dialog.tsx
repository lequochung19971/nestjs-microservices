import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "./transaction-form";
import { useCreateTransaction } from "../../hooks";
import type { CreateInventoryTransactionDto } from "../../types";

interface CreateTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  inventoryItemId?: string;
}

export function CreateTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
  inventoryItemId,
}: CreateTransactionDialogProps) {
  const { mutateAsync: createTransaction, isPending } = useCreateTransaction();

  const handleSubmit = async (data: CreateInventoryTransactionDto) => {
    await createTransaction(data);
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
          <DialogTitle>Record Inventory Transaction</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <TransactionForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isPending}
            initialInventoryItemId={inventoryItemId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
