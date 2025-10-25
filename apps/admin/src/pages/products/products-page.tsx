import { useState } from "react";
import { ProductsTable } from "@/modules/products/components/products-table";
import { CreateProductDialog } from "@/modules/products/components/create-product-dialog";
import { EditProductDialog } from "@/modules/products/components/edit-product-dialog";
import type { ApiSchema } from "@/http-clients";

type ProductDto = ApiSchema["ProductDto"];

export function ProductsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const handleCreateProduct = () => {
    setCreateDialogOpen(true);
  };

  const handleEditProduct = (product: ProductDto) => {
    setSelectedProductId(product.id);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedProductId(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
      </div>

      <ProductsTable
        onCreateProduct={handleCreateProduct}
        onEditProduct={handleEditProduct}
      />

      <CreateProductDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditProductDialog
        productId={selectedProductId}
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
      />
    </div>
  );
}
