import type { AdminUser } from "@/modules/users/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ManageRolesForm } from "../manage-roles-form";

interface ManageRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: AdminUser | null;
}

export function ManageRolesModal({
  isOpen,
  onClose,
  onSuccess,
  user,
}: ManageRolesModalProps) {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  // Don't render the form if no user is provided
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Roles: {user.username}</DialogTitle>
        </DialogHeader>
        <ManageRolesForm
          user={user}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
