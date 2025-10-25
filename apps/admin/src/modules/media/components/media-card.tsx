import { useState } from "react";
import {
  FileImage,
  FileVideo,
  FileAudio,
  File,
  MoreHorizontal,
  Edit2,
  Trash2,
  FolderInput,
  Eye,
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
import { Checkbox } from "../../../components/ui/checkbox";
import type { CheckedState } from "@radix-ui/react-checkbox";

interface MediaItem {
  id: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  url: string;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
}

interface MediaCardProps {
  media: MediaItem;
  isSelected?: boolean;
  onSelect?: (mediaId: string) => void;
  onView?: (media: MediaItem) => void;
  onEdit?: (media: MediaItem) => void;
  onDelete?: (media: MediaItem) => void;
  onMove?: (media: MediaItem) => void;
  className?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (type: MediaItem["type"], mimeType: string) => {
  switch (type) {
    case "IMAGE":
      return <FileImage className="h-8 w-8 text-blue-500" />;
    case "VIDEO":
      return <FileVideo className="h-8 w-8 text-purple-500" />;
    case "AUDIO":
      return <FileAudio className="h-8 w-8 text-green-500" />;
    default:
      return <File className="h-8 w-8 text-gray-500" />;
  }
};

const isImageType = (mimeType: string): boolean => {
  return mimeType.startsWith("image/");
};

export function MediaCard({
  media,
  isSelected = false,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onMove,
  className,
}: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    if (onView) {
      onView(media);
    }
  };

  const handleSelectClick = (checked: CheckedState) => {
    if (onSelect) {
      onSelect(media.id);
    }
    return checked;
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView) {
      onView(media);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(media);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(media);
    }
  };

  const handleMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMove) {
      onMove(media);
    }
  };

  return (
    <Card
      className={cn(
        "group relative cursor-pointer transition-all duration-200 hover:shadow-md p-0 overflow-hidden",
        isSelected && "ring-2 ring-primary ring-offset-2",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "absolute top-2 right-2 z-10 h-8 w-8 p-0 opacity-0 transition-opacity bg-white/80 backdrop-blur-sm",
                isHovered && "opacity-100",
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {onView && (
              <DropdownMenuItem onClick={handleView}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={handleEdit}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {onMove && (
              <DropdownMenuItem onClick={handleMove}>
                <FolderInput className="mr-2 h-4 w-4" />
                Move to Folder
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

        {/* Media preview */}
        <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-lg">
          {isImageType(media.mimeType ?? "") && !imageError ? (
            <img
              src={media.url}
              alt={media.originalFilename}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              {getFileIcon(media.type, media.mimeType)}
            </div>
          )}
        </div>

        {/* Media info */}
        <div className="p-3 space-y-1">
          <h3
            className="text-sm font-medium truncate"
            title={media.originalFilename}
          >
            {media.originalFilename}
          </h3>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatFileSize(media.size)}</span>
            {media.width && media.height && (
              <span>
                {media.width} × {media.height}
              </span>
            )}
          </div>

          <div className="text-xs text-muted-foreground capitalize">
            {media.type.toLowerCase()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
