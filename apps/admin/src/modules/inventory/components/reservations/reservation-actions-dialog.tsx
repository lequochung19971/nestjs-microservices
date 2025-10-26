import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useCancelReservation,
  useFulfillReservation,
  useReservation,
} from "../../hooks";
import type { CancelReservationDto, FulfillReservationDto } from "../../types";

interface ReservationActionsDialogProps {
  reservationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Schemas for form validation
const fulfillFormSchema = z.object({
  notes: z.string().optional(),
});

const cancelFormSchema = z.object({
  reason: z.string().optional(),
});

type FulfillFormData = z.infer<typeof fulfillFormSchema>;
type CancelFormData = z.infer<typeof cancelFormSchema>;

export function ReservationActionsDialog({
  reservationId,
  open,
  onOpenChange,
  onSuccess,
}: ReservationActionsDialogProps) {
  const [activeTab, setActiveTab] = useState("details");

  const { data: reservation, isLoading } = useReservation(
    reservationId || undefined,
  );
  const { mutateAsync: fulfillReservation, isPending: isFulfilling } =
    useFulfillReservation();
  const { mutateAsync: cancelReservation, isPending: isCancelling } =
    useCancelReservation();

  const fulfillForm = useForm<FulfillFormData>({
    resolver: zodResolver(fulfillFormSchema),
    defaultValues: {
      notes: "",
    },
  });

  const cancelForm = useForm<CancelFormData>({
    resolver: zodResolver(cancelFormSchema),
    defaultValues: {
      reason: "",
    },
  });

  const handleFulfill = async (data: FulfillFormData) => {
    if (!reservationId) return;

    const fulfillmentData: FulfillReservationDto = {
      notes: data.notes,
    };

    await fulfillReservation({
      id: reservationId,
      fulfillmentData,
    });

    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  const handleCancel = async (data: CancelFormData) => {
    if (!reservationId) return;

    const cancellationData: CancelReservationDto = {
      reason: data.reason,
    };

    await cancelReservation({
      id: reservationId,
      cancellationData,
    });

    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // Get formatted date
  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (error) {
      return dateString;
    }
  };

  // Get status badge
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge>Active</Badge>;
      case "FULFILLED":
        return <Badge variant="default">Fulfilled</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "EXPIRED":
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Check if reservation can be fulfilled or cancelled
  const canFulfill = reservation && reservation.status === "ACTIVE";
  const canCancel = reservation && reservation.status === "ACTIVE";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reservation Management</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reservation ? (
          <div className="py-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              defaultValue="details"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="fulfill" disabled={!canFulfill}>
                  Fulfill
                </TabsTrigger>
                <TabsTrigger value="cancel" disabled={!canCancel}>
                  Cancel
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Reservation Details</h3>
                  {getStatusBadge(reservation.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Reservation ID
                    </p>
                    <p className="font-mono text-sm">{reservation.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono text-sm">{reservation.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Quantity Reserved
                    </p>
                    <p className="font-semibold">{reservation.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Inventory Item ID
                    </p>
                    <p className="font-mono text-sm">
                      {reservation.inventoryItemId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created At</p>
                    <p>{getFormattedDate(reservation.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expires At</p>
                    <p>{getFormattedDate(reservation.expiresAt)}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button onClick={handleClose}>Close</Button>
                </div>
              </TabsContent>

              <TabsContent value="fulfill" className="space-y-4 py-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Fulfill Reservation
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Fulfilling this reservation will mark it as fulfilled and
                    will update the inventory accordingly. This action cannot be
                    undone.
                  </p>

                  <Form {...fulfillForm}>
                    <form
                      onSubmit={fulfillForm.handleSubmit(handleFulfill)}
                      className="space-y-4"
                    >
                      <FormField
                        control={fulfillForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add notes about this fulfillment"
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
                          onClick={handleClose}
                          disabled={isFulfilling}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isFulfilling}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isFulfilling
                            ? "Processing..."
                            : "Fulfill Reservation"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </TabsContent>

              <TabsContent value="cancel" className="space-y-4 py-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Cancel Reservation
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cancelling this reservation will release the reserved
                    inventory back to available stock. This action cannot be
                    undone.
                  </p>

                  <Form {...cancelForm}>
                    <form
                      onSubmit={cancelForm.handleSubmit(handleCancel)}
                      className="space-y-4"
                    >
                      <FormField
                        control={cancelForm.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Cancellation Reason (Optional)
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add reason for cancellation"
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
                          onClick={handleClose}
                          disabled={isCancelling}
                        >
                          Close
                        </Button>
                        <Button
                          type="submit"
                          disabled={isCancelling}
                          variant="destructive"
                        >
                          {isCancelling
                            ? "Processing..."
                            : "Cancel Reservation"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Reservation not found or could not be loaded.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
