import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateOrder } from "@/modules/orders/hooks/use-orders";
import type { ApiSchema } from "@/http-clients";
import { toast } from "sonner";

type OrderDto = ApiSchema["OrderDto"];
type OrderStatus = OrderDto["status"];

interface UpdateOrderStatusDialogProps {
  order: OrderDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

export function UpdateOrderStatusDialog({
  order,
  open,
  onOpenChange,
}: UpdateOrderStatusDialogProps) {
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const updateOrder = useUpdateOrder();

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setNotes("");
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!order || !status) return;

    try {
      await updateOrder.mutateAsync({
        id: order.id,
        order: { status },
      });

      toast.success("Order status updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Failed to update order status:", error);
    }
  };

  const handleCancel = () => {
    setStatus(order?.status);
    setNotes("");
    onOpenChange(false);
  };

  // Validate status transitions
  const getValidStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    const statusMap: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED", "CANCELLED"],
      DELIVERED: ["REFUNDED"],
      CANCELLED: ["REFUNDED"],
      REFUNDED: [],
    };

    return statusMap[currentStatus] || [];
  };

  const validStatuses = order ? getValidStatuses(order.status) : [];
  const canChangeStatus = validStatuses.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of order {order?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!canChangeStatus ? (
              <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md">
                This order cannot be updated further. The order is in a final
                state ({order?.status}).
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="status">New Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as OrderStatus)}
                    disabled={!canChangeStatus}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.filter((s) =>
                        validStatuses.includes(s.value),
                      ).map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Current status: {order?.status}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes about this status change..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            {canChangeStatus && (
              <Button
                type="submit"
                disabled={
                  updateOrder.isPending || !status || status === order?.status
                }
              >
                {updateOrder.isPending ? "Updating..." : "Update Status"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
