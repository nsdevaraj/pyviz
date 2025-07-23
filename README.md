# Python Visualization Generator

An interactive business intelligence platform that allows users to:
- Input data through a user-friendly interface
- Generate various types of visualizations (charts, graphs)
- View and customize the generated visualizations
- Get corresponding Python code for the visualizations

## Features

- **Data Input**: Upload or manually enter datasets
- **Chart Generation**: Create visualizations using matplotlib, seaborn, and plotly
- **Code Generation**: Get Python code for each visualization
- **Live Preview**: See changes in real-time
- **Save Visualizations**: Store generated charts for later use
- **Python Execution**: Execute custom Python code with the dataset

## Technology Stack

### Backend
- Python 3.10+
- FastAPI
- MongoDB
- Pydantic
- Matplotlib/Seaborn/Plotly for visualization
- Motor (async MongoDB driver)

### Frontend
- React 19
- Tailwind CSS
- Radix UI components
- React Hook Form
- Axios for API calls

## Installation

### Backend Setup

1. Clone the repository
2. Navigate to backend directory:
   ```bash
   cd backend
   ```
3. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Create a `.env` file with your MongoDB connection string:
   ```
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=pyviz
   ```
6. Run the backend server:
   ```bash
   uvicorn server:app --reload
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Start the development server:
   ```bash
   yarn start
   ```

## Usage

1. Access the application at `http://localhost:3000`
2. Input your data in the Data Input panel
3. Select chart type and customize in the Chart Builder panel
4. View the generated visualization in the Preview panel
5. Copy the generated Python code for your visualization

## API Endpoints

The backend provides the following endpoints:

- `GET /api/` - Basic API info
- `GET /api/health` - Health check
- `POST /api/status` - Create status check
- `GET /api/status` - Get status checks
- `POST /api/visualization/generate` - Generate charts
- `POST /api/visualization/execute` - Execute Python code
- `POST /api/visualization/save` - Save visualizations

## Project Structure

```
pyviz/
├── backend/               # Backend code
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── server.py          # Main FastAPI app
│   └── requirements.txt   # Python dependencies
├── frontend/              # Frontend code
│   ├── public/            # Static assets
│   ├── src/               # React components
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utility functions
│   └── package.json       # Frontend dependencies
└── tests/                 # Test cases
```

## Development

To run the full stack in development mode:

1. Start the backend:
   ```bash
   cd backend && uvicorn server:app --reload
   ```
2. In another terminal, start the frontend:
   ```bash
   cd frontend && yarn start
   ```

The application will be available at `http://localhost:3000` with hot-reloading enabled.
