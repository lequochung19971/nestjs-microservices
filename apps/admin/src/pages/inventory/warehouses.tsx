import { useState } from "react";
import {
  WarehousesTable,
  CreateWarehouseDialog,
  EditWarehouseDialog,
} from "@/modules/inventory/components";
import type { WarehouseDto } from "@/modules/inventory/types";

export function WarehousesPage() {
  // Warehouses state
  const [createWarehouseDialogOpen, setCreateWarehouseDialogOpen] =
    useState(false);
  const [editWarehouseDialogOpen, setEditWarehouseDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<WarehouseDto | null>(null);

  // Warehouse handlers
  const handleCreateWarehouse = () => {
    setCreateWarehouseDialogOpen(true);
  };

  const handleEditWarehouse = (warehouse: WarehouseDto) => {
    setSelectedWarehouse(warehouse);
    setEditWarehouseDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Warehouse Management</h1>
      </div>

      <div className="space-y-4">
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
      </div>
    </div>
  );
}
