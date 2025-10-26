import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReservationForm } from "./reservation-form";
import { useCreateReservation } from "../../hooks";
import type {
  CreateInventoryReservationDto,
  UpdateInventoryReservationDto,
} from "../../types";

interface CreateReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  inventoryItemId?: string;
  orderId?: string;
}

export function CreateReservationDialog({
  open,
  onOpenChange,
  onSuccess,
  inventoryItemId,
  orderId,
}: CreateReservationDialogProps) {
  const { mutateAsync: createReservation, isPending } = useCreateReservation();

  const handleSubmit = async (
    data: CreateInventoryReservationDto | UpdateInventoryReservationDto,
  ) => {
    await createReservation(data as CreateInventoryReservationDto);
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
          <DialogTitle>Create Inventory Reservation</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ReservationForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isPending}
            initialInventoryItemId={inventoryItemId}
            initialOrderId={orderId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
