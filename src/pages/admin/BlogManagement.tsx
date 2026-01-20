import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Calendar,
  FileText,
  Save,
  Loader2,
  ExternalLink,
  Image,
  List,
  HelpCircle,
  X
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  featured_image_url: string | null;
  author_name: string;
  status: 'draft' | 'published' | 'archived';
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  table_of_contents: any[];
  faqs: any[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

const defaultPost: Partial<BlogPost> = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  featured_image_url: '',
  author_name: 'HOMEOFSMM Team',
  status: 'draft',
  seo_title: '',
  seo_description: '',
  seo_keywords: [],
  table_of_contents: [],
  faqs: []
};

const BlogManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>(defaultPost);
  const [isCreating, setIsCreating] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data || []) as BlogPost[]);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch blog posts' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    setIsCreating(true);
    setCurrentPost(defaultPost);
    setKeywordInput('');
    setEditDialogOpen(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setIsCreating(false);
    setCurrentPost(post);
    setKeywordInput((post.seo_keywords || []).join(', '));
    setEditDialogOpen(true);
  };

  const handleDeletePost = (post: BlogPost) => {
    setCurrentPost(post);
    setDeleteDialogOpen(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSavePost = async () => {
    if (!currentPost.title || !currentPost.slug) {
      toast({ variant: 'destructive', title: 'Error', description: 'Title and slug are required' });
      return;
    }

    setSaving(true);
    try {
      const seoKeywords = keywordInput.split(',').map(k => k.trim()).filter(Boolean);
      const publishedAt = currentPost.status === 'published' && !currentPost.published_at 
        ? new Date().toISOString() 
        : currentPost.published_at || null;

      if (isCreating) {
        const insertData = {
          title: currentPost.title!,
          slug: currentPost.slug!,
          content: currentPost.content || null,
          excerpt: currentPost.excerpt || null,
          featured_image_url: currentPost.featured_image_url || null,
          author_name: currentPost.author_name || 'HOMEOFSMM Team',
          status: currentPost.status || 'draft',
          seo_title: currentPost.seo_title || null,
          seo_description: currentPost.seo_description || null,
          seo_keywords: seoKeywords,
          table_of_contents: currentPost.table_of_contents || [],
          faqs: currentPost.faqs || [],
          published_at: publishedAt
        };
        const { error } = await supabase
          .from('platform_blog_posts')
          .insert([insertData]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Blog post created successfully' });
      } else {
        const updateData = {
          title: currentPost.title!,
          slug: currentPost.slug!,
          content: currentPost.content || null,
          excerpt: currentPost.excerpt || null,
          featured_image_url: currentPost.featured_image_url || null,
          author_name: currentPost.author_name || 'HOMEOFSMM Team',
          status: currentPost.status || 'draft',
          seo_title: currentPost.seo_title || null,
          seo_description: currentPost.seo_description || null,
          seo_keywords: seoKeywords,
          table_of_contents: currentPost.table_of_contents || [],
          faqs: currentPost.faqs || [],
          published_at: publishedAt,
          updated_at: new Date().toISOString()
        };
        const { error } = await supabase
          .from('platform_blog_posts')
          .update(updateData)
          .eq('id', currentPost.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Blog post updated successfully' });
      }

      setEditDialogOpen(false);
      fetchPosts();
    } catch (error: any) {
      console.error('Error saving post:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: error.message || 'Failed to save blog post' 
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!currentPost.id) return;

    try {
      const { error } = await supabase
        .from('platform_blog_posts')
        .delete()
        .eq('id', currentPost.id);

      if (error) throw error;

      toast({ title: 'Deleted', description: 'Blog post deleted successfully' });
      setDeleteDialogOpen(false);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete blog post' });
    }
  };

  const addFAQ = () => {
    const faqs = [...(currentPost.faqs || []), { question: '', answer: '' }];
    setCurrentPost({ ...currentPost, faqs });
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const faqs = [...(currentPost.faqs || [])];
    faqs[index] = { ...faqs[index], [field]: value };
    setCurrentPost({ ...currentPost, faqs });
  };

  const removeFAQ = (index: number) => {
    const faqs = (currentPost.faqs || []).filter((_, i) => i !== index);
    setCurrentPost({ ...currentPost, faqs });
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BookOpen className="w-7 h-7" />
            Blog Management
          </h1>
          <p className="text-muted-foreground">Manage platform blog posts and content</p>
        </div>
        <Button onClick={handleCreatePost} className="gap-2">
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Blog Posts</CardTitle>
              <CardDescription>{posts.length} posts total</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No blog posts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium line-clamp-1">{post.title}</p>
                          <p className="text-xs text-muted-foreground">/blog/{post.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={post.status === 'published' ? 'default' : 'secondary'}
                          className={post.status === 'published' ? 'bg-emerald-500/20 text-emerald-600' : ''}
                        >
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{post.author_name}</TableCell>
                      <TableCell>
                        {post.published_at ? (
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(post.published_at), 'MMM dd, yyyy')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not published</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPost(post)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePost(post)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create New Post' : 'Edit Post'}</DialogTitle>
            <DialogDescription>
              {isCreating ? 'Create a new blog post' : `Editing: ${currentPost.title}`}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="content" className="gap-1">
                <FileText className="w-3 h-3" />
                Content
              </TabsTrigger>
              <TabsTrigger value="seo" className="gap-1">
                <Search className="w-3 h-3" />
                SEO
              </TabsTrigger>
              <TabsTrigger value="toc" className="gap-1">
                <List className="w-3 h-3" />
                TOC
              </TabsTrigger>
              <TabsTrigger value="faq" className="gap-1">
                <HelpCircle className="w-3 h-3" />
                FAQ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={currentPost.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      setCurrentPost({ 
                        ...currentPost, 
                        title,
                        slug: isCreating ? generateSlug(title) : currentPost.slug
                      });
                    }}
                    placeholder="Enter post title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={currentPost.slug || ''}
                    onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
                    placeholder="post-url-slug"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={currentPost.author_name || ''}
                    onChange={(e) => setCurrentPost({ ...currentPost, author_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center gap-4 pt-2">
                    <Switch
                      id="status"
                      checked={currentPost.status === 'published'}
                      onCheckedChange={(checked) => setCurrentPost({ 
                        ...currentPost, 
                        status: checked ? 'published' : 'draft' 
                      })}
                    />
                    <span className="text-sm">
                      {currentPost.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured_image">Featured Image URL</Label>
                <Input
                  id="featured_image"
                  value={currentPost.featured_image_url || ''}
                  onChange={(e) => setCurrentPost({ ...currentPost, featured_image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={currentPost.excerpt || ''}
                  onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                  rows={3}
                  placeholder="Brief summary of the post..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content (HTML)</Label>
                <Textarea
                  id="content"
                  value={currentPost.content || ''}
                  onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                  rows={15}
                  placeholder="<h2>Your content here...</h2>"
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input
                  id="seo_title"
                  value={currentPost.seo_title || ''}
                  onChange={(e) => setCurrentPost({ ...currentPost, seo_title: e.target.value })}
                  placeholder="SEO optimized title (max 60 chars)"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {(currentPost.seo_title || '').length}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_description">SEO Description</Label>
                <Textarea
                  id="seo_description"
                  value={currentPost.seo_description || ''}
                  onChange={(e) => setCurrentPost({ ...currentPost, seo_description: e.target.value })}
                  rows={3}
                  placeholder="SEO meta description (max 160 chars)"
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">
                  {(currentPost.seo_description || '').length}/160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_keywords">SEO Keywords</Label>
                <Input
                  id="seo_keywords"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-xs text-muted-foreground">
                  Separate keywords with commas
                </p>
              </div>
            </TabsContent>

            <TabsContent value="toc" className="space-y-4 mt-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Table of Contents is automatically generated from H2 and H3 headings in your content.
                  Make sure your headings have id attributes.
                </p>
                <p className="text-sm font-mono text-muted-foreground">
                  Example: &lt;h2 id="introduction"&gt;Introduction&lt;/h2&gt;
                </p>
              </div>

              <div className="space-y-2">
                <Label>Current Table of Contents</Label>
                {(currentPost.table_of_contents || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 border rounded-lg">
                    No table of contents items
                  </p>
                ) : (
                  <div className="space-y-1 p-4 border rounded-lg">
                    {(currentPost.table_of_contents || []).map((item: TOCItem, i: number) => (
                      <div 
                        key={i} 
                        className="flex items-center gap-2"
                        style={{ paddingLeft: `${(item.level - 2) * 20}px` }}
                      >
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm">{item.text}</span>
                        <span className="text-xs text-muted-foreground">#{item.id}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="faq" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <Label>FAQ Items</Label>
                <Button size="sm" onClick={addFAQ} variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add FAQ
                </Button>
              </div>

              {(currentPost.faqs || []).length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 border rounded-lg text-center">
                  No FAQ items. Click "Add FAQ" to create one.
                </p>
              ) : (
                <div className="space-y-4">
                  {(currentPost.faqs || []).map((faq: FAQ, i: number) => (
                    <Card key={i}>
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">FAQ #{i + 1}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFAQ(i)}
                            className="text-destructive h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <div className="space-y-1">
                          <Label className="text-xs">Question</Label>
                          <Input
                            value={faq.question}
                            onChange={(e) => updateFAQ(i, 'question', e.target.value)}
                            placeholder="What is the question?"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Answer</Label>
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => updateFAQ(i, 'answer', e.target.value)}
                            placeholder="Provide the answer..."
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePost} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isCreating ? 'Create Post' : 'Save Changes'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{currentPost.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogManagement;
