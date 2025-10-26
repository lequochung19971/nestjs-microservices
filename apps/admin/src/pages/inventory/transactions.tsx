import { useState } from "react";
import {
  TransactionsTable,
  CreateTransactionDialog,
  TransactionDetailsDialog,
} from "@/modules/inventory/components";
import type { InventoryTransactionDto } from "@/modules/inventory/types";

export function TransactionsPage() {
  // Transactions state
  const [createTransactionDialogOpen, setCreateTransactionDialogOpen] =
    useState(false);
  const [transactionDetailsDialogOpen, setTransactionDetailsDialogOpen] =
    useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<InventoryTransactionDto | null>(null);

  // Transaction handlers
  const handleCreateTransaction = () => {
    setCreateTransactionDialogOpen(true);
  };

  const handleViewTransaction = (transaction: InventoryTransactionDto) => {
    setSelectedTransaction(transaction);
    setTransactionDetailsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Transactions</h1>
      </div>

      <div className="space-y-4">
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
      </div>
    </div>
  );
}
