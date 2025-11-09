import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrder } from "@/modules/orders/hooks/use-orders";
import type { ApiSchema } from "@/http-clients";
import { AlertCircle, Edit, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type OrderDto = ApiSchema["OrderDto"];

interface OrderDetailsDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus?: (order: OrderDto) => void;
  onCancelOrder?: (order: OrderDto) => void;
}

export function OrderDetailsDialog({
  orderId,
  open,
  onOpenChange,
  onUpdateStatus,
  onCancelOrder,
}: OrderDetailsDialogProps) {
  const { data: order, isLoading, error } = useOrder(orderId || "");

  const formatPrice = (price: string) => {
    const amount = parseFloat(price);
    return `$${amount.toFixed(2)}`;
  };

  const getOrderStatusVariant = (
    status: OrderDto["status"],
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "PENDING":
        return "outline";
      case "CONFIRMED":
        return "default";
      case "PROCESSING":
        return "secondary";
      case "SHIPPED":
        return "default";
      case "DELIVERED":
        return "default";
      case "CANCELLED":
        return "destructive";
      case "REFUNDED":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPaymentStatusVariant = (
    status: OrderDto["paymentStatus"],
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "PENDING":
        return "outline";
      case "PAID":
        return "default";
      case "FAILED":
        return "destructive";
      case "REFUNDED":
        return "secondary";
      case "PARTIALLY_REFUNDED":
        return "outline";
      default:
        return "outline";
    }
  };

  if (!orderId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            View comprehensive order information and manage order status
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">
              Loading order details...
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load order details: {error.message}
            </AlertDescription>
          </Alert>
        )}

        {order && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold font-mono">
                    {order.orderNumber}
                  </h3>
                  <Badge variant={getOrderStatusVariant(order.status)}>
                    {order.status.replace("_", " ")}
                  </Badge>
                  <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
                    {order.paymentStatus.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Created: {format(new Date(order.createdAt), "PPpp")}
                </p>
              </div>
              <div className="flex gap-2">
                {onUpdateStatus &&
                  !["CANCELLED", "REFUNDED"].includes(order.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStatus(order)}
                    >
                      <Edit className="h-4 w-4" />
                      Update Status
                    </Button>
                  )}
                {onCancelOrder &&
                  !["CANCELLED", "REFUNDED", "DELIVERED"].includes(
                    order.status,
                  ) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onCancelOrder(order)}
                    >
                      <X className="h-4 w-4" />
                      Cancel Order
                    </Button>
                  )}
              </div>
            </div>

            <Separator />

            {/* Customer Information */}
            <div>
              <h4 className="font-semibold mb-2">Customer Information</h4>
              <div className="text-sm">
                <p className="text-muted-foreground font-mono">
                  Customer ID: {order.customerId}
                </p>
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div>
              <h4 className="font-semibold mb-2">Order Items</h4>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.product?.name || "Unknown Product"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.product?.sku || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatPrice(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatPrice(item.totalPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-2 gap-4">
              {/* Shipping Address */}
              <div>
                <h4 className="font-semibold mb-2">Shipping Address</h4>
                {order.shippingAddress ? (
                  <div className="text-sm space-y-1">
                    <p>{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p>{order.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city}
                      {order.shippingAddress.state &&
                        `, ${order.shippingAddress.state}`}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    {order.shippingAddress.phone && (
                      <p className="text-muted-foreground">
                        {order.shippingAddress.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not provided</p>
                )}
              </div>

              {/* Billing Address */}
              <div>
                <h4 className="font-semibold mb-2">Billing Address</h4>
                {order.billingAddress ? (
                  <div className="text-sm space-y-1">
                    <p>{order.billingAddress.fullName}</p>
                    <p>{order.billingAddress.addressLine1}</p>
                    {order.billingAddress.addressLine2 && (
                      <p>{order.billingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.billingAddress.city}
                      {order.billingAddress.state &&
                        `, ${order.billingAddress.state}`}{" "}
                      {order.billingAddress.postalCode}
                    </p>
                    <p>{order.billingAddress.country}</p>
                    {order.billingAddress.phone && (
                      <p className="text-muted-foreground">
                        {order.billingAddress.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Same as shipping address
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Order Summary */}
            <div>
              <h4 className="font-semibold mb-2">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-mono">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span className="font-mono">
                    {formatPrice(order.taxAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="font-mono">
                    {formatPrice(order.shippingCost)}
                  </span>
                </div>
                {parseFloat(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span className="font-mono">
                      -{formatPrice(order.discountAmount)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="font-mono">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {order.payments && order.payments.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Payment Information</h4>
                  <div className="space-y-2">
                    {order.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between text-sm p-3 border rounded-lg"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={getPaymentStatusVariant(payment.status)}
                            >
                              {payment.status}
                            </Badge>
                            <span className="font-medium">
                              {payment.method}
                            </span>
                          </div>
                          {payment.transactionId && (
                            <p className="text-muted-foreground text-xs mt-1 font-mono">
                              Transaction: {payment.transactionId}
                            </p>
                          )}
                        </div>
                        <span className="font-mono font-semibold">
                          {formatPrice(payment.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Status History</h4>
                  <div className="space-y-2">
                    {order.statusHistory.map((history) => (
                      <div
                        key={history.id}
                        className="flex items-start gap-3 text-sm"
                      >
                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{history.status}</Badge>
                            <span className="text-muted-foreground text-xs">
                              {format(new Date(history.createdAt), "PPpp")}
                            </span>
                          </div>
                          {history.notes && (
                            <p className="text-muted-foreground mt-1">
                              {history.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            {order.notes && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Order Notes</h4>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
