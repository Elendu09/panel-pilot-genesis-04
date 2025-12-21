import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { 
  customerExportFields, 
  generateCustomerCSV, 
  generateCustomerPrintHTML,
  ExportField 
} from "@/lib/customer-utils";
import { useToast } from "@/hooks/use-toast";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: any[];
}

const STORAGE_KEY = 'customer-export-fields';

export function ExportDialog({ open, onOpenChange, customers }: ExportDialogProps) {
  const { toast } = useToast();
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');

  useEffect(() => {
    // Load saved selections or use defaults
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSelectedFields(JSON.parse(saved));
      } catch {
        setSelectedFields(customerExportFields.filter(f => f.defaultSelected).map(f => f.key));
      }
    } else {
      setSelectedFields(customerExportFields.filter(f => f.defaultSelected).map(f => f.key));
    }
  }, []);

  const handleFieldToggle = (fieldKey: string, checked: boolean) => {
    const newFields = checked 
      ? [...selectedFields, fieldKey]
      : selectedFields.filter(f => f !== fieldKey);
    setSelectedFields(newFields);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFields));
  };

  const handleSelectAll = () => {
    const allKeys = customerExportFields.map(f => f.key);
    setSelectedFields(allKeys);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allKeys));
  };

  const handleDeselectAll = () => {
    setSelectedFields([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  };

  const handleExport = () => {
    if (selectedFields.length === 0) {
      toast({ title: "No fields selected", description: "Please select at least one field to export.", variant: "destructive" });
      return;
    }

    if (exportFormat === 'csv') {
      const csv = generateCustomerCSV(customers, selectedFields, customerExportFields);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const html = generateCustomerPrintHTML(customers, selectedFields, customerExportFields, 'Customer Export');
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }
    }

    toast({ title: "Export Complete", description: `Exported ${customers.length} customers to ${exportFormat.toUpperCase()}.` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Customers
          </DialogTitle>
          <DialogDescription>
            Select fields to include in your export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format Selection */}
          <div className="flex gap-2">
            <Button
              variant={exportFormat === 'csv' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setExportFormat('csv')}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button
              variant={exportFormat === 'pdf' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setExportFormat('pdf')}
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>

          {/* Select/Deselect All */}
          <div className="flex justify-between text-sm">
            <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleDeselectAll}>
              Deselect All
            </Button>
          </div>

          {/* Field Checkboxes */}
          <div className="grid grid-cols-2 gap-3">
            {customerExportFields.map((field) => (
              <div key={field.key} className="flex items-center space-x-2">
                <Checkbox
                  id={field.key}
                  checked={selectedFields.includes(field.key)}
                  onCheckedChange={(checked) => handleFieldToggle(field.key, !!checked)}
                />
                <Label htmlFor={field.key} className="text-sm cursor-pointer">
                  {field.label}
                </Label>
              </div>
            ))}
          </div>

          {/* Preview count */}
          <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
            <span className="font-medium">{customers.length}</span> customers will be exported with{' '}
            <span className="font-medium">{selectedFields.length}</span> field(s)
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={selectedFields.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export {exportFormat.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
