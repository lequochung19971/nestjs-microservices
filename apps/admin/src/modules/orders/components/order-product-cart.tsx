import { useState } from "react";
import { Plus, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/modules/products/hooks/use-products";
import type { ApiSchema } from "@/http-clients";

type Product = ApiSchema["ProductDto"];

export interface CartItem {
  productId: string;
  quantity: number;
  unitPrice?: number;
  product?: Product;
}

interface OrderProductCartProps {
  items: CartItem[];
  onItemsChange: (items: CartItem[]) => void;
  disabled?: boolean;
}

export function OrderProductCart({
  items,
  onItemsChange,
  disabled,
}: OrderProductCartProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const { data: productsData } = useProducts({ limit: 100 });
  const products = productsData?.items || [];

  const addProduct = () => {
    if (!selectedProductId) return;

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    // Check if product already in cart
    const existingItem = items.find(
      (item) => item.productId === selectedProductId,
    );

    if (existingItem) {
      // Increase quantity
      onItemsChange(
        items.map((item) =>
          item.productId === selectedProductId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      // Add new item
      onItemsChange([
        ...items,
        {
          productId: selectedProductId,
          quantity: 1,
          unitPrice: parseFloat(product.price),
          product,
        },
      ]);
    }

    setSelectedProductId("");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    onItemsChange(
      items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const removeItem = (productId: string) => {
    onItemsChange(items.filter((item) => item.productId !== productId));
  };

  const calculateSubtotal = (item: CartItem) => {
    const price = item.unitPrice || parseFloat(item.product?.price || "0");
    return price * item.quantity;
  };

  const calculateTotal = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + calculateSubtotal(item),
      0,
    );
    const tax = subtotal * 0.1; // 10% tax
    const shipping = 10; // Fixed shipping
    return {
      subtotal,
      tax,
      shipping,
      total: subtotal + tax + shipping,
    };
  };

  const totals = calculateTotal();

  return (
    <div className="space-y-4">
      {/* Add Product Section */}
      <div className="flex gap-2">
        <Select
          value={selectedProductId}
          onValueChange={setSelectedProductId}
          disabled={disabled}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} - ${product.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          onClick={addProduct}
          disabled={!selectedProductId || disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Cart Items */}
      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No products added yet. Select a product to add to the order.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium">{item.product?.name}</div>
                <div className="text-sm text-muted-foreground">
                  $
                  {(
                    item.unitPrice || parseFloat(item.product?.price || "0")
                  ).toFixed(2)}{" "}
                  each
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity - 1)
                  }
                  disabled={disabled}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(
                      item.productId,
                      parseInt(e.target.value) || 1,
                    )
                  }
                  className="w-20 text-center"
                  disabled={disabled}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity + 1)
                  }
                  disabled={disabled}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="font-semibold min-w-[100px] text-right">
                ${calculateSubtotal(item).toFixed(2)}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.productId)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Order Summary */}
      {items.length > 0 && (
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (10%):</span>
            <span>${totals.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping:</span>
            <span>${totals.shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>${totals.total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
