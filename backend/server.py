from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime

# Import visualization routes
from routes.visualization import router as visualization_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Python Visualization Generator API", version="1.0.0")

# Create a router with the /api prefix for basic routes
api_router = APIRouter(prefix="/api")

# Define Models for basic status checks
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Basic API routes
@api_router.get("/")
async def root():
    return {"message": "Python Visualization Generator API", "status": "running"}

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        await db.admin.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
            "services": ["chart_generation", "python_execution", "data_storage"]
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "error": str(e),
            "database": "disconnected"
        }

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include routers
app.include_router(api_router)
app.include_router(visualization_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("Python Visualization Generator API starting up...")
    logger.info("Available endpoints:")
    logger.info("- /api/ - Basic API info")
    logger.info("- /api/health - Health check")
    logger.info("- /api/visualization/generate - Generate charts")
    logger.info("- /api/visualization/execute - Execute Python code")
    logger.info("- /api/visualization/save - Save visualizations")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down...")
    client.close()