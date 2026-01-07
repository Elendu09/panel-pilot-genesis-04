import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Shield, Eye, FileDown, Sparkles, Plus } from "lucide-react";
import { getDefaultTermsOfService, getDefaultPrivacyPolicy, LegalSection } from "@/lib/legal-content";
import { motion, AnimatePresence } from "framer-motion";

interface LegalContentEditorProps {
  termsOfService: string;
  privacyPolicy: string;
  panelName: string;
  supportEmail?: string;
  onTermsChange: (value: string) => void;
  onPrivacyChange: (value: string) => void;
}

const sectionTemplates = [
  { id: 'heading', label: 'Section Heading', template: '## Section Title\n\n' },
  { id: 'paragraph', label: 'Paragraph', template: 'Your content here...\n\n' },
  { id: 'list', label: 'Bullet List', template: '- Item one\n- Item two\n- Item three\n\n' },
  { id: 'bold', label: 'Bold Text', template: '**Important text**' },
];

export const LegalContentEditor = ({
  termsOfService,
  privacyPolicy,
  panelName,
  supportEmail,
  onTermsChange,
  onPrivacyChange,
}: LegalContentEditorProps) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const [previewMode, setPreviewMode] = useState(false);

  const handleUseDefaultTerms = () => {
    const defaultSections = getDefaultTermsOfService(panelName, supportEmail);
    const content = sectionsToMarkdown(defaultSections);
    onTermsChange(content);
  };

  const handleUseDefaultPrivacy = () => {
    const defaultSections = getDefaultPrivacyPolicy(panelName, supportEmail);
    const content = sectionsToMarkdown(defaultSections);
    onPrivacyChange(content);
  };

  const sectionsToMarkdown = (sections: LegalSection[]): string => {
    return sections.map(section => `## ${section.title}\n\n${section.content}`).join('\n\n');
  };

  const insertTemplate = (template: string) => {
    const content = activeTab === 'terms' ? termsOfService : privacyPolicy;
    const newContent = content + template;
    if (activeTab === 'terms') {
      onTermsChange(newContent);
    } else {
      onPrivacyChange(newContent);
    }
  };

  const formatPreview = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      // Handle headings
      if (paragraph.startsWith('## ')) {
        return (
          <h3 key={index} className="text-lg font-semibold mt-6 mb-3 text-foreground">
            {paragraph.replace('## ', '')}
          </h3>
        );
      }
      if (paragraph.startsWith('# ')) {
        return (
          <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-foreground">
            {paragraph.replace('# ', '')}
          </h2>
        );
      }
      
      // Handle bold text
      const formattedParagraph = paragraph.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      
      // Handle list items
      if (paragraph.startsWith('- ')) {
        const items = paragraph.split('\n').filter(item => item.startsWith('- '));
        return (
          <ul key={index} className="list-disc list-inside space-y-1 mb-4 text-muted-foreground ml-4">
            {items.map((item, i) => (
              <li key={i}>{item.replace('- ', '')}</li>
            ))}
          </ul>
        );
      }
      
      // Regular paragraphs
      return (
        <p 
          key={index} 
          className="text-muted-foreground mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedParagraph }}
        />
      );
    });
  };

  const currentContent = activeTab === 'terms' ? termsOfService : privacyPolicy;
  const currentOnChange = activeTab === 'terms' ? onTermsChange : onPrivacyChange;
  const handleUseDefault = activeTab === 'terms' ? handleUseDefaultTerms : handleUseDefaultPrivacy;

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'terms' | 'privacy')}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-2">
            <TabsTrigger value="terms" className="gap-2">
              <FileText className="w-4 h-4" />
              Terms of Service
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="w-4 h-4" />
              Privacy Policy
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUseDefault}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Use Template
            </Button>
          </div>
        </div>

        {/* Quick Insert Templates */}
        {!previewMode && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-muted-foreground self-center mr-2">Quick insert:</span>
            {sectionTemplates.map((template) => (
              <Button
                key={template.id}
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => insertTemplate(template.template)}
              >
                <Plus className="w-3 h-3" />
                {template.label}
              </Button>
            ))}
          </div>
        )}

        <TabsContent value="terms" className="mt-0">
          <AnimatePresence mode="wait">
            {previewMode ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <FileText className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{panelName}</h3>
                        <p className="text-xs text-muted-foreground">Terms of Service Preview</p>
                      </div>
                    </div>
                    <ScrollArea className="h-[400px] pr-4">
                      {termsOfService ? formatPreview(termsOfService) : (
                        <p className="text-muted-foreground italic">No content yet. Click "Use Template" to get started.</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {termsOfService.length} characters
                  </Badge>
                </div>
                <Textarea
                  value={termsOfService}
                  onChange={(e) => onTermsChange(e.target.value)}
                  rows={16}
                  placeholder="Enter your terms of service content...

Use markdown formatting:
## Section Heading
**Bold text**
- Bullet list items

Click 'Use Template' for compliant default content."
                  className="font-mono text-sm resize-none"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="privacy" className="mt-0">
          <AnimatePresence mode="wait">
            {previewMode ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Shield className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{panelName}</h3>
                        <p className="text-xs text-muted-foreground">Privacy Policy Preview</p>
                      </div>
                    </div>
                    <ScrollArea className="h-[400px] pr-4">
                      {privacyPolicy ? formatPreview(privacyPolicy) : (
                        <p className="text-muted-foreground italic">No content yet. Click "Use Template" to get started.</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {privacyPolicy.length} characters
                  </Badge>
                </div>
                <Textarea
                  value={privacyPolicy}
                  onChange={(e) => onPrivacyChange(e.target.value)}
                  rows={16}
                  placeholder="Enter your privacy policy content...

Use markdown formatting:
## Section Heading
**Bold text**
- Bullet list items

Click 'Use Template' for compliant default content."
                  className="font-mono text-sm resize-none"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LegalContentEditor;
