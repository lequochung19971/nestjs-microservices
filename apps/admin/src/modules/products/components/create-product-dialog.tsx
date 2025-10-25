import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm } from "./product-form";
import { ProductMediaSelector } from "@/modules/products/components/product-media-selector";

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductDialog({
  open,
  onOpenChange,
}: CreateProductDialogProps) {
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);

  const handleSuccess = () => {
    setSelectedImageIds([]);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedImageIds([]);
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
            <DialogTitle>Create Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            selectedImageIds={selectedImageIds}
            onOpenMediaSelector={handleOpenMediaSelector}
          />
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
