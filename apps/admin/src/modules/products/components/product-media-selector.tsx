import { useState, useCallback, useEffect } from "react";
import { Upload, X, FileImage, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MediaGrid } from "@/modules/media/components/media-grid";
import {
  useGetAllMedia,
  useUploadFiles,
} from "@/modules/media/hooks/use-media";
import { cn } from "@/lib/utils";
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

interface ProductMediaSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedImageIds: string[];
  onSelectionChange: (imageIds: string[]) => void;
  onConfirm: (imageIds: string[]) => void;
}

interface UploadFile extends File {
  id: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
}

export function ProductMediaSelector({
  open,
  onOpenChange,
  selectedImageIds,
  onSelectionChange,
  onConfirm,
}: ProductMediaSelectorProps) {
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSelectedIds, setTempSelectedIds] =
    useState<string[]>(selectedImageIds);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useUploadFiles();

  // Fetch media with search and image filter
  const {
    data: mediaData,
    isLoading,
    refetch,
  } = useGetAllMedia({
    page: 1,
    limit: 50,
    type: "IMAGE", // Only show images for product selection
    search: searchQuery || undefined,
  });

  const handleMediaSelect = (mediaId: string) => {
    setTempSelectedIds((prev) =>
      prev.includes(mediaId)
        ? prev.filter((id) => id !== mediaId)
        : [...prev, mediaId],
    );
  };

  const handleSelectAll = () => {
    if (!mediaData?.items) return;
    const allImageIds = mediaData.items.map((item) => item.id);
    setTempSelectedIds(allImageIds);
  };

  const handleClearSelection = () => {
    setTempSelectedIds([]);
  };

  const handleConfirm = () => {
    onSelectionChange(tempSelectedIds);
    onConfirm(tempSelectedIds);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempSelectedIds(selectedImageIds); // Reset to original selection
    onOpenChange(false);
  };

  // File upload handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      handleFiles(files);
      e.target.value = "";
    },
    [],
  );

  const handleFiles = (files: File[]) => {
    // Filter for image files only
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      toast.error("Only image files are allowed for product media");
    }

    if (imageFiles.length === 0) return;

    // Validate file sizes
    const validFiles = imageFiles.filter((file) => {
      const isValid = file.size <= 10 * 1024 * 1024; // 10MB limit for images
      if (!isValid) {
        toast.error(`Image "${file.name}" is too large. Maximum size is 10MB.`);
      }
      return isValid;
    });

    if (validFiles.length === 0) return;

    // Create upload file objects
    const newUploadFiles: UploadFile[] = validFiles.map((file) => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: "pending" as const,
    }));

    setUploadFiles((prev) => [...prev, ...newUploadFiles]);
    startUploads(newUploadFiles);
  };

  const startUploads = async (filesToUpload: UploadFile[]) => {
    try {
      // Update status to uploading
      setUploadFiles((prev) =>
        prev.map((f) =>
          filesToUpload.find((uf) => uf.id === f.id)
            ? { ...f, status: "uploading" as const }
            : f,
        ),
      );

      // Prepare upload data
      const uploadData = {
        files: filesToUpload as unknown as string[],
        isPublic: true,
        path: "products",
        metadata: {
          uploadedFor: "product",
          uploadedAt: new Date().toISOString(),
        },
      };

      const results = await uploadMutation.mutateAsync(uploadData);

      // Update status to success and auto-select uploaded images
      setUploadFiles((prev) =>
        prev.map((f) =>
          filesToUpload.find((uf) => uf.id === f.id)
            ? { ...f, status: "success" as const, progress: 100 }
            : f,
        ),
      );

      // Auto-select newly uploaded images
      if (Array.isArray(results)) {
        const newImageIds = results.map((result) => result.id);
        setTempSelectedIds((prev) => [...prev, ...newImageIds]);
      }

      toast.success(`Successfully uploaded ${filesToUpload.length} image(s)`);

      // Refresh media list
      refetch();

      // Clear completed uploads after delay
      setTimeout(() => {
        setUploadFiles((prev) => prev.filter((f) => f.status !== "success"));
      }, 2000);
    } catch (error) {
      console.error("Upload failed:", error);

      // Update status to error
      setUploadFiles((prev) =>
        prev.map((f) =>
          filesToUpload.find((uf) => uf.id === f.id)
            ? { ...f, status: "error" as const }
            : f,
        ),
      );

      toast.error("Failed to upload images. Please try again.");
    }
  };

  const removeUploadFile = (fileId: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <FileImage className="h-8 w-8 text-blue-500" />;
    }
    return <FileImage className="h-8 w-8 text-gray-500" />;
  };

  useEffect(() => {
    if (selectedImageIds.length > 0 && open) {
      setTempSelectedIds(selectedImageIds);
    }
  }, [selectedImageIds, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select Product Images</DialogTitle>
          <DialogDescription>
            Choose existing images or upload new ones for your product
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Browse Images</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4 mt-4">
              {/* Search */}
              <Input
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />

              {/* Selection Summary */}
              {tempSelectedIds.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">
                    {tempSelectedIds.length} image
                    {tempSelectedIds.length !== 1 ? "s" : ""} selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearSelection}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              {/* Media Grid */}
              <ScrollArea className="h-[400px]">
                <MediaGrid
                  media={mediaData?.items || []}
                  isLoading={isLoading}
                  selectedItems={tempSelectedIds}
                  onSelectItem={handleMediaSelect}
                  onSelectAll={handleSelectAll}
                  onClearSelection={handleClearSelection}
                  viewMode="grid"
                />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-4">
              {/* Upload Area */}
              <Card
                className={cn(
                  "border-2 border-dashed transition-colors cursor-pointer",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <div className="text-center">
                    <p className="text-lg font-medium">
                      Drop images here or{" "}
                      <label className="text-primary cursor-pointer hover:underline">
                        browse files
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                      </label>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports: JPEG, PNG, GIF, WebP (max 10MB each)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Progress */}
              {uploadFiles.length > 0 && (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {uploadFiles.map((file) => (
                      <Card key={file.id}>
                        <CardContent className="flex items-center gap-3 p-4">
                          {getFileIcon(file)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                            {file.status === "uploading" && (
                              <div className="w-full bg-muted rounded-full h-1 mt-1">
                                <div
                                  className="bg-primary h-1 rounded-full transition-all"
                                  style={{ width: `${file.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {file.status === "success" && (
                              <Badge variant="default" className="gap-1">
                                <Check className="h-3 w-3" />
                                Uploaded
                              </Badge>
                            )}
                            {file.status === "error" && (
                              <Badge variant="destructive">Failed</Badge>
                            )}
                            {file.status === "uploading" && (
                              <Badge variant="secondary">Uploading...</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeUploadFile(file.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Select {tempSelectedIds.length} Image
            {tempSelectedIds.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
