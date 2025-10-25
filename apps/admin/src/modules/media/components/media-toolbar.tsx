import { useState } from "react";
import {
  Search,
  Grid3X3,
  List,
  Filter,
  MoreHorizontal,
  Trash2,
  FolderInput,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface MediaToolbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  sortBy?: string;
  onSortChange?: (sortBy: string) => void;
  sortOrder?: "asc" | "desc";
  onSortOrderChange?: (order: "asc" | "desc") => void;
  filterType?: string;
  onFilterTypeChange?: (type: string) => void;
  selectedCount?: number;
  onBulkDelete?: () => void;
  onBulkMove?: () => void;
  onBulkDownload?: () => void;
  className?: string;
}

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "createdAt", label: "Date Created" },
  { value: "updatedAt", label: "Date Modified" },
  { value: "size", label: "File Size" },
  { value: "type", label: "File Type" },
];

const filterOptions = [
  { value: "all", label: "All Files" },
  { value: "IMAGE", label: "Images" },
  { value: "VIDEO", label: "Videos" },
  { value: "AUDIO", label: "Audio" },
  { value: "DOCUMENT", label: "Documents" },
];

export function MediaToolbar({
  searchQuery = "",
  onSearchChange,
  viewMode = "grid",
  onViewModeChange,
  sortBy = "createdAt",
  onSortChange,
  sortOrder = "desc",
  onSortOrderChange,
  filterType = "all",
  onFilterTypeChange,
  selectedCount = 0,
  onBulkDelete,
  onBulkMove,
  onBulkDownload,
  className,
}: MediaToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(localSearch);
    }
  };

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    // Debounced search could be implemented here
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const toggleSortOrder = () => {
    if (onSortOrderChange) {
      onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between",
        className,
      )}
    >
      {/* Left side - Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-md"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search media files..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </form>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={onFilterTypeChange}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="px-3"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      {/* Right side - View controls and bulk actions */}
      <div className="flex items-center gap-2">
        {/* Bulk actions */}
        {selectedCount > 0 && (
          <>
            <span className="text-sm text-muted-foreground mr-2">
              {selectedCount} selected
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onBulkDownload && (
                  <DropdownMenuItem onClick={onBulkDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                )}
                {onBulkMove && (
                  <DropdownMenuItem onClick={onBulkMove}>
                    <FolderInput className="mr-2 h-4 w-4" />
                    Move to Folder
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onBulkDelete && (
                  <DropdownMenuItem
                    onClick={onBulkDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {/* View mode toggle */}
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange?.("grid")}
            className="rounded-r-none"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange?.("list")}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
