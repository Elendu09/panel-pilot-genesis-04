import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  BookOpen,
  Loader2,
  Star,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PlatformDoc {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string | null;
  excerpt: string | null;
  icon: string | null;
  order_index: number | null;
  is_popular: boolean | null;
  read_time: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

const categories = [
  { value: 'getting-started', label: 'Getting Started' },
  { value: 'api', label: 'API Reference' },
  { value: 'integration', label: 'Integration Guide' },
  { value: 'configuration', label: 'Configuration' },
  { value: 'user-management', label: 'User Management' },
  { value: 'security', label: 'Security' },
  { value: 'troubleshooting', label: 'Troubleshooting' },
];

export default function DocsManagement() {
  const [docs, setDocs] = useState<PlatformDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<PlatformDoc | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'getting-started',
    content: '',
    excerpt: '',
    icon: '',
    order_index: 0,
    is_popular: false,
    read_time: '5 min read',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    status: 'published',
  });

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_docs')
        .select('*')
        .order('category', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      setDocs(data || []);
    } catch (error) {
      console.error('Error fetching docs:', error);
      toast.error('Failed to load documentation');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      seo_title: prev.seo_title || title,
    }));
  };

  const openCreateDialog = () => {
    setSelectedDoc(null);
    setFormData({
      title: '',
      slug: '',
      category: 'getting-started',
      content: '',
      excerpt: '',
      icon: '',
      order_index: docs.length,
      is_popular: false,
      read_time: '5 min read',
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      status: 'published',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (doc: PlatformDoc) => {
    setSelectedDoc(doc);
    setFormData({
      title: doc.title,
      slug: doc.slug,
      category: doc.category,
      content: doc.content || '',
      excerpt: doc.excerpt || '',
      icon: doc.icon || '',
      order_index: doc.order_index || 0,
      is_popular: doc.is_popular || false,
      read_time: doc.read_time || '5 min read',
      seo_title: doc.seo_title || '',
      seo_description: doc.seo_description || '',
      seo_keywords: doc.seo_keywords?.join(', ') || '',
      status: doc.status || 'published',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.category) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      const docData = {
        title: formData.title,
        slug: formData.slug,
        category: formData.category,
        content: formData.content,
        excerpt: formData.excerpt,
        icon: formData.icon,
        order_index: formData.order_index,
        is_popular: formData.is_popular,
        read_time: formData.read_time,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        seo_keywords: formData.seo_keywords.split(',').map(k => k.trim()).filter(Boolean),
        status: formData.status,
      };

      if (selectedDoc) {
        const { error } = await supabase
          .from('platform_docs')
          .update(docData)
          .eq('id', selectedDoc.id);

        if (error) throw error;
        toast.success('Documentation updated');
      } else {
        const { error } = await supabase
          .from('platform_docs')
          .insert(docData);

        if (error) throw error;
        toast.success('Documentation created');
      }

      setIsDialogOpen(false);
      fetchDocs();
    } catch (error: any) {
      console.error('Error saving doc:', error);
      toast.error(error.message || 'Failed to save documentation');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;

    try {
      const { error } = await supabase
        .from('platform_docs')
        .delete()
        .eq('id', selectedDoc.id);

      if (error) throw error;
      toast.success('Documentation deleted');
      setIsDeleteDialogOpen(false);
      setSelectedDoc(null);
      fetchDocs();
    } catch (error) {
      console.error('Error deleting doc:', error);
      toast.error('Failed to delete documentation');
    }
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (value: string) => {
    return categories.find(c => c.value === value)?.label || value;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Documentation Management</h1>
          <p className="text-sm text-muted-foreground">Manage platform documentation articles</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-gradient-primary w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Article
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-primary/10 rounded-lg">
                <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">{docs.length}</p>
                <p className="text-xs text-muted-foreground">Total Articles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-green-500/10 rounded-lg">
                <Eye className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">{docs.filter(d => d.status === 'published').length}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-yellow-500/10 rounded-lg">
                <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">{docs.filter(d => d.is_popular).length}</p>
                <p className="text-xs text-muted-foreground">Popular</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-blue-500/10 rounded-lg">
                <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">{new Set(docs.map(d => d.category)).size}</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card>
        <CardContent className="p-3 md:p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Popular</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No articles found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">/docs/{doc.category}/{doc.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getCategoryLabel(doc.category)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={doc.status === 'published' ? 'default' : 'outline'}>
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {doc.is_popular && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(doc.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(`/docs/${doc.category}/${doc.slug}`, '_blank')}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(doc)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => { setSelectedDoc(doc); setIsDeleteDialogOpen(true); }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDoc ? 'Edit Article' : 'Create Article'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Article title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="article-slug"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="read_time">Read Time</Label>
                <Input
                  id="read_time"
                  value={formData.read_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, read_time: e.target.value }))}
                  placeholder="5 min read"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief description of the article..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (Markdown)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Article content in markdown format..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_popular"
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: checked }))}
                />
                <Label htmlFor="is_popular">Mark as Popular</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="order_index">Order:</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                  className="w-20"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-4">SEO Settings</h4>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                    placeholder="SEO optimized title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_description">SEO Description</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                    placeholder="Meta description for search engines..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_keywords">SEO Keywords (comma separated)</Label>
                  <Input
                    id="seo_keywords"
                    value={formData.seo_keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                    placeholder="smm panel, api, integration"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary w-full sm:w-auto">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedDoc ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete "{selectedDoc?.title}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
