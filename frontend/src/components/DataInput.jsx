import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { mockDatasets } from '../mock';
import { useToast } from '../hooks/use-toast';

const DataInput = ({ onDataChange, currentData }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [selectedExample, setSelectedExample] = useState('');
  const [isValidJson, setIsValidJson] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (currentData) {
      setJsonInput(JSON.stringify(currentData, null, 2));
    }
  }, [currentData]);

  const validateAndParseJson = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Validate required fields
      if (!parsed.rows || !parsed.cols) {
        throw new Error('JSON must contain "rows" and "cols" arrays');
      }
      
      if (!Array.isArray(parsed.rows) || !Array.isArray(parsed.cols)) {
        throw new Error('"rows" and "cols" must be arrays');
      }
      
      if (parsed.rows.length === 0 || parsed.cols.length === 0) {
        throw new Error('Arrays cannot be empty');
      }

      return { isValid: true, data: parsed, error: null };
    } catch (error) {
      return { isValid: false, data: null, error: error.message };
    }
  };

  const handleJsonChange = (value) => {
    setJsonInput(value);
    
    if (value.trim()) {
      const result = validateAndParseJson(value);
      setIsValidJson(result.isValid);
      
      if (result.isValid) {
        onDataChange({
          ...result.data,
          name: result.data.name || 'Custom Dataset'
        });
      }
    }
  };

  const loadExampleData = (exampleKey) => {
    if (exampleKey && mockDatasets[exampleKey]) {
      const example = mockDatasets[exampleKey];
      setSelectedExample(exampleKey);
      setJsonInput(JSON.stringify(example, null, 2));
      setIsValidJson(true);
      onDataChange(example);
      
      toast({
        title: "Example loaded",
        description: `${example.name} dataset loaded successfully`,
      });
    }
  };

  const clearData = () => {
    setJsonInput('');
    setSelectedExample('');
    setIsValidJson(true);
    onDataChange(null);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            📊 Data Input
            {!isValidJson && <Badge variant="destructive">Invalid JSON</Badge>}
          </span>
          <div className="flex gap-2">
            <Select value={selectedExample} onValueChange={loadExampleData}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Load example..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(mockDatasets).map(([key, dataset]) => (
                  <SelectItem key={key} value={key}>
                    {dataset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={clearData}>
              Clear
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            JSON Dataset (rows, cols, values)
          </label>
          <Textarea
            value={jsonInput}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder={`{
  "name": "Sample Data",
  "rows": ["A", "B", "C", "D"],
  "cols": [10, 20, 15, 25],
  "values": [0.1, 0.2, 0.15, 0.25]
}`}
            className={`font-mono text-sm min-h-[300px] transition-colors ${
              !isValidJson ? 'border-red-500 focus:border-red-500' : ''
            }`}
          />
          {!isValidJson && (
            <p className="text-red-500 text-sm mt-2">
              Please enter valid JSON with required "rows" and "cols" arrays
            </p>
          )}
        </div>
        
        {currentData && (
          <div className="space-y-3">
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Dataset Preview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Rows ({currentData.rows?.length || 0}):</span>
                  <p className="text-muted-foreground truncate">
                    {currentData.rows?.join(', ') || 'None'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Cols ({currentData.cols?.length || 0}):</span>
                  <p className="text-muted-foreground truncate">
                    {currentData.cols?.join(', ') || 'None'}
                  </p>
                </div>
              </div>
              {currentData.values && (
                <div className="mt-2">
                  <span className="font-medium text-sm">Values ({currentData.values.length}):</span>
                  <p className="text-muted-foreground text-sm truncate">
                    {currentData.values.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataInput;