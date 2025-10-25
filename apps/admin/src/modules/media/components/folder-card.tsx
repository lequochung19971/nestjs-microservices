import { useState } from "react";
import {
  Folder,
  FolderOpen,
  MoreHorizontal,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FolderResponseDto } from "@/modules/media/hooks/use-media";
import { Checkbox } from "../../../components/ui/checkbox";
import type { CheckedState } from "@radix-ui/react-checkbox";

interface FolderCardProps {
  folder: FolderResponseDto;
  isSelected?: boolean;
  onSelect?: (folderId: string) => void;
  onEdit?: (folder: FolderCardProps["folder"]) => void;
  onDelete?: (folder: FolderCardProps["folder"]) => void;
  onOpen?: (folderId: string) => void;
  className?: string;
}

export function FolderCard({
  folder,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onOpen,
  className,
}: FolderCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    if (onOpen) {
      onOpen(folder.id);
    }
  };

  const handleSelectClick = (checked: CheckedState) => {
    if (onSelect) {
      onSelect(folder.id);
    }
    return checked;
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(folder);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(folder);
    }
  };

  return (
    <Card
      className={cn(
        "group relative cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-primary ring-offset-2",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <CardContent className="flex flex-col items-center justify-center p-6">
        {/* Selection checkbox */}
        {onSelect && (
          <Checkbox
            checked={isSelected}
            onClick={(e) => e.stopPropagation()}
            onCheckedChange={handleSelectClick}
            className="absolute top-2 left-2 z-10"
          />
        )}

        {/* Actions dropdown */}
        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "absolute top-2 right-2 z-10 h-8 w-8 p-0 opacity-0 transition-opacity",
                  isHovered && "opacity-100",
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onEdit && (
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Folder icon */}
        <div className="mb-4">
          {isHovered ? (
            <FolderOpen className="h-12 w-12 text-primary" />
          ) : (
            <Folder className="h-12 w-12 text-muted-foreground" />
          )}
        </div>

        {/* Folder name */}
        <h3 className="text-sm font-medium text-center line-clamp-2 mb-1">
          {folder.name}
        </h3>
      </CardContent>
    </Card>
  );
}
