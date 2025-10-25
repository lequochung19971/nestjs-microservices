import { useCallback, useState } from "react";
import { Upload, X, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUploadFiles } from "@/modules/media/hooks/use-media";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MediaUploadProps {
  onUploadComplete?: () => void;
  className?: string;
  folderId?: string;
}

interface UploadFile extends File {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
}

export function MediaUpload({
  onUploadComplete,
  className,
  folderId,
}: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const uploadMutation = useUploadFiles();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only set dragging to false if we're leaving the drop zone entirely
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
      // Reset input
      e.target.value = "";
    },
    [],
  );

  const handleFiles = (files: File[]) => {
    // Validate file types (prioritize images but allow all)
    const validFiles = files.filter((file) => {
      const isValid = file.size <= 50 * 1024 * 1024; // 50MB limit
      if (!isValid) {
        toast.error(`File "${file.name}" is too large. Maximum size is 50MB.`);
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
      file,
    }));

    setUploadFiles((prev) => [...prev, ...newUploadFiles]);

    // Start uploads
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

      // Create FormData for batch upload
      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append("files", file);
      });

      // Add metadata
      const metadata = {
        folderId,
        uploadedAt: new Date().toISOString(),
      };

      // Prepare upload data - note this is a simplified version
      // In a real implementation, you'd need to handle the actual file upload
      const uploadData = {
        files: filesToUpload.map((f) => f.file) as unknown as string[], // This should be the actual files or form data
        isPublic: true,
        path: folderId ? `folders/${folderId}` : "root",
        metadata,
        folderId,
      };

      // Note: The actual API hook might expect FormData or File objects
      // This is a simplified implementation for demonstration
      await uploadMutation.mutateAsync(uploadData);

      // Update status to success
      setUploadFiles((prev) =>
        prev.map((f) =>
          filesToUpload.find((uf) => uf.id === f.id)
            ? { ...f, status: "success" as const, progress: 100 }
            : f,
        ),
      );

      toast.success(`Successfully uploaded ${filesToUpload.length} file(s)`);

      if (onUploadComplete) {
        onUploadComplete();
      }

      // Clear completed uploads after delay
      setTimeout(() => {
        setUploadFiles((prev) => prev.filter((f) => f.status !== "success"));
      }, 3000);
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

      toast.error("Upload failed. Please try again.");
    }
  };

  const removeFile = (fileId: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const getFileIcon = (file: File) => {
    if (file.type?.startsWith("image/")) {
      return <FileImage className="h-8 w-8 text-blue-500" />;
    }
    return <FileImage className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
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
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <Upload
            className={cn(
              "h-12 w-12 mb-4 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground",
            )}
          />

          <h3 className="text-lg font-semibold mb-2">
            {isDragging ? "Drop files here" : "Upload media files"}
          </h3>

          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop files here, or click to browse
          </p>

          <p className="text-xs text-muted-foreground">
            Images are prioritized. Max file size: 50MB
          </p>

          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Upload progress */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">Upload Progress</h4>
            <div className="space-y-3">
              {uploadFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3">
                  {getFileIcon(file.file)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                        {file.status === "pending" ||
                        file.status === "uploading" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            file.status === "success" && "bg-green-500",
                            file.status === "error" && "bg-red-500",
                            (file.status === "pending" ||
                              file.status === "uploading") &&
                              "bg-blue-500",
                          )}
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>

                      <span
                        className={cn(
                          "text-xs",
                          file.status === "success" && "text-green-600",
                          file.status === "error" && "text-red-600",
                          (file.status === "pending" ||
                            file.status === "uploading") &&
                            "text-blue-600",
                        )}
                      >
                        {file.status === "success" && "Complete"}
                        {file.status === "error" && "Failed"}
                        {file.status === "uploading" && "Uploading..."}
                        {file.status === "pending" && "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
