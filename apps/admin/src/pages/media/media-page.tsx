import { useState, useMemo } from "react";
import { Upload, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MediaGrid,
  MediaUpload,
  MediaToolbar,
  FolderTree,
  CreateFolderDialog,
  MediaDetailsDialog,
} from "@/modules/media/components";
import {
  useGetAllMedia,
  useGetFolders,
  useDeleteMedia,
  useDeleteFolder,
  type FolderResponseDto,
} from "@/modules/media/hooks/use-media";
import { toast } from "sonner";

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

export function MediaPage() {
  // State management
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(
    undefined,
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterType, setFilterType] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [createFolderParentId, setCreateFolderParentId] = useState<
    string | undefined
  >(undefined);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  // API hooks
  const mediaQuery = useGetAllMedia({
    page: 1,
    limit: 100,
    search: searchQuery || undefined,
    type: filterType !== "all" ? (filterType as any) : undefined,
    folderId: currentFolderId,
  });

  // Get all folders to build proper hierarchy and breadcrumbs
  const foldersQuery = useGetFolders({
    page: 1,
    limit: 1000, // Get all folders for hierarchy
  });

  const deleteMediaMutation = useDeleteMedia();
  const deleteFolderMutation = useDeleteFolder();

  // Computed values
  const media = useMemo(() => {
    if (!mediaQuery.data) return [];
    let items = Array.isArray(mediaQuery.data?.items)
      ? [...mediaQuery.data.items]
      : [];

    // Apply sorting
    items.sort((a: any, b: any) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "size") {
        aVal = parseInt(aVal);
        bVal = parseInt(bVal);
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return items;
  }, [mediaQuery.data, sortBy, sortOrder]);
  const allFolders = foldersQuery.data?.items || [];
  // For current level folders, filter by currentFolderId
  const folders = allFolders.filter((folder) =>
    currentFolderId ? folder.parentId === currentFolderId : !folder.parentId,
  );
  const isLoading = mediaQuery.isLoading || foldersQuery.isLoading;

  // Build breadcrumb path from folder hierarchy
  const breadcrumbPath = useMemo(() => {
    const path = [{ id: undefined, name: "All Files" }];

    if (!currentFolderId || !allFolders.length) {
      return path;
    }

    // Find the current folder and build path to root
    const buildPathToRoot = (
      folderId: string,
      folders: FolderResponseDto[],
    ): { id: string; name: string }[] => {
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) return [];

      const pathSegment = { id: folder.id, name: folder.name };

      if (folder.parentId) {
        return [...buildPathToRoot(folder.parentId, folders), pathSegment];
      }

      return [pathSegment];
    };

    const folderPath = buildPathToRoot(currentFolderId, allFolders);
    return [...path, ...folderPath];
  }, [currentFolderId, allFolders]);

  // Event handlers
  const handleFolderSelect = (folderId: string | undefined) => {
    setCurrentFolderId(folderId);
    setSelectedItems([]);
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleSelectAll = () => {
    const allIds = [
      ...folders.map((f: any) => f.id),
      ...media.map((m: any) => m.id),
    ];
    setSelectedItems(allIds);
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const handleCreateFolder = (parentId?: string) => {
    setCreateFolderParentId(parentId || currentFolderId);
    setShowCreateFolder(true);
  };

  const handleMediaView = (mediaItem: MediaItem) => {
    setSelectedMediaId(mediaItem.id);
  };

  const handleMediaDelete = async (mediaItem: MediaItem) => {
    if (
      confirm(
        `Are you sure you want to delete "${mediaItem.originalFilename}"?`,
      )
    ) {
      try {
        await deleteMediaMutation.mutateAsync(mediaItem.id);
        toast.success("Media deleted successfully");
      } catch (error) {
        toast.error("Failed to delete media");
      }
    }
  };

  const handleFolderDelete = async (folder: FolderResponseDto) => {
    if (
      confirm(`Are you sure you want to delete the folder "${folder.name}"?`)
    ) {
      try {
        await deleteFolderMutation.mutateAsync({
          id: folder.id,
          deleteContents: false, // TODO: Add option to delete contents
        });
        toast.success("Folder deleted successfully");
      } catch (error) {
        toast.error("Failed to delete folder");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedItems.length} item(s)?`,
      )
    ) {
      try {
        const mediaIds = selectedItems.filter((id) =>
          media.some((m: any) => m.id === id),
        );
        const folderIds = selectedItems.filter((id) =>
          folders.some((f: any) => f.id === id),
        );

        // Delete media items
        await Promise.all(
          mediaIds.map((id) => deleteMediaMutation.mutateAsync(id)),
        );

        // Delete folders
        await Promise.all(
          folderIds.map((id) =>
            deleteFolderMutation.mutateAsync({ id, deleteContents: false }),
          ),
        );

        setSelectedItems([]);
        toast.success("Items deleted successfully");
      } catch (error) {
        toast.error("Failed to delete items");
      }
    }
  };

  const handleUploadComplete = () => {
    mediaQuery.refetch();
    setShowUpload(false);
  };

  const handleCreateFolderSuccess = () => {
    foldersQuery.refetch();
    setShowCreateFolder(false);
  };

  return (
    <div className="flex flex-1 gap-6">
      {/* Sidebar - Folder Tree */}
      <Card className="w-80 flex-shrink-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Folders</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCreateFolder()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <FolderTree
            currentFolderId={currentFolderId}
            onFolderSelect={handleFolderSelect}
            onCreateFolder={handleCreateFolder}
          />
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Media Library</h2>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {breadcrumbPath.map((item, index) => (
                <div
                  key={item.id || "root"}
                  className="flex items-center gap-1"
                >
                  {index > 0 && <ChevronRight className="h-3 w-3" />}
                  <button
                    onClick={() => handleFolderSelect(item.id)}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={() => setShowUpload(!showUpload)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Media
          </Button>
        </div>

        {/* Upload Area */}
        {showUpload && (
          <MediaUpload
            folderId={currentFolderId}
            onUploadComplete={handleUploadComplete}
          />
        )}

        {/* Toolbar */}
        <MediaToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          selectedCount={selectedItems.length}
          onBulkDelete={handleBulkDelete}
        />

        <Separator />

        {/* Media Grid */}
        <MediaGrid
          media={media}
          folders={folders}
          isLoading={isLoading}
          selectedItems={selectedItems}
          onSelectItem={handleItemSelect}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onMediaView={handleMediaView}
          onMediaDelete={handleMediaDelete}
          onFolderOpen={handleFolderSelect}
          onFolderDelete={handleFolderDelete}
          viewMode={viewMode}
        />
      </div>

      {/* Dialogs */}
      <CreateFolderDialog
        open={showCreateFolder}
        onOpenChange={setShowCreateFolder}
        currentFolderId={createFolderParentId}
        onSuccess={handleCreateFolderSuccess}
      />

      <MediaDetailsDialog
        mediaId={selectedMediaId}
        open={!!selectedMediaId}
        onOpenChange={(open: boolean) => !open && setSelectedMediaId(null)}
        onUpdate={() => mediaQuery.refetch()}
      />
    </div>
  );
}
