import { useState } from "react";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetFolders,
  type FolderResponseDto,
} from "@/modules/media/hooks/use-media";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../../../components/ui/scroll-area";

interface FolderTreeItem {
  id: string;
  name: string;
  parentId?: string;
  children?: FolderTreeItem[];
  isExpanded?: boolean;
  level: number;
}

interface FolderTreeProps {
  currentFolderId?: string;
  onFolderSelect?: (folderId: string | undefined) => void;
  onCreateFolder?: (parentId?: string) => void;
  className?: string;
}

export function FolderTree({
  currentFolderId,
  onFolderSelect,
  onCreateFolder,
  className,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );

  const { data: foldersData, isLoading } = useGetFolders({
    page: 1,
    limit: 1000, // Get all folders
  });

  // Build hierarchical folder structure
  const buildFolderHierarchy = (
    folders: FolderResponseDto[],
    parentId?: string,
    level = 0,
  ): FolderTreeItem[] => {
    if (!folders) return [];

    return folders
      .filter((folder) => {
        if (!parentId) {
          // For root level, only include folders with no parent
          return !folder.parentId;
        }
        return folder.parentId === parentId;
      })
      .map((folder) => ({
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId ?? undefined,
        level,
        children: buildFolderHierarchy(folders, folder.id, level + 1),
        isExpanded: expandedFolders.has(folder.id),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const folderHierarchy = buildFolderHierarchy(foldersData?.items || []);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFolderClick = (folderId?: string) => {
    if (onFolderSelect) {
      onFolderSelect(folderId);
    }
  };

  const renderFolderItem = (folder: FolderTreeItem) => {
    const isSelected = folder.id === currentFolderId;
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = folder.isExpanded;

    return (
      <div key={folder.id}>
        <div
          className={cn(
            "flex items-center gap-1 py-1 px-2 rounded-md cursor-pointer text-sm hover:bg-accent group",
            isSelected && "bg-accent text-accent-foreground font-medium",
            "transition-colors",
          )}
          style={{ paddingLeft: `${8 + folder.level * 16}px` }}
        >
          {/* Expand/collapse button */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6 p-0 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) {
                toggleFolder(folder.id);
              }
            }}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )
            ) : (
              <div className="w-3" />
            )}
          </Button>

          {/* Folder icon and name */}
          <div
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() => handleFolderClick(folder.id)}
          >
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className="truncate">{folder.name}</span>
          </div>

          {/* Add subfolder button */}
          {onCreateFolder && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onCreateFolder(folder.id);
              }}
              title="Create subfolder"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div>{folder.children!.map(renderFolderItem)}</div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-2" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {/* Root folder */}
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer text-sm hover:bg-accent transition-colors",
          !currentFolderId && "bg-accent text-accent-foreground font-medium",
        )}
        onClick={() => handleFolderClick(undefined)}
      >
        <Home className="h-4 w-4 text-primary flex-shrink-0" />
        <span>All Files</span>
        {onCreateFolder && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6 p-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onCreateFolder(undefined);
            }}
            title="Create folder"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Folder hierarchy */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-1">{folderHierarchy.map(renderFolderItem)}</div>
      </ScrollArea>

      {/* Create folder button */}
      {onCreateFolder && folderHierarchy.length === 0 && (
        <Button
          variant="outline"
          size="icon-sm"
          className="w-full justify-start"
          onClick={() => onCreateFolder(undefined)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create First Folder
        </Button>
      )}
    </div>
  );
}
