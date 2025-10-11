import { Images, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MediaPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Media Library</h2>
          <p className="text-muted-foreground">Manage your images, videos, and documents</p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Media
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center gap-1 text-center">
          <Images className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">No media files found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload images, videos, and documents to use in your products and content.
          </p>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        </div>
      </div>
    </div>
  );
}
