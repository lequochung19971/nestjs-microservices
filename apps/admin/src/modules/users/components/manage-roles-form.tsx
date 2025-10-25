import { useState } from "react";
import type { AdminUser, Role } from "@/modules/users/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdminRoles, useAssignRoles } from "../hooks/use-users";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ManageRolesFormProps {
  user: AdminUser;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ManageRolesForm({
  user,
  onSuccess,
  onCancel,
}: ManageRolesFormProps) {
  const { data: rolesData, isLoading, error } = useAdminRoles();
  const { mutateAsync: assignRoles, isPending: isAssigning } = useAssignRoles();
  const { toast } = useToast();

  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    user.roles || [],
  );

  const handleRoleToggle = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName],
    );
  };

  const handleSubmit = async () => {
    try {
      await assignRoles({
        id: user.id,
        roles: {
          roles: selectedRoles,
        },
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to assign roles:", error);
      toast.error("Failed to assign roles. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load roles. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Manage Roles</h3>
        <p className="text-sm text-muted-foreground">
          Select the roles to assign to {user.username}
        </p>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Current Roles:</h4>
        <div className="flex flex-wrap gap-1 mb-4">
          {user.roles && user.roles.length > 0 ? (
            user.roles.map((role) => (
              <Badge key={role} variant="secondary">
                {role}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No roles assigned
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Available Roles:</h4>
        <ScrollArea className="h-[200px] border rounded-md p-4">
          <div className="space-y-2">
            {rolesData?.roles.map((role: Role) => (
              <div
                key={role.name}
                className="flex items-center space-x-2 rounded-md border p-2 hover:bg-muted"
              >
                <Checkbox
                  id={`role-${role.name}`}
                  checked={selectedRoles.includes(role.name)}
                  onCheckedChange={() => handleRoleToggle(role.name)}
                />
                <div className="grid gap-1">
                  <label
                    htmlFor={`role-${role.name}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {role.name}
                  </label>
                  {role.description && (
                    <p className="text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isAssigning}>
          {isAssigning ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
