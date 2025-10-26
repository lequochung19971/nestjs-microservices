import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useTransaction, useInventoryItem } from "../../hooks";

interface TransactionDetailsDialogProps {
  transactionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailsDialog({
  transactionId,
  open,
  onOpenChange,
}: TransactionDetailsDialogProps) {
  const { data: transaction, isLoading: transactionLoading } = useTransaction(
    transactionId || undefined,
  );
  const { data: inventoryItem, isLoading: itemLoading } = useInventoryItem(
    transaction?.inventoryItemId || undefined,
  );

  const handleClose = () => {
    onOpenChange(false);
  };

  // Helper function to format transaction type
  const formatTransactionType = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return <Badge variant="default">Purchase</Badge>;
      case "SALE":
        return <Badge variant="destructive">Sale</Badge>;
      case "RETURN":
        return <Badge variant="secondary">Return</Badge>;
      case "ADJUSTMENT":
        return <Badge variant="outline">Adjustment</Badge>;
      case "TRANSFER":
        return <Badge variant="secondary">Transfer</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  // Get formatted date
  const getFormattedDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (error) {
      return dateString;
    }
  };

  const isLoading = transactionLoading || itemLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : transaction ? (
            <div className="space-y-6">
              {/* Transaction Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Transaction Information
                  </h3>
                  {formatTransactionType(transaction.type)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Transaction ID
                    </p>
                    <p className="font-mono text-sm">{transaction.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Transaction Date
                    </p>
                    <p>{getFormattedDate(transaction.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-semibold">{transaction.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created By</p>
                    <p>{transaction.createdBy || "System"}</p>
                  </div>
                </div>
              </div>

              {/* Reference Info */}
              {(transaction.referenceId || transaction.referenceType) && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">
                    Reference Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4">
                    {transaction.referenceId && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Reference ID
                        </p>
                        <p className="font-mono text-sm">
                          {transaction.referenceId}
                        </p>
                      </div>
                    )}
                    {transaction.referenceType && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Reference Type
                        </p>
                        <p>{transaction.referenceType}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {transaction.notes && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Notes</h3>
                  <div className="border rounded-md p-4">
                    <p className="text-sm whitespace-pre-wrap">
                      {transaction.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Inventory Item Info */}
              {inventoryItem && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">
                    Related Inventory Item
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Item ID</p>
                      <p className="font-mono text-sm">{inventoryItem.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Current Quantity
                      </p>
                      <p className="font-semibold">{inventoryItem.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p>{inventoryItem.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Warehouse ID
                      </p>
                      <p className="font-mono text-sm">
                        {inventoryItem.warehouseId}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Transaction not found or could not be loaded.
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
