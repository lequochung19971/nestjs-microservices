import { useState } from "react";
import { Plus } from "lucide-react";
import {
  CustomersTable,
  CreateCustomerDialog,
} from "@/modules/customers/components";
import { Button } from "@/components/ui/button";
import type { ApiSchema } from "@/http-clients";

type CustomerDto = ApiSchema["CustomerDto"];

export function CustomersPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleViewCustomer = (customer: CustomerDto) => {
    // Placeholder for future implementation
    console.log("View customer:", customer);
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">
            Manage customer accounts and information
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Customer
        </Button>
      </div>

      <CustomersTable onViewCustomer={handleViewCustomer} />

      <CreateCustomerDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
