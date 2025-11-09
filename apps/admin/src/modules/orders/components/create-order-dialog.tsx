import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerSelect } from "./customer-select";
import { OrderProductCart, type CartItem } from "./order-product-cart";
import { AddressForm } from "./address-form";
import { useCreateOrderAsAdmin } from "../hooks";

const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().optional(),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

const createOrderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  items: z.array(z.any()).min(1, "At least one product is required"),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  paymentMethod: z.enum([
    "CREDIT_CARD",
    "DEBIT_CARD",
    "PAYPAL",
    "BANK_TRANSFER",
    "CASH_ON_DELIVERY",
  ]),
  shippingMethod: z.enum(["STANDARD", "EXPRESS", "OVERNIGHT", "PICKUP"]),
  notes: z.string().optional(),
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOrderDialog({
  open,
  onOpenChange,
}: CreateOrderDialogProps) {
  const [currentTab, setCurrentTab] = useState("customer");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [useSameAddress, setUseSameAddress] = useState(true);

  const createOrderMutation = useCreateOrderAsAdmin();

  const form = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customerId: "",
      items: [],
      shippingAddress: {
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      billingAddress: undefined,
      paymentMethod: "CREDIT_CARD",
      shippingMethod: "STANDARD",
      notes: "",
    },
  });

  const onSubmit = async (data: CreateOrderFormData) => {
    try {
      // Prepare items for submission
      const items = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      // Use shipping address as billing address if checkbox is checked
      const billingAddress = useSameAddress
        ? data.shippingAddress
        : data.billingAddress;

      await createOrderMutation.mutateAsync({
        customerId: data.customerId,
        items,
        shippingAddress: data.shippingAddress,
        billingAddress,
        paymentMethod: data.paymentMethod,
        shippingMethod: data.shippingMethod,
        notes: data.notes,
      });

      toast.success("Order created successfully");
      handleClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create order");
    }
  };

  const handleClose = () => {
    form.reset();
    setCartItems([]);
    setCurrentTab("customer");
    setUseSameAddress(true);
    onOpenChange(false);
  };

  const canProceed = (tab: string) => {
    switch (tab) {
      case "customer":
        return !!form.watch("customerId");
      case "products":
        return cartItems.length > 0;
      case "shipping":
        return (
          form.watch("shippingAddress.fullName") &&
          form.watch("shippingAddress.addressLine1") &&
          form.watch("shippingAddress.city") &&
          form.watch("shippingAddress.postalCode") &&
          form.watch("shippingAddress.country")
        );
      case "billing":
        if (useSameAddress) return true;
        return (
          form.watch("billingAddress.fullName") &&
          form.watch("billingAddress.addressLine1") &&
          form.watch("billingAddress.city") &&
          form.watch("billingAddress.postalCode") &&
          form.watch("billingAddress.country")
        );
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
          <DialogDescription>
            Create a new order on behalf of a customer
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger
                  value="products"
                  disabled={!canProceed("customer")}
                >
                  Products
                </TabsTrigger>
                <TabsTrigger
                  value="shipping"
                  disabled={!canProceed("products")}
                >
                  Shipping
                </TabsTrigger>
                <TabsTrigger value="billing" disabled={!canProceed("shipping")}>
                  Billing
                </TabsTrigger>
                <TabsTrigger value="review" disabled={!canProceed("billing")}>
                  Review
                </TabsTrigger>
              </TabsList>

              {/* Customer Selection */}
              <TabsContent value="customer" className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Customer *</FormLabel>
                      <FormControl>
                        <CustomerSelect
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setCurrentTab("products")}
                    disabled={!canProceed("customer")}
                  >
                    Next: Products
                  </Button>
                </div>
              </TabsContent>

              {/* Products */}
              <TabsContent value="products" className="space-y-4">
                <OrderProductCart
                  items={cartItems}
                  onItemsChange={(items) => {
                    setCartItems(items);
                    form.setValue("items", items as any);
                  }}
                />
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentTab("customer")}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setCurrentTab("shipping")}
                    disabled={!canProceed("products")}
                  >
                    Next: Shipping
                  </Button>
                </div>
              </TabsContent>

              {/* Shipping Address */}
              <TabsContent value="shipping" className="space-y-4">
                <AddressForm form={form} prefix="shippingAddress" />
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentTab("products")}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setCurrentTab("billing")}
                    disabled={!canProceed("shipping")}
                  >
                    Next: Billing
                  </Button>
                </div>
              </TabsContent>

              {/* Billing Address */}
              <TabsContent value="billing" className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="sameAddress"
                    checked={useSameAddress}
                    onCheckedChange={(checked) =>
                      setUseSameAddress(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="sameAddress"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Same as shipping address
                  </label>
                </div>

                {!useSameAddress && (
                  <AddressForm form={form} prefix="billingAddress" />
                )}

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentTab("shipping")}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setCurrentTab("review")}
                    disabled={!canProceed("billing")}
                  >
                    Next: Review
                  </Button>
                </div>
              </TabsContent>

              {/* Review and Submit */}
              <TabsContent value="review" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Payment Method</h3>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CREDIT_CARD">
                                Credit Card
                              </SelectItem>
                              <SelectItem value="DEBIT_CARD">
                                Debit Card
                              </SelectItem>
                              <SelectItem value="PAYPAL">PayPal</SelectItem>
                              <SelectItem value="BANK_TRANSFER">
                                Bank Transfer
                              </SelectItem>
                              <SelectItem value="CASH_ON_DELIVERY">
                                Cash on Delivery
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Shipping Method</h3>
                    <FormField
                      control={form.control}
                      name="shippingMethod"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select shipping method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="STANDARD">Standard</SelectItem>
                              <SelectItem value="EXPRESS">Express</SelectItem>
                              <SelectItem value="OVERNIGHT">
                                Overnight
                              </SelectItem>
                              <SelectItem value="PICKUP">Pickup</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Order Summary</h3>
                    <div className="border rounded-lg p-4 space-y-2">
                      {cartItems.map((item) => (
                        <div
                          key={item.productId}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.product?.name} x {item.quantity}
                          </span>
                          <span>
                            $
                            {(
                              (item.unitPrice ||
                                parseFloat(item.product?.price || "0")) *
                              item.quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentTab("billing")}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Order
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
