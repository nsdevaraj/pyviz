from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import uuid

class DatasetInput(BaseModel):
    name: str = "Untitled Dataset"
    rows: List[Union[str, int, float]]
    cols: List[Union[int, float]]
    values: Optional[List[Union[int, float]]] = None
    description: Optional[str] = None

class ChartType(BaseModel):
    id: str
    name: str
    library: str  # matplotlib, seaborn, plotly
    category: str  # basic, statistical, interactive

class CustomizationOptions(BaseModel):
    colors: Dict[str, Any]
    theme: Dict[str, Any]
    size: Dict[str, Any]
    custom_width: Optional[int] = None
    custom_height: Optional[int] = None

class VisualizationRequest(BaseModel):
    dataset: DatasetInput
    chart_type: ChartType
    customization: CustomizationOptions

class ChartGenerationRequest(BaseModel):
    dataset: DatasetInput
    chart_type_id: str
    customization: Optional[CustomizationOptions] = None

class ChartGenerationResponse(BaseModel):
    success: bool
    chart_image: Optional[str] = None  # base64 encoded image
    python_code: Optional[str] = None
    error_message: Optional[str] = None
    execution_time: Optional[float] = None

class PythonExecutionRequest(BaseModel):
    code: str
    dataset: Optional[DatasetInput] = None

class PythonExecutionResponse(BaseModel):
    success: bool
    output: Optional[str] = None
    error_message: Optional[str] = None
    chart_image: Optional[str] = None  # base64 encoded image
    execution_time: Optional[float] = None

class VisualizationMetadata(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    dataset: DatasetInput
    chart_type: ChartType
    customization: CustomizationOptions
    python_code: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    chart_image: Optional[str] = None

class SaveVisualizationRequest(BaseModel):
    name: str
    dataset: DatasetInput
    chart_type: ChartType
    customization: CustomizationOptions
    python_code: str
    chart_image: Optional[str] = None

class SaveVisualizationResponse(BaseModel):
    success: bool
    visualization_id: Optional[str] = None
    error_message: Optional[str] = None