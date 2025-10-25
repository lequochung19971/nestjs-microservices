import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdminUsersTable } from "@/modules/users/components/admin-users-table";
import { CreateUserModal } from "@/modules/users/components/modals/create-user-modal";
import { DeleteUserModal } from "@/modules/users/components/modals/delete-user-modal";
import { EditUserModal } from "@/modules/users/components/modals/edit-user-modal";
import { ManageRolesModal } from "@/modules/users/components/modals/manage-roles-modal";
import { adminUsersKeys } from "@/modules/users/hooks/use-users";
import type { AdminUser } from "@/modules/users/types";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";

export function UsersPage() {
  const { toast } = useToast();

  // Pagination state no longer needed as it's handled by the table component

  // State for modals
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    username: string;
  } | null>(null);
  const [userForRoles, setUserForRoles] = useState<AdminUser | null>(null);
  const queryClient = useQueryClient();

  // No longer needed as the table component now manages its own state

  // Modal handlers
  const handleCreateUser = () => {
    setCreateUserModalOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setUserToEdit(user);
  };

  const handleManageRoles = (user: AdminUser) => {
    setUserForRoles(user);
  };

  // Success handlers
  const handleCreateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
    toast.success("User created successfully");
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
    toast.success("User updated successfully");
  };

  const handleDeleteSuccess = () => {
    queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
    toast.success("User deleted successfully");
  };

  const handleRolesSuccess = () => {
    queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
    toast.success("User roles updated successfully");
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground">
          Manage customer accounts and administrators
        </p>
      </div>

      {/* AdminUsersTable handles its own loading, error and empty states */}
      <AdminUsersTable
        onCreateUser={handleCreateUser}
        onEditUser={handleEditUser}
        onManageRoles={handleManageRoles}
      />

      {/* Modals */}
      <CreateUserModal
        isOpen={createUserModalOpen}
        onClose={() => setCreateUserModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditUserModal
        isOpen={!!userToEdit}
        onClose={() => setUserToEdit(null)}
        onSuccess={handleEditSuccess}
        user={userToEdit}
      />

      <DeleteUserModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onSuccess={handleDeleteSuccess}
        userId={userToDelete?.id || null}
        username={userToDelete?.username}
      />

      <ManageRolesModal
        isOpen={!!userForRoles}
        onClose={() => setUserForRoles(null)}
        onSuccess={handleRolesSuccess}
        user={userForRoles}
      />
    </div>
  );
}
