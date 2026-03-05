import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  Users,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  FileJson,
  Loader2
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import KanbanCard from "@/components/admin/KanbanCard";

interface Report {
  id: string;
  name: string;
  type: 'revenue' | 'users' | 'panels' | 'orders';
  format: 'csv' | 'pdf' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  file_size?: string;
}

const ReportsExport = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'Monthly Revenue Report',
      type: 'revenue',
      format: 'csv',
      status: 'completed',
      created_at: new Date().toISOString(),
      file_size: '2.4 MB'
    },
    {
      id: '2',
      name: 'User Activity Report',
      type: 'users',
      format: 'pdf',
      status: 'processing',
      created_at: new Date().toISOString()
    }
  ]);
  const [generating, setGenerating] = useState(false);
  const [newReport, setNewReport] = useState({
    type: 'revenue' as 'revenue' | 'users' | 'panels' | 'orders',
    format: 'csv' as 'csv' | 'pdf' | 'json',
    dateRange: '30d'
  });

  const reportTypes = [
    { value: 'revenue', label: 'Revenue Report', icon: DollarSign, color: 'text-emerald-500' },
    { value: 'users', label: 'Users Report', icon: Users, color: 'text-blue-500' },
    { value: 'panels', label: 'Panels Report', icon: BarChart3, color: 'text-violet-500' },
    { value: 'orders', label: 'Orders Report', icon: Package, color: 'text-amber-500' }
  ];

  const formatTypes = [
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet },
    { value: 'pdf', label: 'PDF', icon: FileText },
    { value: 'json', label: 'JSON', icon: FileJson }
  ];

  const dateRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'all', label: 'All time' }
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-slate-500/10 text-slate-500',
      processing: 'bg-blue-500/10 text-blue-500',
      completed: 'bg-emerald-500/10 text-emerald-500',
      failed: 'bg-red-500/10 text-red-500'
    };
    return styles[status];
  };

  const getTypeInfo = (type: string) => {
    return reportTypes.find(t => t.value === type);
  };

  const generateReport = async () => {
    setGenerating(true);
    
    const newReportData: Report = {
      id: crypto.randomUUID(),
      name: `${reportTypes.find(t => t.value === newReport.type)?.label} - ${new Date().toLocaleDateString()}`,
      type: newReport.type,
      format: newReport.format,
      status: 'processing',
      created_at: new Date().toISOString()
    };

    setReports(prev => [newReportData, ...prev]);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    setReports(prev => prev.map(r => 
      r.id === newReportData.id 
        ? { ...r, status: 'completed' as const, file_size: '1.8 MB' }
        : r
    ));

    setGenerating(false);
    toast({ title: "Report Generated", description: "Your report is ready for download" });
  };

  const downloadReport = (report: Report) => {
    toast({ title: "Download Started", description: `Downloading ${report.name}` });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 md:space-y-6"
    >
      <Helmet>
        <title>Reports & Export - Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold">Reports & Export</h1>
        <p className="text-muted-foreground">Generate and download platform reports</p>
      </motion.div>

      {/* Generate New Report */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Generate New Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select 
                  value={newReport.type} 
                  onValueChange={(value: 'revenue' | 'users' | 'panels' | 'orders') => 
                    setNewReport(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className={`w-4 h-4 ${type.color}`} />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select 
                  value={newReport.format} 
                  onValueChange={(value: 'csv' | 'pdf' | 'json') => 
                    setNewReport(prev => ({ ...prev, format: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formatTypes.map(format => (
                      <SelectItem key={format.value} value={format.value}>
                        <div className="flex items-center gap-2">
                          <format.icon className="w-4 h-4" />
                          {format.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select 
                  value={newReport.dateRange} 
                  onValueChange={(value) => setNewReport(prev => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRanges.map(range => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={generateReport} 
                  disabled={generating}
                  className="w-full gap-2"
                >
                  {generating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
                  ) : (
                    <><FileText className="w-4 h-4" />Generate Report</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Report Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map(type => (
          <Card 
            key={type.value} 
            className="glass-card-hover cursor-pointer"
            onClick={() => {
              setNewReport(prev => ({ ...prev, type: type.value as any }));
              generateReport();
            }}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-3 rounded-lg bg-${type.color.split('-')[1]}-500/10`}>
                <type.icon className={`w-6 h-6 ${type.color}`} />
              </div>
              <div>
                <p className="font-medium">{type.label}</p>
                <p className="text-xs text-muted-foreground">Quick export</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Recent Reports */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No reports generated yet</p>
                </div>
              ) : (
                reports.map(report => {
                  const typeInfo = getTypeInfo(report.type);
                  const TypeIcon = typeInfo?.icon || FileText;
                  return (
                    <KanbanCard key={report.id}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`p-2 rounded-lg bg-${typeInfo?.color.split('-')[1]}-500/10 shrink-0`}>
                            <TypeIcon className={`w-4 h-4 md:w-5 md:h-5 ${typeInfo?.color}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate text-sm md:text-base">{report.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                              <Calendar className="w-3 h-3" />
                              <span className="hidden sm:inline">{new Date(report.created_at).toLocaleString()}</span>
                              <span className="sm:hidden">{new Date(report.created_at).toLocaleDateString()}</span>
                              <span className="uppercase">{report.format}</span>
                              {report.file_size && <span>{report.file_size}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Badge className={getStatusBadge(report.status)}>
                            {report.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                            {report.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {report.status}
                          </Badge>
                          {report.status === 'completed' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-1"
                              onClick={() => downloadReport(report)}
                            >
                              <Download className="w-4 h-4" />
                              <span className="hidden sm:inline">Download</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </KanbanCard>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ReportsExport;
