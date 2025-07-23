import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Copy, Download, Play, Eye } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const PreviewPanel = ({ visualization }) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (visualization?.chartImage) {
      setPreviewImage(visualization.chartImage);
    }
  }, [visualization?.chartImage]);

  const copyCode = () => {
    if (visualization?.pythonCode) {
      navigator.clipboard.writeText(visualization.pythonCode);
      toast({
        title: 'Code copied',
        description: 'Python code copied to clipboard',
      });
    }
  };

  const downloadCode = () => {
    if (visualization?.pythonCode) {
      const blob = new Blob([visualization.pythonCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${visualization.dataset?.name || 'visualization'}_script.py`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: 'Code downloaded',
        description: 'Python script has been downloaded',
      });
    }
  };

  const executeCode = async () => {
    if (!visualization?.pythonCode) return;
    setIsLoading(true);
    try {
      const response = await axios.post('/api/visualization/execute', {
        code: visualization.pythonCode,
        dataset: visualization.dataset,
      });
      const data = response.data;
      if (data.success && data.chart_image) {
        setPreviewImage(data.chart_image);
        toast({ title: 'Execution successful', description: 'Visualization updated' });
      } else {
        toast({ title: 'Error', description: data.error_message || 'Execution failed', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!visualization) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <div className="text-6xl mb-4">👁️</div>
            <h3 className="text-lg font-semibold mb-2">No Preview Available</h3>
            <p>Select a chart type and customize it to see the preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { chartType, dataset, customization, pythonCode } = visualization;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            🖼️ Live Preview
            <Badge variant="secondary">{chartType?.name}</Badge>
            {isLoading && <Badge variant="outline">Loading...</Badge>}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copyCode}>
              <Copy className="w-4 h-4 mr-1" />Copy
            </Button>
            <Button size="sm" variant="outline" onClick={downloadCode}>
              <Download className="w-4 h-4 mr-1" />Download
            </Button>
            <Button size="sm" onClick={executeCode} disabled={isLoading}>
              <Play className="w-4 h-4 mr-1" />Execute
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="px-6 pt-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />Preview
              </TabsTrigger>
              <TabsTrigger value="code">
                <span className="font-mono">{'<code/>'}</span>Python Code
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="preview" className="p-6 pt-4">
            <div className="space-y-4">
              {/* Chart Info */}
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="outline">{chartType.library}</Badge>
                <Badge variant="outline">{customization.theme.name} theme</Badge>
                <Badge variant="outline">{customization.colors.name} colors</Badge>
                <Badge variant="outline">{customization.size.width} × {customization.size.height}</Badge>
              </div>
              {/* Preview Area */}
              <div className="border rounded-lg overflow-hidden bg-muted/50">
                {(!previewImage || isLoading) ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="animate-spin text-4xl mb-4">⚙️</div>
                      <p className="text-muted-foreground">Loading visualization...</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={previewImage}
                    alt="Chart Preview"
                    className="w-full h-auto"
                    style={{
                      minHeight: '400px',
                      maxHeight: '600px',
                      objectFit: 'contain',
                      background: customization.theme.value === 'dark' ? '#1a1a1a' : '#ffffff'
                    }}
                  />
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="code" className="p-6 pt-4 h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Generated Python Code</h4>
                <div className="text-sm text-muted-foreground">
                  {pythonCode.split('\n').length} lines
                </div>
              </div>
              <Textarea
                value={pythonCode}
                readOnly
                className="font-mono text-sm min-h-[500px] bg-muted/50"
              />
              <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">💡 Usage Notes:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>This code uses {chartType.library} for visualization</li>
                  <li>Saves output as 'visualization.png' with 300 DPI</li>
                  <li>Includes proper styling and formatting</li>
                  <li>Ready to run in Jupyter notebooks or Python scripts</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PreviewPanel;
