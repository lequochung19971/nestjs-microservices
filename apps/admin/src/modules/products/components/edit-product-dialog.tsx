import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm } from "./product-form";
import { ProductMediaSelector } from "./product-media-selector";
import { useProduct } from "@/hooks";
import { Loader2 } from "lucide-react";

interface EditProductDialogProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductDialog({
  productId,
  open,
  onOpenChange,
}: EditProductDialogProps) {
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);

  // Fetch product data using the ID
  const { data: product, isLoading, error } = useProduct(productId || "");

  // Initialize selected images when product changes
  useEffect(() => {
    if (product?.images) {
      setSelectedImageIds(product.images.map((img) => img.mediaId));
    } else {
      setSelectedImageIds([]);
    }
  }, [product]);

  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset to original selection
    if (product?.images) {
      setSelectedImageIds(product.images.map((img) => img.mediaId));
    } else {
      setSelectedImageIds([]);
    }
    onOpenChange(false);
  };

  const handleOpenMediaSelector = () => {
    setMediaSelectorOpen(true);
  };

  const handleMediaSelectionChange = (imageIds: string[]) => {
    setSelectedImageIds(imageIds);
  };

  const handleMediaConfirm = (imageIds: string[]) => {
    setSelectedImageIds(imageIds);
    setMediaSelectorOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading product...</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-red-600 mb-2">Failed to load product</p>
                <p className="text-sm text-gray-500">
                  {error.message || "An unexpected error occurred"}
                </p>
              </div>
            </div>
          )}

          {/* Product form - only render when we have product data */}
          {product && !isLoading && !error && (
            <ProductForm
              product={product}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              selectedImageIds={selectedImageIds}
              onOpenMediaSelector={handleOpenMediaSelector}
            />
          )}
        </DialogContent>
      </Dialog>

      <ProductMediaSelector
        open={mediaSelectorOpen}
        onOpenChange={setMediaSelectorOpen}
        selectedImageIds={selectedImageIds}
        onSelectionChange={handleMediaSelectionChange}
        onConfirm={handleMediaConfirm}
      />
    </>
  );
}
