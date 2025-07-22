from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from models.visualization import (
    ChartGenerationRequest, ChartGenerationResponse,
    PythonExecutionRequest, PythonExecutionResponse,
    SaveVisualizationRequest, SaveVisualizationResponse,
    VisualizationMetadata
)
from services.chart_generator import ChartGenerator
from motor.motor_asyncio import AsyncIOMotorClient
import os
import time
import logging

logger = logging.getLogger(__name__)

# Get database connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

router = APIRouter(prefix="/api/visualization", tags=["visualization"])

# Initialize chart generator
chart_generator = ChartGenerator()

@router.post("/generate", response_model=ChartGenerationResponse)
async def generate_chart(request: ChartGenerationRequest):
    """Generate a chart based on dataset and chart type"""
    try:
        start_time = time.time()
        
        # Convert request to dict for chart generator
        dataset_dict = request.dataset.dict()
        customization_dict = request.customization.dict() if request.customization else None
        
        # Generate chart
        chart_image, python_code = chart_generator.generate_chart(
            dataset=dataset_dict,
            chart_type_id=request.chart_type_id,
            customization=customization_dict
        )
        
        execution_time = time.time() - start_time
        
        if chart_image is None:
            return ChartGenerationResponse(
                success=False,
                error_message="Failed to generate chart",
                execution_time=execution_time
            )
        
        return ChartGenerationResponse(
            success=True,
            chart_image=chart_image,
            python_code=python_code,
            execution_time=execution_time
        )
        
    except Exception as e:
        logger.error(f"Error in generate_chart: {str(e)}")
        return ChartGenerationResponse(
            success=False,
            error_message=str(e)
        )

@router.post("/execute", response_model=PythonExecutionResponse)
async def execute_python_code(request: PythonExecutionRequest):
    """Execute Python code and return results"""
    try:
        start_time = time.time()
        
        dataset_dict = request.dataset.dict() if request.dataset else None
        
        success, output, chart_image = chart_generator.execute_python_code(
            code=request.code,
            dataset=dataset_dict
        )
        
        execution_time = time.time() - start_time
        
        if success:
            return PythonExecutionResponse(
                success=True,
                output=output,
                chart_image=chart_image,
                execution_time=execution_time
            )
        else:
            return PythonExecutionResponse(
                success=False,
                error_message=output,  # Error message is in output
                execution_time=execution_time
            )
            
    except Exception as e:
        logger.error(f"Error in execute_python_code: {str(e)}")
        return PythonExecutionResponse(
            success=False,
            error_message=str(e)
        )

@router.post("/save", response_model=SaveVisualizationResponse)
async def save_visualization(request: SaveVisualizationRequest):
    """Save a visualization to the database"""
    try:
        # Create visualization metadata
        visualization = VisualizationMetadata(
            name=request.name,
            dataset=request.dataset,
            chart_type=request.chart_type,
            customization=request.customization,
            python_code=request.python_code,
            chart_image=request.chart_image
        )
        
        # Save to database
        result = await db.visualizations.insert_one(visualization.dict())
        
        return SaveVisualizationResponse(
            success=True,
            visualization_id=str(result.inserted_id)
        )
        
    except Exception as e:
        logger.error(f"Error saving visualization: {str(e)}")
        return SaveVisualizationResponse(
            success=False,
            error_message=str(e)
        )

@router.get("/list")
async def list_visualizations():
    """Get list of saved visualizations"""
    try:
        visualizations = await db.visualizations.find(
            {}, {"chart_image": 0}  # Exclude chart_image for performance
        ).to_list(1000)
        
        return {
            "success": True,
            "visualizations": visualizations
        }
        
    except Exception as e:
        logger.error(f"Error listing visualizations: {str(e)}")
        return {
            "success": False,
            "error_message": str(e)
        }

@router.get("/{visualization_id}")
async def get_visualization(visualization_id: str):
    """Get a specific visualization by ID"""
    try:
        from bson import ObjectId
        
        visualization = await db.visualizations.find_one(
            {"_id": ObjectId(visualization_id)}
        )
        
        if not visualization:
            raise HTTPException(status_code=404, detail="Visualization not found")
        
        # Convert ObjectId to string for JSON serialization
        visualization["_id"] = str(visualization["_id"])
        
        return {
            "success": True,
            "visualization": visualization
        }
        
    except Exception as e:
        logger.error(f"Error getting visualization: {str(e)}")
        return {
            "success": False,
            "error_message": str(e)
        }

@router.delete("/{visualization_id}")
async def delete_visualization(visualization_id: str):
    """Delete a specific visualization"""
    try:
        from bson import ObjectId
        
        result = await db.visualizations.delete_one(
            {"_id": ObjectId(visualization_id)}
        )
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Visualization not found")
        
        return {
            "success": True,
            "message": "Visualization deleted successfully"
        }
        
    except Exception as e:
        logger.error(f"Error deleting visualization: {str(e)}")
        return {
            "success": False,
            "error_message": str(e)
        }