import { useState } from "react";
import {
  InventoryItemsTable,
  CreateInventoryItemDialog,
  EditInventoryItemDialog,
  QuantityAdjustDialog,
} from "@/modules/inventory/components";
import type { InventoryItemDto } from "@/modules/inventory/types";

export function InventoryItemsPage() {
  // Inventory Items state
  const [createItemDialogOpen, setCreateItemDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [quantityAdjustDialogOpen, setQuantityAdjustDialogOpen] =
    useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] =
    useState<InventoryItemDto | null>(null);

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Items</h1>
      </div>

      <div className="space-y-4">
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
      </div>
    </div>
  );
}
