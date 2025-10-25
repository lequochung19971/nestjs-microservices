import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Eye,
  Edit2,
  X,
  Save,
  Tag,
  Download,
  Calendar,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useGetMediaById,
  useUpdateMedia,
  useGetTagsForMedia,
  useGetTags,
  useAddTagsToMedia,
  useRemoveTagsFromMedia,
} from "@/modules/media/hooks/use-media";
import { toast } from "sonner";

interface MediaDetailsDialogProps {
  mediaId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

interface UpdateMediaFormData {
  originalFilename: string;
  metadata?: Record<string, any>;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function MediaDetailsDialog({
  mediaId,
  open,
  onOpenChange,
  onUpdate,
}: MediaDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: media } = useGetMediaById(mediaId || "");
  const updateMediaMutation = useUpdateMedia();
  const { data: mediaTagsData } = useGetTagsForMedia(mediaId || "");
  const { data: allTagsData } = useGetTags({ page: 1, limit: 100 });
  const addTagsMutation = useAddTagsToMedia();
  const removeTagsMutation = useRemoveTagsFromMedia();

  const form = useForm<UpdateMediaFormData>({
    defaultValues: {
      originalFilename: media?.originalFilename || "",
      metadata: media?.metadata || {},
    },
  });

  useEffect(() => {
    if (media) {
      form.reset({
        originalFilename: media.originalFilename,
        metadata: media.metadata || {},
      });
    }
  }, [media, form]);

  useEffect(() => {
    if (mediaTagsData) {
      setSelectedTags(mediaTagsData.map((tag: any) => tag.id));
    }
  }, [mediaTagsData]);

  if (!media) return null;

  const handleSave = async (data: UpdateMediaFormData) => {
    if (!media) return;

    try {
      await updateMediaMutation.mutateAsync({
        id: media.id,
        updateMediaDto: {
          originalFilename: data.originalFilename,
          metadata: data.metadata,
        },
      });

      toast.success("Media updated successfully");
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Failed to update media");
    }
  };

  const handleAddTag = async (tagId: string) => {
    if (selectedTags.includes(tagId) || !media) return;

    try {
      await addTagsMutation.mutateAsync({
        mediaIds: [media.id],
        tagIds: [tagId],
      });

      setSelectedTags((prev) => [...prev, tagId]);
      toast.success("Tag added successfully");
    } catch (error) {
      toast.error("Failed to add tag");
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    if (!media) return;

    try {
      await removeTagsMutation.mutateAsync({
        mediaIds: [media.id],
        tagIds: [tagId],
      });

      setSelectedTags((prev) => prev.filter((id) => id !== tagId));
      toast.success("Tag removed successfully");
    } catch (error) {
      toast.error("Failed to remove tag");
    }
  };

  const handleDownload = () => {
    if (!media) return;

    const link = document.createElement("a");
    link.href = media.url;
    link.download = media.originalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = media?.mimeType?.startsWith?.("image/") ?? false;
  const mediaTags = mediaTagsData || [];
  const availableTags = (allTagsData?.items || []).filter(
    (tag: any) => !selectedTags.includes(tag.id),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Media Details
              </DialogTitle>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[70vh] overflow-hidden">
          {/* Preview Section */}
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              {isImage ? (
                <img
                  src={media.url}
                  alt={media.originalFilename}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500">Preview not available</p>
                  <p className="text-xs text-gray-400 mt-1">{media.mimeType}</p>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Size:</span>
                <span>{formatFileSize(media.size)}</span>
              </div>

              {(media.metadata as any)?.width &&
                (media.metadata as any)?.height && (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span>
                      {String((media.metadata as any).width)} ×{" "}
                      {String((media.metadata as any).height)}
                    </span>
                  </div>
                )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDate(media.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Modified:</span>
                <span>{formatDate(media.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <ScrollArea className="max-h-full">
            <div className="space-y-6 px-1">
              {/* Edit Form */}
              {isEditing ? (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSave)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="originalFilename"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Filename</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button type="submit" size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-2">
                  <h3 className="font-semibold">Filename</h3>
                  <p className="text-sm break-all">{media.originalFilename}</p>
                </div>
              )}

              <Separator />

              {/* Tags Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <h3 className="font-semibold">Tags</h3>
                </div>

                {/* Current Tags */}
                <div className="flex flex-wrap gap-2">
                  {mediaTags.map((tag: any) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveTag(tag.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  {mediaTags.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No tags assigned
                    </p>
                  )}
                </div>

                {/* Available Tags */}
                {availableTags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Available tags:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.slice(0, 10).map((tag: any) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleAddTag(tag.id)}
                        >
                          + {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Technical Details */}
              <div className="space-y-3">
                <h3 className="font-semibold">Technical Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MIME Type:</span>
                    <span className="font-mono">{media.mimeType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Type:</span>
                    <span>{media.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File ID:</span>
                    <span className="font-mono text-xs">{media.id}</span>
                  </div>
                </div>
              </div>

              {/* URL */}
              <div className="space-y-2">
                <h3 className="font-semibold">URL</h3>
                <div className="p-2 bg-gray-50 rounded text-xs font-mono break-all">
                  {media.url}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
