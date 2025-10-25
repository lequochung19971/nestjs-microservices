import { MediaCard } from "./media-card";
import { FolderCard } from "./folder-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Images } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FolderResponseDto } from "@/modules/media/hooks/use-media";

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

type Folder = FolderResponseDto;

interface MediaGridProps {
  media?: MediaItem[];
  folders?: Folder[];
  isLoading?: boolean;
  selectedItems?: string[];
  onSelectItem?: (itemId: string) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onMediaView?: (media: MediaItem) => void;
  onMediaEdit?: (media: MediaItem) => void;
  onMediaDelete?: (media: MediaItem) => void;
  onMediaMove?: (media: MediaItem) => void;
  onFolderOpen?: (folderId: string) => void;
  onFolderEdit?: (folder: Folder) => void;
  onFolderDelete?: (folder: Folder) => void;
  className?: string;
  viewMode?: "grid" | "list";
}

export function MediaGrid({
  media = [],
  folders = [],
  isLoading = false,
  selectedItems = [],
  onSelectItem,
  onSelectAll,
  onClearSelection,
  onMediaView,
  onMediaEdit,
  onMediaDelete,
  onMediaMove,
  onFolderOpen,
  onFolderEdit,
  onFolderDelete,
  className,
  viewMode = "grid",
}: MediaGridProps) {
  const hasItems = media.length > 0 || folders.length > 0;

  if (isLoading) {
    return (
      <div
        className={cn(
          "grid gap-4",
          viewMode === "grid"
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            : "grid-cols-1",
          className,
        )}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!hasItems) {
    return (
      <Empty className={className}>
        <EmptyHeader>
          <EmptyMedia>
            <Images className="h-12 w-12" />
          </EmptyMedia>
          <EmptyTitle>No media files found</EmptyTitle>
          <EmptyDescription>
            Upload images, videos, and documents to get started
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>{/* Upload button could be added here */}</EmptyContent>
      </Empty>
    );
  }

  const allItems = [...folders, ...media];
  const selectedCount = selectedItems.length;
  const totalCount = allItems.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selection summary */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border">
          <span className="text-sm text-primary">
            {selectedCount} of {totalCount} items selected
          </span>
          <div className="flex items-center gap-2">
            {selectedCount < totalCount && onSelectAll && (
              <button
                onClick={onSelectAll}
                className="text-sm text-primary hover:underline"
              >
                Select all
              </button>
            )}
            {onClearSelection && (
              <button
                onClick={onClearSelection}
                className="text-sm text-primary hover:underline"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid/List view */}
      <div
        className={cn(
          "grid gap-4",
          viewMode === "grid"
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            : "grid-cols-1",
        )}
      >
        {/* Render folders first */}
        {folders.map((folder) => (
          <FolderCard
            key={folder.id}
            folder={folder}
            isSelected={selectedItems.includes(folder.id)}
            onSelect={onSelectItem}
            onOpen={onFolderOpen}
            onEdit={onFolderEdit}
            onDelete={onFolderDelete}
          />
        ))}

        {/* Render media items */}
        {media.map((item) => (
          <MediaCard
            key={item.id}
            media={item}
            isSelected={selectedItems.includes(item.id)}
            onSelect={onSelectItem}
            onView={onMediaView}
            onEdit={onMediaEdit}
            onDelete={onMediaDelete}
            onMove={onMediaMove}
          />
        ))}
      </div>
    </div>
  );
}
