import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProductsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center gap-1 text-center">
          <Package className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">No products found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You haven't added any products yet. Start by creating your first product.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>
    </div>
  );
}
