import { useState } from "react";
import { Plus } from "lucide-react";
import {
  OrdersTable,
  OrderDetailsDialog,
  UpdateOrderStatusDialog,
  CancelOrderDialog,
  CreateOrderDialog,
} from "@/modules/orders/components";
import { Button } from "@/components/ui/button";
import type { ApiSchema } from "@/http-clients";

type OrderDto = ApiSchema["OrderDto"];

export function OrdersPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);

  const handleViewOrder = (order: OrderDto) => {
    setSelectedOrderId(order.id);
    setDetailsDialogOpen(true);
  };

  const handleUpdateStatus = (order: OrderDto) => {
    setSelectedOrder(order);
    setUpdateStatusDialogOpen(true);
  };

  const handleCancelOrder = (order: OrderDto) => {
    setSelectedOrder(order);
    setCancelDialogOpen(true);
  };

  const handleUpdateStatusFromDetails = (order: OrderDto) => {
    setDetailsDialogOpen(false);
    handleUpdateStatus(order);
  };

  const handleCancelOrderFromDetails = (order: OrderDto) => {
    setDetailsDialogOpen(false);
    handleCancelOrder(order);
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
    setSelectedOrderId(null);
  };

  const handleUpdateStatusDialogClose = () => {
    setUpdateStatusDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            Manage customer orders and fulfillment
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </div>

      <OrdersTable
        onViewOrder={handleViewOrder}
        onCancelOrder={handleCancelOrder}
      />

      <CreateOrderDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <OrderDetailsDialog
        orderId={selectedOrderId}
        open={detailsDialogOpen}
        onOpenChange={handleDetailsDialogClose}
        onUpdateStatus={handleUpdateStatusFromDetails}
        onCancelOrder={handleCancelOrderFromDetails}
      />

      <UpdateOrderStatusDialog
        order={selectedOrder}
        open={updateStatusDialogOpen}
        onOpenChange={handleUpdateStatusDialogClose}
      />

      <CancelOrderDialog
        order={selectedOrder}
        open={cancelDialogOpen}
        onOpenChange={handleCancelDialogClose}
      />
    </div>
  );
}
