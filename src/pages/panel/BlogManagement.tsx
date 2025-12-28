import { useState, useRef, useEffect } from "react";
import { 
  FileText, Plus, Search, Edit, Trash2, Eye, Calendar, Tag, MoreVertical, Image as ImageIcon,
  Clock, CheckCircle, Globe, TrendingUp, Users, Upload, X, Monitor, Tablet, Smartphone, Loader2, ToggleLeft, ToggleRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { usePanel } from "@/hooks/usePanel";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  slug: string;
  status: string | null;
  published_at: string | null;
  featured_image_url: string | null;
  created_at: string;
}

const categories = ["All", "Instagram", "TikTok", "YouTube", "Marketing", "Tips"];

const BlogManagement = () => {
  const { panel, refreshPanel } = usePanel();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [blogEnabled, setBlogEnabled] = useState(false);
  const [togglingBlog, setTogglingBlog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPost, setNewPost] = useState({
    title: "", excerpt: "", content: "", category: "", seoTitle: "", seoDescription: "", status: "draft", thumbnail: ""
  });

  useEffect(() => {
    if (panel?.id) {
      fetchPosts();
      fetchBlogEnabled();
    }
  }, [panel?.id]);

  const fetchBlogEnabled = async () => {
    if (!panel?.id) return;
    try {
      const { data } = await supabase
        .from('panels')
        .select('blog_enabled')
        .eq('id', panel.id)
        .single();
      setBlogEnabled(data?.blog_enabled ?? false);
    } catch (error) {
      console.error('Error fetching blog enabled status:', error);
    }
  };

  const toggleBlogEnabled = async () => {
    if (!panel?.id) return;
    setTogglingBlog(true);
    try {
      const newValue = !blogEnabled;
      const { error } = await supabase
        .from('panels')
        .update({ blog_enabled: newValue })
        .eq('id', panel.id);
      
      if (error) throw error;
      
      setBlogEnabled(newValue);
      toast({ 
        title: newValue ? "Blog enabled" : "Blog disabled",
        description: newValue 
          ? "Blog is now visible in your storefront menu" 
          : "Blog has been hidden from your storefront menu"
      });
      refreshPanel?.();
    } catch (error) {
      console.error('Error toggling blog:', error);
      toast({ variant: "destructive", title: "Failed to update blog visibility" });
    } finally {
      setTogglingBlog(false);
    }
  };

  const fetchPosts = async () => {
    if (!panel?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('panel_id', panel.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({ variant: "destructive", title: "Failed to load posts" });
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const publishedPosts = posts.filter(p => p.status === "published").length;
  const draftPosts = posts.filter(p => p.status === "draft").length;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      setNewPost(prev => ({ ...prev, thumbnail: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const openEditor = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setUploadedImage(post.featured_image_url);
      setNewPost({
        title: post.title, 
        excerpt: post.excerpt || "", 
        content: post.content || "", 
        category: "",
        seoTitle: post.title, 
        seoDescription: post.excerpt || "", 
        status: post.status || "draft", 
        thumbnail: post.featured_image_url || ""
      });
    } else {
      setEditingPost(null);
      setUploadedImage(null);
      setNewPost({ title: "", excerpt: "", content: "", category: "", seoTitle: "", seoDescription: "", status: "draft", thumbnail: "" });
    }
    setIsEditorOpen(true);
  };

  const savePost = async () => {
    if (!panel?.id) return;

    try {
      const slug = newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update({
            title: newPost.title,
            excerpt: newPost.excerpt,
            content: newPost.content,
            status: newPost.status,
            featured_image_url: uploadedImage,
            seo_title: newPost.seoTitle,
            seo_description: newPost.seoDescription,
            published_at: newPost.status === "published" ? new Date().toISOString() : null
          })
          .eq('id', editingPost.id);

        if (error) throw error;
        toast({ title: "Post updated successfully" });
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            panel_id: panel.id,
            title: newPost.title,
            slug,
            excerpt: newPost.excerpt,
            content: newPost.content,
            status: newPost.status,
            featured_image_url: uploadedImage,
            seo_title: newPost.seoTitle,
            seo_description: newPost.seoDescription,
            published_at: newPost.status === "published" ? new Date().toISOString() : null
          });

        if (error) throw error;
        toast({ title: "Post created successfully" });
      }
      
      setIsEditorOpen(false);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({ variant: "destructive", title: "Failed to save post" });
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Post deleted" });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ variant: "destructive", title: "Failed to delete post" });
    }
  };

  const togglePublish = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    try {
      const newStatus = post.status === "published" ? "draft" : "published";
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          status: newStatus,
          published_at: newStatus === "published" ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
      fetchPosts();
      toast({ title: "Post status updated" });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ variant: "destructive", title: "Failed to update status" });
    }
  };

  const previewWidth = previewDevice === "desktop" ? "100%" : previewDevice === "tablet" ? "768px" : "375px";

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Blog Management</h1>
          <p className="text-muted-foreground">Create and manage blog posts for your panel</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Blog Enable/Disable Toggle */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/50">
            <span className="text-sm font-medium">Blog Visibility</span>
            <Switch
              checked={blogEnabled}
              onCheckedChange={toggleBlogEnabled}
              disabled={togglingBlog}
            />
            <Badge variant={blogEnabled ? "default" : "secondary"} className="text-xs">
              {blogEnabled ? "Visible" : "Hidden"}
            </Badge>
          </div>
          <Button onClick={() => openEditor()} className="gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Posts", value: posts.length, icon: FileText, color: "text-primary" },
          { label: "Published", value: publishedPosts, icon: Globe, color: "text-green-500" },
          { label: "Drafts", value: draftPosts, icon: Clock, color: "text-yellow-500" },
          { label: "Total Views", value: 0, icon: TrendingUp, color: "text-blue-500" },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="glass-card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-muted">
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search posts..." className="pl-9 bg-card/50 backdrop-blur-sm border-border/50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </motion.div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No blog posts yet</h3>
            <p className="text-muted-foreground mb-4">Create your first blog post to engage your audience</p>
            <Button onClick={() => openEditor()} className="gap-2">
              <Plus className="w-4 h-4" /> Create Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredPosts.map((post, index) => (
              <motion.div key={post.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.05 }}>
                <Card className="glass-card-hover overflow-hidden group">
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {post.featured_image_url ? (
                      <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <Badge variant="outline" className={cn("absolute top-3 right-3", post.status === "published" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20")}>
                      {post.status === "published" ? <Globe className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      {post.status}
                    </Badge>
                    <Button variant="secondary" size="sm" className="absolute bottom-3 left-3 gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setEditingPost(post); setIsPreviewOpen(true); }}>
                      <Eye className="w-3 h-3" /> Preview
                    </Button>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {post.published_at && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(post.published_at).toLocaleDateString()}</span>}
                    </div>
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />0</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card">
                          <DropdownMenuItem onClick={() => openEditor(post)}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePublish(post.id)}>
                            {post.status === "published" ? <><Clock className="w-4 h-4 mr-2" /> Unpublish</> : <><CheckCircle className="w-4 h-4 mr-2" /> Publish</>}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => deletePost(post.id)} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {filteredPosts.length === 0 && posts.length > 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-medium text-lg">No posts found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your search</p>
        </div>
      )}

      {/* Post Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl glass-card border-border/50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
            <DialogDescription>{editingPost ? "Update your blog post" : "Write a new blog post for your panel"}</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="content" className="mt-4">
            <TabsList className="glass-card p-1">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={newPost.title} onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))} placeholder="Enter post title..." className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea value={newPost.excerpt} onChange={(e) => setNewPost(prev => ({ ...prev, excerpt: e.target.value }))} placeholder="Brief description of your post..." className="bg-background/50" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea value={newPost.content} onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))} placeholder="Write your post content here..." className="bg-background/50 min-h-[200px]" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newPost.status} onValueChange={(value) => setNewPost(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Featured Image</Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                    isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                  {uploadedImage ? (
                    <div className="relative inline-block">
                      <img src={uploadedImage} alt="Preview" className="max-h-48 rounded-lg mx-auto" />
                      <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6" onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm font-medium">Drag & drop or click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">Recommended: 1200x630px</p>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input value={newPost.seoTitle} onChange={(e) => setNewPost(prev => ({ ...prev, seoTitle: e.target.value }))} placeholder="SEO optimized title..." className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea value={newPost.seoDescription} onChange={(e) => setNewPost(prev => ({ ...prev, seoDescription: e.target.value }))} placeholder="Brief description for search engines..." className="bg-background/50" rows={3} />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
            <Button onClick={savePost} className="gap-2">
              {editingPost ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-6xl glass-card border-border/50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Post Preview</span>
              <div className="flex gap-1">
                {[
                  { device: "desktop" as const, icon: Monitor },
                  { device: "tablet" as const, icon: Tablet },
                  { device: "mobile" as const, icon: Smartphone },
                ].map(({ device, icon: Icon }) => (
                  <Button key={device} variant={previewDevice === device ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setPreviewDevice(device)}>
                    <Icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center bg-muted/30 rounded-xl p-4 overflow-x-auto">
            <div style={{ width: previewWidth, maxWidth: "100%" }} className="bg-background rounded-lg shadow-lg overflow-hidden transition-all duration-300">
              {editingPost && (
                <article className="p-6">
                  {editingPost.featured_image_url && (
                    <img src={editingPost.featured_image_url} alt={editingPost.title} className="w-full rounded-lg mb-6 aspect-video object-cover" />
                  )}
                  <h1 className="text-2xl md:text-3xl font-bold mb-4">{editingPost.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    {editingPost.published_at && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(editingPost.published_at).toLocaleDateString()}</span>}
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground">{editingPost.excerpt}</p>
                    <div className="mt-4 whitespace-pre-wrap">{editingPost.content}</div>
                  </div>
                </article>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManagement;