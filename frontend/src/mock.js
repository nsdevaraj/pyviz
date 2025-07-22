// Mock data for Python Visualization Generation Platform
export const mockDatasets = {
  salesData: {
    name: "Sales Performance",
    rows: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    cols: [15000, 22000, 18000, 25000, 28000, 32000],
    values: [0.15, 0.22, 0.18, 0.25, 0.28, 0.32], // Optional for heatmaps/bubble charts
    description: "Monthly sales performance data"
  },
  customerSegments: {
    name: "Customer Segments",
    rows: ["Enterprise", "SMB", "Startup", "Individual"],
    cols: [45, 32, 18, 5],
    values: [450, 320, 180, 50],
    description: "Customer distribution by segment"
  },
  temperatureData: {
    name: "Temperature Analysis",
    rows: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    cols: [22, 25, 28, 24, 26, 29, 31],
    values: [22, 25, 28, 24, 26, 29, 31],
    description: "Weekly temperature readings"
  }
};

export const mockChartTypes = [
  {
    id: 'matplotlib_line',
    name: 'Line Chart',
    library: 'matplotlib',
    description: 'Perfect for showing trends over time',
    icon: '📈',
    category: 'basic'
  },
  {
    id: 'matplotlib_bar',
    name: 'Bar Chart',
    library: 'matplotlib',
    description: 'Great for comparing categories',
    icon: '📊',
    category: 'basic'
  },
  {
    id: 'matplotlib_scatter',
    name: 'Scatter Plot',
    library: 'matplotlib',
    description: 'Shows relationships between variables',
    icon: '⚪',
    category: 'basic'
  },
  {
    id: 'seaborn_heatmap',
    name: 'Heatmap',
    library: 'seaborn',
    description: 'Visualize data through colors',
    icon: '🔥',
    category: 'statistical'
  },
  {
    id: 'seaborn_violin',
    name: 'Violin Plot',
    library: 'seaborn',
    description: 'Show distribution shapes',
    icon: '🎻',
    category: 'statistical'
  },
  {
    id: 'plotly_interactive',
    name: 'Interactive Chart',
    library: 'plotly',
    description: 'Hover, zoom, and pan capabilities',
    icon: '🖱️',
    category: 'interactive'
  }
];

export const mockCustomizationOptions = {
  colors: [
    { name: 'Default', value: 'default', colors: ['#1f77b4', '#ff7f0e', '#2ca02c'] },
    { name: 'Viridis', value: 'viridis', colors: ['#440154', '#31688e', '#35b779'] },
    { name: 'Plasma', value: 'plasma', colors: ['#0d0887', '#cc4778', '#f0f921'] },
    { name: 'Ocean', value: 'ocean', colors: ['#003f5c', '#58508d', '#bc5090'] },
    { name: 'Sunset', value: 'sunset', colors: ['#ff6b35', '#f7931e', '#ffd23f'] }
  ],
  themes: [
    { name: 'Clean', value: 'clean', description: 'Minimal and professional' },
    { name: 'Dark', value: 'dark', description: 'Dark theme for modern look' },
    { name: 'Scientific', value: 'scientific', description: 'Academic publication style' },
    { name: 'Presentation', value: 'presentation', description: 'Bold for presentations' }
  ],
  sizes: [
    { name: 'Small', value: 'small', width: 800, height: 600 },
    { name: 'Medium', value: 'medium', width: 1200, height: 800 },
    { name: 'Large', value: 'large', width: 1600, height: 1000 },
    { name: 'Custom', value: 'custom', width: 1200, height: 800 }
  ]
};

export const generateMockPythonCode = (chartType, dataset, customization) => {
  const { library, id } = chartType;
  const { rows, cols, values } = dataset;
  const { colors, theme, size } = customization;
  
  let code = `import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import pandas as pd
import numpy as np

# Data setup
rows = ${JSON.stringify(rows)}
cols = ${JSON.stringify(cols)}`;

  if (values && values.length > 0) {
    code += `
values = ${JSON.stringify(values)}`;
  }

  code += `

# Create DataFrame for easier manipulation
df = pd.DataFrame({
    'categories': rows,
    'values': cols${values && values.length > 0 ? ",\n    'weights': values" : ""}
})

# Set up the plot style
plt.style.use('${theme === 'dark' ? 'dark_background' : 'default'}')
figure_size = (${size.width/100}, ${size.height/100})

`;

  switch (id) {
    case 'matplotlib_line':
      code += `# Create line chart
plt.figure(figsize=figure_size)
plt.plot(rows, cols, marker='o', linewidth=2.5, markersize=8)
plt.title('${dataset.name}', fontsize=16, fontweight='bold', pad=20)
plt.xlabel('Categories', fontsize=12)
plt.ylabel('Values', fontsize=12)
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('visualization.png', dpi=300, bbox_inches='tight')
plt.show()`;
      break;

    case 'matplotlib_bar':
      code += `# Create bar chart
plt.figure(figsize=figure_size)
bars = plt.bar(rows, cols, color='${colors.colors[0]}', alpha=0.8, edgecolor='black', linewidth=0.8)
plt.title('${dataset.name}', fontsize=16, fontweight='bold', pad=20)
plt.xlabel('Categories', fontsize=12)
plt.ylabel('Values', fontsize=12)
plt.xticks(rotation=45 if len(rows) > 4 else 0)

# Add value labels on bars
for bar, value in zip(bars, cols):
    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + max(cols)*0.01,
             f'{value:,}', ha='center', va='bottom', fontweight='bold')

plt.tight_layout()
plt.savefig('visualization.png', dpi=300, bbox_inches='tight')
plt.show()`;
      break;

    case 'seaborn_heatmap':
      code += `# Create heatmap
plt.figure(figsize=figure_size)
# Reshape data for heatmap if needed
heatmap_data = np.array(cols).reshape(-1, 1) if len(np.array(cols).shape) == 1 else cols
sns.heatmap(heatmap_data, annot=True, cmap='${colors.value}', 
           xticklabels=rows[:len(heatmap_data[0])] if len(heatmap_data.shape) > 1 else ['Values'],
           yticklabels=rows, square=True, linewidths=0.5)
plt.title('${dataset.name}', fontsize=16, fontweight='bold', pad=20)
plt.tight_layout()
plt.savefig('visualization.png', dpi=300, bbox_inches='tight')
plt.show()`;
      break;

    case 'plotly_interactive':
      code += `# Create interactive chart with Plotly
import plotly.graph_objects as go

fig = go.Figure()
fig.add_trace(go.Scatter(
    x=rows,
    y=cols,
    mode='lines+markers',
    name='${dataset.name}',
    line=dict(width=3, color='${colors.colors[0]}'),
    marker=dict(size=10, color='${colors.colors[1]}')
))

fig.update_layout(
    title={
        'text': '${dataset.name}',
        'x': 0.5,
        'xanchor': 'center',
        'font': {'size': 18, 'family': 'Arial, sans-serif'}
    },
    xaxis_title='Categories',
    yaxis_title='Values',
    width=${size.width},
    height=${size.height},
    hovermode='closest',
    template='${theme === 'dark' ? 'plotly_dark' : 'plotly_white'}'
)

fig.show()
# To save: fig.write_html("visualization.html")`;
      break;

    default:
      code += `# Basic visualization
plt.figure(figsize=figure_size)
plt.plot(rows, cols)
plt.title('${dataset.name}')
plt.savefig('visualization.png')
plt.show()`;
  }

  return code;
};

// Mock generated visualization preview (base64 image)
export const mockVisualizationPreview = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";