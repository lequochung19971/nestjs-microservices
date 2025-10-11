import { LayoutDashboard, Package, FolderTree, Images, ShoppingCart, Users } from 'lucide-react';

export function DashboardPage() {
  const stats = [
    {
      title: 'Products',
      value: '0',
      icon: Package,
      description: 'Total products in catalog',
    },
    {
      title: 'Categories',
      value: '0',
      icon: FolderTree,
      description: 'Product categories',
    },
    {
      title: 'Media Files',
      value: '0',
      icon: Images,
      description: 'Uploaded media assets',
    },
    {
      title: 'Orders',
      value: '0',
      icon: ShoppingCart,
      description: 'Customer orders',
    },
    {
      title: 'Users',
      value: '0',
      icon: Users,
      description: 'Registered users',
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your ecommerce admin panel</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded-lg border p-6">
            <div className="flex items-center gap-2">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">{stat.title}</h3>
            </div>
            <div className="mt-2">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center gap-1 text-center">
          <LayoutDashboard className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">Welcome to your Admin Panel</h3>
          <p className="text-sm text-muted-foreground">
            Start by creating your first product or category to get going.
          </p>
        </div>
      </div>
    </div>
  );
}
