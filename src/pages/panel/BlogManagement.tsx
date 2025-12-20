import { useState } from "react";
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Tag,
  MoreVertical,
  Image,
  Clock,
  CheckCircle,
  Globe,
  TrendingUp,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const mockPosts = [
  { 
    id: 1, 
    title: "How to Grow Your Instagram Following in 2024", 
    excerpt: "Learn the best strategies to increase your Instagram followers organically and with smart marketing techniques.",
    content: "",
    category: "Instagram",
    status: "published",
    author: "Admin",
    views: 1234,
    publishedAt: "2024-01-15",
    thumbnail: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400"
  },
  { 
    id: 2, 
    title: "SMM Panel vs Manual Marketing: Which is Better?", 
    excerpt: "A comprehensive comparison between using SMM panels and traditional marketing methods for social media growth.",
    content: "",
    category: "Marketing",
    status: "published",
    author: "Admin",
    views: 856,
    publishedAt: "2024-01-10",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400"
  },
  { 
    id: 3, 
    title: "TikTok Marketing Strategies for Businesses", 
    excerpt: "Discover how businesses can leverage TikTok for brand awareness and customer engagement.",
    content: "",
    category: "TikTok",
    status: "draft",
    author: "Admin",
    views: 0,
    publishedAt: null,
    thumbnail: "https://images.unsplash.com/photo-1596558450268-9c27524ba856?w=400"
  },
  { 
    id: 4, 
    title: "YouTube SEO: Ranking Your Videos Higher", 
    excerpt: "Master the art of YouTube SEO to get more views and subscribers on your channel.",
    content: "",
    category: "YouTube",
    status: "draft",
    author: "Admin",
    views: 0,
    publishedAt: null,
    thumbnail: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400"
  },
];

const categories = ["All", "Instagram", "TikTok", "YouTube", "Marketing", "Tips"];

const BlogManagement = () => {
  const [posts, setPosts] = useState(mockPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<typeof mockPosts[0] | null>(null);
  const [newPost, setNewPost] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    seoTitle: "",
    seoDescription: "",
    status: "draft"
  });

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const publishedPosts = posts.filter(p => p.status === "published").length;
  const draftPosts = posts.filter(p => p.status === "draft").length;
  const totalViews = posts.reduce((acc, p) => acc + p.views, 0);

  const openEditor = (post?: typeof mockPosts[0]) => {
    if (post) {
      setEditingPost(post);
      setNewPost({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        seoTitle: post.title,
        seoDescription: post.excerpt,
        status: post.status
      });
    } else {
      setEditingPost(null);
      setNewPost({
        title: "",
        excerpt: "",
        content: "",
        category: "",
        seoTitle: "",
        seoDescription: "",
        status: "draft"
      });
    }
    setIsEditorOpen(true);
  };

  const savePost = () => {
    if (editingPost) {
      setPosts(prev => prev.map(p => 
        p.id === editingPost.id 
          ? { ...p, ...newPost, publishedAt: newPost.status === "published" ? new Date().toISOString().split('T')[0] : p.publishedAt }
          : p
      ));
      toast({ title: "Post updated successfully" });
    } else {
      const post = {
        id: Date.now(),
        ...newPost,
        author: "Admin",
        views: 0,
        publishedAt: newPost.status === "published" ? new Date().toISOString().split('T')[0] : null,
        thumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400"
      };
      setPosts(prev => [post, ...prev]);
      toast({ title: "Post created successfully" });
    }
    setIsEditorOpen(false);
  };

  const deletePost = (id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    toast({ title: "Post deleted" });
  };

  const togglePublish = (id: number) => {
    setPosts(prev => prev.map(p => 
      p.id === id 
        ? { 
            ...p, 
            status: p.status === "published" ? "draft" : "published",
            publishedAt: p.status === "draft" ? new Date().toISOString().split('T')[0] : null
          }
        : p
    ));
    toast({ title: "Post status updated" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Blog Management
          </h1>
          <p className="text-muted-foreground">Create and manage blog posts for your panel</p>
        </div>
        <Button 
          onClick={() => openEditor()} 
          className="bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Posts", value: posts.length, icon: FileText, color: "primary" },
          { label: "Published", value: publishedPosts, icon: Globe, color: "green-500" },
          { label: "Drafts", value: draftPosts, icon: Clock, color: "yellow-500" },
          { label: "Total Views", value: totalViews.toLocaleString(), icon: TrendingUp, color: "blue-500" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl",
                    stat.color === "primary" ? "bg-primary/10" : `bg-${stat.color}/10`
                  )}>
                    <stat.icon className={cn(
                      "w-5 h-5",
                      stat.color === "primary" ? "text-primary" : `text-${stat.color}`
                    )} />
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search posts..." 
            className="pl-9 bg-card/50 backdrop-blur-sm border-border/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                selectedCategory === cat 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "glass-card hover:bg-accent/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Posts Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card-hover overflow-hidden group">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={post.thumbnail} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "absolute top-3 right-3",
                      post.status === "published" 
                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                        : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                    )}
                  >
                    {post.status === "published" ? <Globe className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                    {post.status}
                  </Badge>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      <Tag className="w-3 h-3 mr-1" />
                      {post.category}
                    </Badge>
                    {post.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.publishedAt}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {post.author}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card">
                        <DropdownMenuItem onClick={() => openEditor(post)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePublish(post.id)}>
                          {post.status === "published" ? (
                            <><Clock className="w-4 h-4 mr-2" /> Unpublish</>
                          ) : (
                            <><CheckCircle className="w-4 h-4 mr-2" /> Publish</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => deletePost(post.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-medium text-lg">No posts found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your search or create a new post</p>
        </div>
      )}

      {/* Post Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-2xl glass-card border-border/50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
            <DialogDescription>
              {editingPost ? "Update your blog post" : "Write a new blog post for your panel"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter post title..."
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea
                value={newPost.excerpt}
                onChange={(e) => setNewPost(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief description of your post..."
                className="bg-background/50"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your post content here..."
                className="bg-background/50 min-h-[200px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newPost.category}
                  onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== "All").map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={newPost.status}
                  onValueChange={(value) => setNewPost(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                SEO Settings
              </h4>
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input
                  value={newPost.seoTitle}
                  onChange={(e) => setNewPost(prev => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder="SEO optimized title..."
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">{newPost.seoTitle.length}/60 characters</p>
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={newPost.seoDescription}
                  onChange={(e) => setNewPost(prev => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder="Brief description for search engines..."
                  className="bg-background/50"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">{newPost.seoDescription.length}/160 characters</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
            <Button onClick={savePost} className="bg-gradient-to-r from-primary to-primary/80">
              {editingPost ? "Update Post" : "Create Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManagement;
