import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Folder, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateFolder,
  useGetFolders,
  type FolderResponseDto,
} from "@/modules/media/hooks/use-media";
import { toast } from "sonner";
import type { ApiSchema } from "@/http-clients";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFolderId?: string;
  onSuccess?: () => void;
}

interface CreateFolderFormData {
  name: string;
  parentId?: string;
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  currentFolderId,
  onSuccess,
}: CreateFolderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createFolderMutation = useCreateFolder();
  const { data: foldersData } = useGetFolders({
    page: 1,
    limit: 100, // Get all folders for parent selection
  });

  const form = useForm<CreateFolderFormData>({
    defaultValues: {
      name: "",
      parentId: currentFolderId || undefined,
    },
  });

  const onSubmit = async (data: CreateFolderFormData) => {
    setIsSubmitting(true);

    try {
      await createFolderMutation.mutateAsync({
        name: data.name.trim(),
        parentId: data.parentId || undefined, // Convert empty string to undefined
      } as ApiSchema["CreateFolderDto"]);

      toast.success("Folder created successfully");

      if (onSuccess) {
        onSuccess();
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error("Failed to create folder. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      form.reset();
    }
  };

  // Build folder hierarchy for parent selection
  const buildFolderHierarchy = (
    folders: FolderResponseDto[],
    parentId?: string,
    level = 0,
  ): (FolderResponseDto & { level: number; displayName: string })[] => {
    if (!folders) return [];

    return folders
      .filter((folder) => {
        return !parentId ? true : folder.parentId === parentId;
      })
      .reduce<(FolderResponseDto & { level: number; displayName: string })[]>(
        (acc, folder) => {
          acc.push({
            ...folder,
            level,
            displayName: "  ".repeat(level) + folder.name,
          });

          const children = buildFolderHierarchy(folders, folder.id, level + 1);
          acc.push(...children);

          return acc;
        },
        [],
      );
  };

  const hierarchicalFolders = buildFolderHierarchy(foldersData?.items || []);

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        parentId: currentFolderId || undefined,
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Create New Folder
          </DialogTitle>
          <DialogDescription>
            Create a new folder to organize your media files.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{
                required: "Folder name is required",
                minLength: {
                  value: 1,
                  message: "Folder name must be at least 1 character",
                },
                maxLength: {
                  value: 100,
                  message: "Folder name must be less than 100 characters",
                },
                pattern: {
                  value: /^[^/\\:*?"<>|]+$/,
                  message: "Folder name contains invalid characters",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter folder name..."
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Folder (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent folder (or leave empty for root)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="root">Root (No parent)</SelectItem>
                      {hierarchicalFolders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.displayName ?? ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {isSubmitting ? "Creating..." : "Create Folder"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
