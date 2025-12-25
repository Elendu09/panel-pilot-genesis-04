import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  X,
  Link as LinkIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IconUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panelId: string;
  onIconUploaded: (iconUrl: string) => void;
}

interface UploadedIcon {
  id: string;
  url: string;
  name: string;
  uploadedAt: string;
}

const MAX_FILE_SIZE = 500 * 1024; // 500KB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
const ICON_SIZE = 40; // Target icon size in pixels

export function IconUploadDialog({
  open,
  onOpenChange,
  panelId,
  onIconUploaded,
}: IconUploadDialogProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedIcons, setUploadedIcons] = useState<UploadedIcon[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "url" | "library">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch uploaded icons on open
  const fetchUploadedIcons = useCallback(async () => {
    try {
      const { data, error } = await supabase.storage
        .from('panel-assets')
        .list(`icons/${panelId}`, {
          limit: 50,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      const icons: UploadedIcon[] = (data || [])
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => ({
          id: file.id || file.name,
          name: file.name,
          url: supabase.storage.from('panel-assets').getPublicUrl(`icons/${panelId}/${file.name}`).data.publicUrl,
          uploadedAt: file.created_at || new Date().toISOString(),
        }));

      setUploadedIcons(icons);
    } catch (err) {
      console.error('Error fetching icons:', err);
    }
  }, [panelId]);

  // Fetch icons when dialog opens
  useState(() => {
    if (open) {
      fetchUploadedIcons();
    }
  });

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please use PNG, JPG, SVG, or WebP.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / 1024}KB.`;
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const ext = selectedFile.name.split('.').pop();
      const fileName = `icon-${timestamp}.${ext}`;
      const filePath = `icons/${panelId}/${fileName}`;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { error: uploadError } = await supabase.storage
        .from('panel-assets')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      setUploadProgress(100);

      const { data: publicUrlData } = supabase.storage
        .from('panel-assets')
        .getPublicUrl(filePath);

      const iconUrl = publicUrlData.publicUrl;
      
      onIconUploaded(iconUrl);
      toast({ title: "Icon uploaded successfully" });
      
      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      fetchUploadedIcons();
      onOpenChange(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload icon. Please try again.');
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!customUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      new URL(customUrl);
      onIconUploaded(customUrl);
      toast({ title: "Custom icon URL set" });
      setCustomUrl("");
      onOpenChange(false);
    } catch {
      setError('Invalid URL format');
    }
  };

  const handleSelectFromLibrary = (icon: UploadedIcon) => {
    onIconUploaded(icon.url);
    toast({ title: "Icon selected" });
    onOpenChange(false);
  };

  const handleDeleteIcon = async (icon: UploadedIcon) => {
    try {
      const { error } = await supabase.storage
        .from('panel-assets')
        .remove([`icons/${panelId}/${icon.name}`]);

      if (error) throw error;

      setUploadedIcons(prev => prev.filter(i => i.id !== icon.id));
      toast({ title: "Icon deleted" });
    } catch (err) {
      console.error('Delete error:', err);
      toast({ title: "Failed to delete icon", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Custom Icon
          </DialogTitle>
          <DialogDescription>
            Upload a custom icon or use an image URL. Icons should be 40×40px for best results.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-2">
              <LinkIcon className="w-4 h-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Library
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            {/* Drop Zone */}
            <Card
              className={cn(
                "border-2 border-dashed transition-colors cursor-pointer",
                error ? "border-destructive/50 bg-destructive/5" : "border-border hover:border-primary/50 hover:bg-primary/5"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <CardContent className="flex flex-col items-center justify-center py-8">
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-16 h-16 rounded-lg object-cover border-2 border-primary"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-full bg-muted mb-3">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">Drag & drop or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, SVG, WebP • Max 500KB
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Guidelines Card */}
            <Card className="bg-muted/30">
              <CardContent className="p-4 space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Icon Guidelines
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Recommended size: {ICON_SIZE}×{ICON_SIZE} pixels</li>
                  <li>• Use square images for best results</li>
                  <li>• SVG format recommended for crispness</li>
                  <li>• Icons will be automatically rounded</li>
                </ul>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload Icon
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* URL Tab */}
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/icon.png"
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value);
                    setError(null);
                  }}
                />
              </div>
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>

            {/* URL Preview */}
            {customUrl && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <img
                  src={customUrl}
                  alt="Preview"
                  className="w-10 h-10 rounded-lg object-cover border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    setError('Could not load image from URL');
                  }}
                  onLoad={() => setError(null)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Custom URL</p>
                  <p className="text-xs text-muted-foreground truncate">{customUrl}</p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleUrlSubmit} disabled={!customUrl.trim()}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Use URL
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-4">
            {uploadedIcons.length === 0 ? (
              <div className="text-center py-8">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">No custom icons uploaded yet</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => setActiveTab("upload")}
                >
                  Upload your first icon
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[250px]">
                <div className="grid grid-cols-4 gap-3">
                  {uploadedIcons.map((icon) => (
                    <Card
                      key={icon.id}
                      className="group relative cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => handleSelectFromLibrary(icon)}
                    >
                      <CardContent className="p-2 flex flex-col items-center">
                        <img
                          src={icon.url}
                          alt={icon.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
                          {icon.name.substring(0, 10)}...
                        </p>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteIcon(icon);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
