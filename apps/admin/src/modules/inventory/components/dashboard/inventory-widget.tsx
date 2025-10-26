import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Box, TrendingDown } from "lucide-react";
import { useInventoryItems, useReservations } from "../../hooks";

export function InventoryWidget() {
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [outOfStockCount, setOutOfStockCount] = useState<number>(0);
  const [pendingReservationsCount, setPendingReservationsCount] =
    useState<number>(0);

  // Fetch inventory items with low stock
  const { data: lowStockItems, isLoading: isLoadingLowStock } =
    useInventoryItems({
      lowStock: true,
      limit: 100,
    });

  // Fetch out of stock inventory items
  const { data: outOfStockItems, isLoading: isLoadingOutOfStock } =
    useInventoryItems({
      outOfStock: true,
      limit: 100,
    });

  // Fetch active reservations
  const { data: activeReservations, isLoading: isLoadingReservations } =
    useReservations({
      status: "ACTIVE",
      limit: 100,
    });

  useEffect(() => {
    if (lowStockItems?.data) {
      setLowStockCount(lowStockItems?.data?.length || 0);
    }
    if (outOfStockItems?.data) {
      setOutOfStockCount(outOfStockItems?.data?.length || 0);
    }
    if (activeReservations?.data) {
      setPendingReservationsCount(activeReservations?.data?.length || 0);
    }
  }, [lowStockItems, outOfStockItems, activeReservations]);

  const isLoading =
    isLoadingLowStock || isLoadingOutOfStock || isLoadingReservations;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-3">Inventory Status</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-amber-500" />
              <span>Low Stock</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-3xl font-bold">{lowStockCount}</div>
            )}
            <p className="text-sm text-muted-foreground">
              Items below reorder point
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link to="/inventory/items">View Items</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Out of Stock Alert */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Out of Stock</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-3xl font-bold">{outOfStockCount}</div>
            )}
            <p className="text-sm text-muted-foreground">
              Items with zero inventory
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link to="/inventory/items">View Items</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Pending Reservations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Box className="h-5 w-5 text-blue-500" />
              <span>Active Reservations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-3xl font-bold">
                {pendingReservationsCount}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Items reserved for orders
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link to="/inventory/reservations">View Reservations</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Alert for critical inventory */}
      {outOfStockCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Inventory Alert</AlertTitle>
          <AlertDescription>
            You have {outOfStockCount} items out of stock. Please check your
            inventory.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
