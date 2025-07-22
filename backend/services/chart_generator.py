import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px
import plotly.io as pio
import pandas as pd
import numpy as np
import io
import base64
from PIL import Image
import time
import logging
from typing import Dict, Any, Optional, Tuple, List, Union
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class ChartGenerator:
    def __init__(self):
        # Set matplotlib style
        plt.style.use('default')
        
        # Configure seaborn
        sns.set_palette("husl")
        
        # Configure plotly
        pio.kaleido.scope.default_format = "png"
        pio.kaleido.scope.default_engine = "kaleido"

    def generate_chart(self, dataset: Dict[str, Any], chart_type_id: str, 
                      customization: Optional[Dict[str, Any]] = None) -> Tuple[Optional[str], str]:
        """
        Generate a chart based on dataset, chart type, and customization options.
        Returns (base64_image, python_code)
        """
        try:
            start_time = time.time()
            
            # Extract data
            rows = dataset.get('rows', [])
            cols = dataset.get('cols', [])
            values = dataset.get('values', [])
            dataset_name = dataset.get('name', 'Dataset')
            
            # Get customization options
            if customization is None:
                customization = self._get_default_customization()
            
            colors = customization.get('colors', {})
            theme = customization.get('theme', {})
            size = customization.get('size', {})
            
            # Set figure size
            width = size.get('width', 1200) / 100
            height = size.get('height', 800) / 100
            
            # Generate chart based on type
            chart_image, python_code = self._generate_chart_by_type(
                chart_type_id, rows, cols, values, dataset_name, 
                colors, theme, (width, height)
            )
            
            execution_time = time.time() - start_time
            logger.info(f"Chart generated successfully in {execution_time:.2f}s")
            
            return chart_image, python_code
            
        except Exception as e:
            logger.error(f"Error generating chart: {str(e)}")
            return None, f"# Error generating chart: {str(e)}"

    def _generate_chart_by_type(self, chart_type_id: str, rows: List, cols: List, 
                               values: List, dataset_name: str, colors: Dict, 
                               theme: Dict, figsize: Tuple[float, float]) -> Tuple[str, str]:
        """Generate chart based on chart type ID"""
        
        chart_functions = {
            'matplotlib_line': self._generate_matplotlib_line,
            'matplotlib_bar': self._generate_matplotlib_bar,
            'matplotlib_scatter': self._generate_matplotlib_scatter,
            'seaborn_heatmap': self._generate_seaborn_heatmap,
            'seaborn_violin': self._generate_seaborn_violin,
            'plotly_interactive': self._generate_plotly_interactive
        }
        
        if chart_type_id not in chart_functions:
            raise ValueError(f"Unsupported chart type: {chart_type_id}")
        
        return chart_functions[chart_type_id](
            rows, cols, values, dataset_name, colors, theme, figsize
        )

    def _generate_matplotlib_line(self, rows, cols, values, dataset_name, 
                                 colors, theme, figsize) -> Tuple[str, str]:
        """Generate matplotlib line chart"""
        plt.figure(figsize=figsize)
        
        # Apply theme
        if theme.get('value') == 'dark':
            plt.style.use('dark_background')
        
        # Create line chart
        color = colors.get('colors', ['#1f77b4'])[0]
        plt.plot(rows, cols, marker='o', linewidth=3, markersize=8, 
                color=color, markerfacecolor='white', markeredgecolor=color, markeredgewidth=2)
        
        plt.title(dataset_name, fontsize=16, fontweight='bold', pad=20)
        plt.xlabel('Categories', fontsize=12)
        plt.ylabel('Values', fontsize=12)
        plt.grid(True, alpha=0.3, linestyle='--')
        plt.xticks(rotation=45 if len(rows) > 4 else 0)
        plt.tight_layout()
        
        # Convert to base64
        img_base64 = self._plt_to_base64()
        
        # Generate Python code
        python_code = f"""import matplotlib.pyplot as plt
import numpy as np

# Data setup
rows = {rows}
cols = {cols}

# Create line chart
plt.figure(figsize={figsize})
plt.plot(rows, cols, marker='o', linewidth=3, markersize=8, 
         color='{color}', markerfacecolor='white', markeredgecolor='{color}', markeredgewidth=2)
plt.title('{dataset_name}', fontsize=16, fontweight='bold', pad=20)
plt.xlabel('Categories', fontsize=12)
plt.ylabel('Values', fontsize=12)
plt.grid(True, alpha=0.3, linestyle='--')
plt.xticks(rotation=45 if len(rows) > 4 else 0)
plt.tight_layout()
plt.savefig('visualization.png', dpi=300, bbox_inches='tight')
plt.show()"""
        
        return img_base64, python_code

    def _generate_matplotlib_bar(self, rows, cols, values, dataset_name, 
                                colors, theme, figsize) -> Tuple[str, str]:
        """Generate matplotlib bar chart"""
        plt.figure(figsize=figsize)
        
        if theme.get('value') == 'dark':
            plt.style.use('dark_background')
        
        color = colors.get('colors', ['#1f77b4'])[0]
        bars = plt.bar(rows, cols, color=color, alpha=0.8, edgecolor='white', linewidth=1.5)
        
        # Add value labels on bars
        for bar, value in zip(bars, cols):
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2., height + max(cols)*0.01,
                    f'{value:,}', ha='center', va='bottom', fontweight='bold')
        
        plt.title(dataset_name, fontsize=16, fontweight='bold', pad=20)
        plt.xlabel('Categories', fontsize=12)
        plt.ylabel('Values', fontsize=12)
        plt.xticks(rotation=45 if len(rows) > 4 else 0)
        plt.tight_layout()
        
        img_base64 = self._plt_to_base64()
        
        python_code = f"""import matplotlib.pyplot as plt

# Data setup
rows = {rows}
cols = {cols}

# Create bar chart
plt.figure(figsize={figsize})
bars = plt.bar(rows, cols, color='{color}', alpha=0.8, edgecolor='white', linewidth=1.5)

# Add value labels on bars
for bar, value in zip(bars, cols):
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height + max(cols)*0.01,
            f'{{value:,}}', ha='center', va='bottom', fontweight='bold')

plt.title('{dataset_name}', fontsize=16, fontweight='bold', pad=20)
plt.xlabel('Categories', fontsize=12)
plt.ylabel('Values', fontsize=12)
plt.xticks(rotation=45 if len(rows) > 4 else 0)
plt.tight_layout()
plt.savefig('visualization.png', dpi=300, bbox_inches='tight')
plt.show()"""
        
        return img_base64, python_code

    def _generate_matplotlib_scatter(self, rows, cols, values, dataset_name, 
                                   colors, theme, figsize) -> Tuple[str, str]:
        """Generate matplotlib scatter plot"""
        plt.figure(figsize=figsize)
        
        if theme.get('value') == 'dark':
            plt.style.use('dark_background')
        
        # Convert rows to numeric if they're strings
        if isinstance(rows[0], str):
            x_values = range(len(rows))
            x_labels = rows
        else:
            x_values = rows
            x_labels = None
        
        color = colors.get('colors', ['#1f77b4'])[0]
        scatter_sizes = values if values else [100] * len(cols)
        
        plt.scatter(x_values, cols, s=scatter_sizes, c=color, alpha=0.7, 
                   edgecolors='white', linewidth=2)
        
        if x_labels:
            plt.xticks(x_values, x_labels, rotation=45 if len(rows) > 4 else 0)
        
        plt.title(dataset_name, fontsize=16, fontweight='bold', pad=20)
        plt.xlabel('Categories', fontsize=12)
        plt.ylabel('Values', fontsize=12)
        plt.grid(True, alpha=0.3, linestyle='--')
        plt.tight_layout()
        
        img_base64 = self._plt_to_base64()
        
        python_code = f"""import matplotlib.pyplot as plt

# Data setup
rows = {rows}
cols = {cols}
values = {values if values else [100] * len(cols)}

# Convert rows to numeric if needed
x_values = range(len(rows)) if isinstance(rows[0], str) else rows

# Create scatter plot
plt.figure(figsize={figsize})
plt.scatter(x_values, cols, s=values, c='{color}', alpha=0.7, 
           edgecolors='white', linewidth=2)

if isinstance(rows[0], str):
    plt.xticks(x_values, rows, rotation=45 if len(rows) > 4 else 0)

plt.title('{dataset_name}', fontsize=16, fontweight='bold', pad=20)
plt.xlabel('Categories', fontsize=12)
plt.ylabel('Values', fontsize=12)
plt.grid(True, alpha=0.3, linestyle='--')
plt.tight_layout()
plt.savefig('visualization.png', dpi=300, bbox_inches='tight')
plt.show()"""
        
        return img_base64, python_code

    def _generate_seaborn_heatmap(self, rows, cols, values, dataset_name, 
                                 colors, theme, figsize) -> Tuple[str, str]:
        """Generate seaborn heatmap"""
        plt.figure(figsize=figsize)
        
        if theme.get('value') == 'dark':
            plt.style.use('dark_background')
        
        # Create data matrix for heatmap
        if len(cols) == len(rows):
            # Create a correlation-like matrix
            data_matrix = np.array(cols).reshape(-1, 1)
        else:
            # Reshape data to create a proper heatmap
            data_matrix = np.array(cols).reshape(1, -1)
        
        colormap = colors.get('value', 'viridis')
        
        sns.heatmap(data_matrix, annot=True, cmap=colormap, 
                   xticklabels=rows if data_matrix.shape[1] == len(rows) else False,
                   yticklabels=rows if data_matrix.shape[0] == len(rows) else False,
                   square=True, linewidths=0.5, cbar_kws={"shrink": .8})
        
        plt.title(dataset_name, fontsize=16, fontweight='bold', pad=20)
        plt.tight_layout()
        
        img_base64 = self._plt_to_base64()
        
        python_code = f"""import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Data setup
rows = {rows}
cols = {cols}

# Create data matrix for heatmap
data_matrix = np.array(cols).reshape(-1, 1) if len(cols) == len(rows) else np.array(cols).reshape(1, -1)

# Create heatmap
plt.figure(figsize={figsize})
sns.heatmap(data_matrix, annot=True, cmap='{colormap}', 
           xticklabels=rows if data_matrix.shape[1] == len(rows) else False,
           yticklabels=rows if data_matrix.shape[0] == len(rows) else False,
           square=True, linewidths=0.5, cbar_kws={{"shrink": .8}})

plt.title('{dataset_name}', fontsize=16, fontweight='bold', pad=20)
plt.tight_layout()
plt.savefig('visualization.png', dpi=300, bbox_inches='tight')
plt.show()"""
        
        return img_base64, python_code

    def _generate_seaborn_violin(self, rows, cols, values, dataset_name, 
                                colors, theme, figsize) -> Tuple[str, str]:
        """Generate seaborn violin plot"""
        plt.figure(figsize=figsize)
        
        if theme.get('value') == 'dark':
            plt.style.use('dark_background')
        
        # Create DataFrame for violin plot
        df = pd.DataFrame({'Category': rows, 'Values': cols})
        
        palette = colors.get('value', 'Set1')
        sns.violinplot(data=df, x='Category', y='Values', palette=palette)
        
        plt.title(dataset_name, fontsize=16, fontweight='bold', pad=20)
        plt.xticks(rotation=45 if len(rows) > 4 else 0)
        plt.tight_layout()
        
        img_base64 = self._plt_to_base64()
        
        python_code = f"""import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

# Data setup
rows = {rows}
cols = {cols}

# Create DataFrame
df = pd.DataFrame({{'Category': rows, 'Values': cols}})

# Create violin plot
plt.figure(figsize={figsize})
sns.violinplot(data=df, x='Category', y='Values', palette='{palette}')

plt.title('{dataset_name}', fontsize=16, fontweight='bold', pad=20)
plt.xticks(rotation=45 if len(rows) > 4 else 0)
plt.tight_layout()
plt.savefig('visualization.png', dpi=300, bbox_inches='tight')
plt.show()"""
        
        return img_base64, python_code

    def _generate_plotly_interactive(self, rows, cols, values, dataset_name, 
                                   colors, theme, figsize) -> Tuple[str, str]:
        """Generate plotly interactive chart"""
        color_palette = colors.get('colors', ['#1f77b4', '#ff7f0e', '#2ca02c'])
        
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=rows,
            y=cols,
            mode='lines+markers',
            name=dataset_name,
            line=dict(width=3, color=color_palette[0]),
            marker=dict(size=12, color=color_palette[1], 
                       line=dict(width=2, color='white'))
        ))
        
        template = 'plotly_dark' if theme.get('value') == 'dark' else 'plotly_white'
        
        fig.update_layout(
            title={
                'text': dataset_name,
                'x': 0.5,
                'xanchor': 'center',
                'font': {'size': 18, 'family': 'Arial, sans-serif'}
            },
            xaxis_title='Categories',
            yaxis_title='Values',
            width=int(figsize[0] * 100),
            height=int(figsize[1] * 100),
            hovermode='closest',
            template=template
        )
        
        # Convert to base64 image
        img_bytes = pio.to_image(fig, format="png", engine="kaleido")
        img_base64 = base64.b64encode(img_bytes).decode()
        
        python_code = f"""import plotly.graph_objects as go

# Data setup
rows = {rows}
cols = {cols}

# Create interactive chart
fig = go.Figure()
fig.add_trace(go.Scatter(
    x=rows,
    y=cols,
    mode='lines+markers',
    name='{dataset_name}',
    line=dict(width=3, color='{color_palette[0]}'),
    marker=dict(size=12, color='{color_palette[1]}', 
               line=dict(width=2, color='white'))
))

fig.update_layout(
    title={{
        'text': '{dataset_name}',
        'x': 0.5,
        'xanchor': 'center',
        'font': {{'size': 18, 'family': 'Arial, sans-serif'}}
    }},
    xaxis_title='Categories',
    yaxis_title='Values',
    width={int(figsize[0] * 100)},
    height={int(figsize[1] * 100)},
    hovermode='closest',
    template='{template}'
)

fig.show()
# To save: fig.write_html("visualization.html")
# To save as image: fig.write_image("visualization.png")"""
        
        return f"data:image/png;base64,{img_base64}", python_code

    def _plt_to_base64(self) -> str:
        """Convert matplotlib plot to base64 string"""
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight', 
                   facecolor='white', edgecolor='none')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()  # Important: close the figure to free memory
        return f"data:image/png;base64,{image_base64}"

    def _get_default_customization(self) -> Dict[str, Any]:
        """Get default customization options"""
        return {
            'colors': {
                'name': 'Default',
                'value': 'default',
                'colors': ['#1f77b4', '#ff7f0e', '#2ca02c']
            },
            'theme': {
                'name': 'Clean',
                'value': 'clean'
            },
            'size': {
                'width': 1200,
                'height': 800
            }
        }

    def execute_python_code(self, code: str, dataset: Optional[Dict[str, Any]] = None) -> Tuple[bool, str, Optional[str]]:
        """
        Execute Python code safely and return results.
        Returns (success, output/error, chart_image_base64)
        """
        try:
            # Import required modules
            exec_globals = {
                'plt': plt,
                'sns': sns,
                'pd': pd,
                'np': np,
                'go': go,
                'px': px
            }
            
            if dataset:
                exec_globals.update({
                    'rows': dataset.get('rows', []),
                    'cols': dataset.get('cols', []),
                    'values': dataset.get('values', [])
                })
            
            # Capture stdout
            from io import StringIO
            import sys
            old_stdout = sys.stdout
            sys.stdout = captured_output = StringIO()
            
            # Execute code
            exec(code, exec_globals)
            
            # Get output
            output = captured_output.getvalue()
            sys.stdout = old_stdout
            
            # Try to get the current figure as base64
            chart_image = None
            if plt.get_fignums():  # If there are open figures
                chart_image = self._plt_to_base64()
            
            return True, output, chart_image
            
        except Exception as e:
            return False, str(e), None