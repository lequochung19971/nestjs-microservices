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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCancelOrder } from "@/modules/orders/hooks/use-orders";
import type { ApiSchema } from "@/http-clients";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

type OrderDto = ApiSchema["OrderDto"];

interface CancelOrderDialogProps {
  order: OrderDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelOrderDialog({
  order,
  open,
  onOpenChange,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState("");
  const cancelOrder = useCancelOrder();

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!order) return;

    try {
      await cancelOrder.mutateAsync({
        id: order.id,
        reason: reason || undefined,
      });

      toast.success("Order cancelled successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to cancel order");
      console.error("Failed to cancel order:", error);
    }
  };

  const handleCancel = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order {order?.orderNumber}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This action cannot be undone. The order will be marked as
                cancelled and any reserved inventory will be released.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="reason">Cancellation Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Provide a reason for cancelling this order..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This reason will be recorded in the order's status history.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Keep Order
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={cancelOrder.isPending}
            >
              {cancelOrder.isPending ? "Cancelling..." : "Cancel Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
