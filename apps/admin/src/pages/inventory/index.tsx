import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  WarehousesTable,
  CreateWarehouseDialog,
  EditWarehouseDialog,
  InventoryItemsTable,
  CreateInventoryItemDialog,
  EditInventoryItemDialog,
  QuantityAdjustDialog,
  TransactionsTable,
  CreateTransactionDialog,
  TransactionDetailsDialog,
  ReservationsTable,
  CreateReservationDialog,
  ReservationActionsDialog,
} from "@/modules/inventory/components";
import type {
  WarehouseDto,
  InventoryItemDto,
  InventoryTransactionDto,
  InventoryReservationDto,
} from "@/modules/inventory/types";

export function InventoryPage() {
  // Active tab
  const [activeTab, setActiveTab] = useState("warehouses");

  // Warehouses state
  const [createWarehouseDialogOpen, setCreateWarehouseDialogOpen] =
    useState(false);
  const [editWarehouseDialogOpen, setEditWarehouseDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<WarehouseDto | null>(null);

  // Inventory Items state
  const [createItemDialogOpen, setCreateItemDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [quantityAdjustDialogOpen, setQuantityAdjustDialogOpen] =
    useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] =
    useState<InventoryItemDto | null>(null);

  // Transactions state
  const [createTransactionDialogOpen, setCreateTransactionDialogOpen] =
    useState(false);
  const [transactionDetailsDialogOpen, setTransactionDetailsDialogOpen] =
    useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<InventoryTransactionDto | null>(null);

  // Reservations state
  const [createReservationDialogOpen, setCreateReservationDialogOpen] =
    useState(false);
  const [reservationActionsDialogOpen, setReservationActionsDialogOpen] =
    useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<InventoryReservationDto | null>(null);

  // Warehouse handlers
  const handleCreateWarehouse = () => {
    setCreateWarehouseDialogOpen(true);
  };

  const handleEditWarehouse = (warehouse: WarehouseDto) => {
    setSelectedWarehouse(warehouse);
    setEditWarehouseDialogOpen(true);
  };

  // Inventory Item handlers
  const handleCreateInventoryItem = () => {
    setCreateItemDialogOpen(true);
  };

  const handleEditInventoryItem = (item: InventoryItemDto) => {
    setSelectedInventoryItem(item);
    setEditItemDialogOpen(true);
  };

  const handleAdjustQuantity = (item: InventoryItemDto) => {
    setSelectedInventoryItem(item);
    setQuantityAdjustDialogOpen(true);
  };

  // Transaction handlers
  const handleCreateTransaction = () => {
    setCreateTransactionDialogOpen(true);
  };

  const handleViewTransaction = (transaction: InventoryTransactionDto) => {
    setSelectedTransaction(transaction);
    setTransactionDetailsDialogOpen(true);
  };

  // Reservation handlers
  const handleCreateReservation = () => {
    setCreateReservationDialogOpen(true);
  };

  const handleManageReservation = (reservation: InventoryReservationDto) => {
    setSelectedReservation(reservation);
    setReservationActionsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="inventory-items">Inventory</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
        </TabsList>

        {/* Warehouses Tab */}
        <TabsContent value="warehouses" className="space-y-4">
          <WarehousesTable
            onCreateWarehouse={handleCreateWarehouse}
            onEditWarehouse={handleEditWarehouse}
          />

          <CreateWarehouseDialog
            open={createWarehouseDialogOpen}
            onOpenChange={setCreateWarehouseDialogOpen}
          />

          <EditWarehouseDialog
            warehouseId={selectedWarehouse?.id || null}
            open={editWarehouseDialogOpen}
            onOpenChange={setEditWarehouseDialogOpen}
          />
        </TabsContent>

        {/* Inventory Items Tab */}
        <TabsContent value="inventory-items" className="space-y-4">
          <InventoryItemsTable
            onCreateInventoryItem={handleCreateInventoryItem}
            onEditInventoryItem={handleEditInventoryItem}
            onAdjustQuantity={handleAdjustQuantity}
          />

          <CreateInventoryItemDialog
            open={createItemDialogOpen}
            onOpenChange={setCreateItemDialogOpen}
          />

          <EditInventoryItemDialog
            inventoryItemId={selectedInventoryItem?.id || null}
            open={editItemDialogOpen}
            onOpenChange={setEditItemDialogOpen}
          />

          <QuantityAdjustDialog
            inventoryItemId={selectedInventoryItem?.id || null}
            open={quantityAdjustDialogOpen}
            onOpenChange={setQuantityAdjustDialogOpen}
          />
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <TransactionsTable
            onCreateTransaction={handleCreateTransaction}
            onViewTransaction={handleViewTransaction}
          />

          <CreateTransactionDialog
            open={createTransactionDialogOpen}
            onOpenChange={setCreateTransactionDialogOpen}
          />

          <TransactionDetailsDialog
            transactionId={selectedTransaction?.id || null}
            open={transactionDetailsDialogOpen}
            onOpenChange={setTransactionDetailsDialogOpen}
          />
        </TabsContent>

        {/* Reservations Tab */}
        <TabsContent value="reservations" className="space-y-4">
          <ReservationsTable
            onCreateReservation={handleCreateReservation}
            onManageReservation={handleManageReservation}
          />

          <CreateReservationDialog
            open={createReservationDialogOpen}
            onOpenChange={setCreateReservationDialogOpen}
          />

          <ReservationActionsDialog
            reservationId={selectedReservation?.id || null}
            open={reservationActionsDialogOpen}
            onOpenChange={setReservationActionsDialogOpen}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
