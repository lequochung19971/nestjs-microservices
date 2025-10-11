import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UsersPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage customer accounts and administrators</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center gap-1 text-center">
          <Users className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">No users found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Manage customer accounts, administrators, and user permissions.
          </p>
          <Button>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>
    </div>
  );
}
