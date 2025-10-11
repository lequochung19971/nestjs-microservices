import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OrdersPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">Manage customer orders and fulfillment</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center gap-1 text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">No orders found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Customer orders will appear here. You can also create orders manually.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        </div>
      </div>
    </div>
  );
}
