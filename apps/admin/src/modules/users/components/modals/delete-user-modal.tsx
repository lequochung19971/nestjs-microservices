import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteAdminUser } from "../../hooks/use-users";
import { useToast } from "@/hooks/use-toast";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string | null;
  username?: string;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  username,
}: DeleteUserModalProps) {
  const { mutateAsync: deleteUser, isPending } = useDeleteAdminUser();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!userId) return;

    try {
      await deleteUser(userId);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to delete user:", error);
      onClose();
      toast.error("Failed to delete user. Please try again.");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user
            {username ? ` "${username}"` : ""} and remove their data from the
            system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
