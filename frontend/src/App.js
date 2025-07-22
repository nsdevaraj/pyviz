import React, { useState, useCallback } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import DataInput from "./components/DataInput";
import ChartBuilder from "./components/ChartBuilder";
import PreviewPanel from "./components/PreviewPanel";

const VisualizationPlatform = () => {
  const [dataset, setDataset] = useState(null);
  const [visualization, setVisualization] = useState(null);

  const handleDataChange = useCallback((newData) => {
    setDataset(newData);
    // Reset visualization when data changes
    if (!newData) {
      setVisualization(null);
    }
  }, []);

  const handleVisualizationChange = useCallback((newVisualization) => {
    setVisualization(newVisualization);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">📊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Python Visualization Generator
                </h1>
                <p className="text-sm text-muted-foreground">
                  Interactive Business Intelligence Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Live Preview
              </div>
              <div className="text-sm text-muted-foreground">
                Frontend Python Execution
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          {/* Data Input Panel */}
          <div className="col-span-4">
            <DataInput 
              onDataChange={handleDataChange}
              currentData={dataset}
            />
          </div>

          {/* Chart Builder Panel */}
          <div className="col-span-4">
            <ChartBuilder 
              dataset={dataset}
              onVisualizationChange={handleVisualizationChange}
              currentVisualization={visualization}
            />
          </div>

          {/* Preview Panel */}
          <div className="col-span-4">
            <PreviewPanel 
              visualization={visualization}
            />
          </div>
        </div>

        {/* Quick Stats Footer */}
        {dataset && (
          <div className="mt-8 grid grid-cols-4 gap-4">
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border">
              <div className="text-2xl font-bold text-blue-600">{dataset.rows?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Data Points</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border">
              <div className="text-2xl font-bold text-green-600">{dataset.cols?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Values</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border">
              <div className="text-2xl font-bold text-purple-600">
                {visualization ? '1' : '0'}
              </div>
              <div className="text-sm text-muted-foreground">Chart Generated</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border">
              <div className="text-2xl font-bold text-orange-600">
                {visualization?.pythonCode ? Math.round(visualization.pythonCode.length / 50) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Lines of Code</div>
            </div>
          </div>
        )}
      </main>

      <Toaster />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VisualizationPlatform />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;