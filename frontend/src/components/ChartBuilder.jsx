import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { mockChartTypes, mockCustomizationOptions, generateMockPythonCode } from '../mock';

const ChartBuilder = ({ dataset, onVisualizationChange, currentVisualization }) => {
  const [selectedChart, setSelectedChart] = useState(null);
  const [customization, setCustomization] = useState({
    colors: mockCustomizationOptions.colors[0],
    theme: mockCustomizationOptions.themes[0],
    size: mockCustomizationOptions.sizes[1], // Medium by default
    customWidth: 1200,
    customHeight: 800
  });

  useEffect(() => {
    if (selectedChart && dataset) {
      const pythonCode = generateMockPythonCode(selectedChart, dataset, customization);
      onVisualizationChange({
        chartType: selectedChart,
        dataset: dataset,
        customization: customization,
        pythonCode: pythonCode
      });
    }
  }, [selectedChart, dataset, customization]);

  const handleChartSelect = (chartType) => {
    setSelectedChart(chartType);
  };

  const updateCustomization = (key, value) => {
    setCustomization(prev => ({ ...prev, [key]: value }));
  };

  const chartCategories = {
    basic: mockChartTypes.filter(chart => chart.category === 'basic'),
    statistical: mockChartTypes.filter(chart => chart.category === 'statistical'),
    interactive: mockChartTypes.filter(chart => chart.category === 'interactive')
  };

  if (!dataset) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-lg font-semibold mb-2">No Data Provided</h3>
            <p>Please input your dataset first to start building visualizations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            🎨 Chart Builder
            {selectedChart && <Badge variant="secondary">{selectedChart.library}</Badge>}
          </span>
          <div className="text-sm text-muted-foreground">
            {dataset.name}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart Type Selection */}
        <div>
          <h4 className="font-semibold mb-3">Select Chart Type</h4>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="statistical">Statistical</TabsTrigger>
              <TabsTrigger value="interactive">Interactive</TabsTrigger>
            </TabsList>
            
            {Object.entries(chartCategories).map(([category, charts]) => (
              <TabsContent key={category} value={category} className="mt-4">
                <div className="grid grid-cols-1 gap-2">
                  {charts.map((chart) => (
                    <Button
                      key={chart.id}
                      variant={selectedChart?.id === chart.id ? "default" : "outline"}
                      className={`h-auto p-4 justify-start text-left transition-all duration-200 ${
                        selectedChart?.id === chart.id ? 'ring-2 ring-primary' : 'hover:scale-105'
                      }`}
                      onClick={() => handleChartSelect(chart)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <span className="text-2xl">{chart.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold">{chart.name}</div>
                          <div className="text-sm text-muted-foreground">{chart.description}</div>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {chart.library}
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {selectedChart && (
          <>
            {/* Customization Options */}
            <div className="space-y-4 border-t pt-6">
              <h4 className="font-semibold">Customization</h4>
              
              {/* Color Scheme */}
              <div>
                <label className="text-sm font-medium mb-2 block">Color Scheme</label>
                <div className="grid grid-cols-2 gap-2">
                  {mockCustomizationOptions.colors.map((colorScheme) => (
                    <Button
                      key={colorScheme.value}
                      variant={customization.colors.value === colorScheme.value ? "default" : "outline"}
                      className="h-auto p-3 justify-start"
                      onClick={() => updateCustomization('colors', colorScheme)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex gap-1">
                          {colorScheme.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="text-sm">{colorScheme.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="text-sm font-medium mb-2 block">Theme</label>
                <Select
                  value={customization.theme.value}
                  onValueChange={(value) => {
                    const theme = mockCustomizationOptions.themes.find(t => t.value === value);
                    updateCustomization('theme', theme);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCustomizationOptions.themes.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        <div>
                          <div className="font-medium">{theme.name}</div>
                          <div className="text-sm text-muted-foreground">{theme.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Size */}
              <div>
                <label className="text-sm font-medium mb-2 block">Chart Size</label>
                <Select
                  value={customization.size.value}
                  onValueChange={(value) => {
                    const size = mockCustomizationOptions.sizes.find(s => s.value === value);
                    updateCustomization('size', size);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCustomizationOptions.sizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.name} ({size.width} × {size.height})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {customization.size.value === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Width: {customization.customWidth}px
                    </label>
                    <Slider
                      value={[customization.customWidth]}
                      onValueChange={([value]) => updateCustomization('customWidth', value)}
                      max={2000}
                      min={400}
                      step={50}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Height: {customization.customHeight}px
                    </label>
                    <Slider
                      value={[customization.customHeight]}
                      onValueChange={([value]) => updateCustomization('customHeight', value)}
                      max={1500}
                      min={300}
                      step={50}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartBuilder;