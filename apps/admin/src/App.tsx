import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/auth-context";
import { QueryProvider } from "./providers/query-provider";
import { ProtectedRoute } from "./components/auth/protected-route";
import { LoginPage } from "./pages/auth/login-page";
import { AppLayout } from "./components/layout/app-layout";
import { DashboardPage } from "./pages/dashboard/dashboard-page";
import { ProductsPage } from "./pages/products/products-page";
import { CategoriesPage } from "./pages/categories/categories-page";
import { MediaPage } from "./pages/media/media-page";
import { OrdersPage } from "./pages/orders/orders-page";
import { CustomersPage } from "./pages/customers/customers-page";
import { UsersPage } from "./pages/users/users-page";
import { InventoryPage } from "./pages/inventory";
import { WarehousesPage } from "./pages/inventory/warehouses";
import { InventoryItemsPage } from "./pages/inventory/items";
import { TransactionsPage } from "./pages/inventory/transactions";
import { ReservationsPage } from "./pages/inventory/reservations";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/media" element={<MediaPage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/customers" element={<CustomersPage />} />
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/inventory" element={<InventoryPage />} />
                      <Route
                        path="/inventory/warehouses"
                        element={<WarehousesPage />}
                      />
                      <Route
                        path="/inventory/items"
                        element={<InventoryItemsPage />}
                      />
                      <Route
                        path="/inventory/transactions"
                        element={<TransactionsPage />}
                      />
                      <Route
                        path="/inventory/reservations"
                        element={<ReservationsPage />}
                      />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
