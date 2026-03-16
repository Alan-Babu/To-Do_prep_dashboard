from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.task_routes import router as task_router

app = FastAPI(
    title="AI Interview Prep Dashboard API",
    version="1.0.0"
)

# Enable CORS so React frontend can access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register task routes
app.include_router(task_router)


@app.get("/")
def root():
    return {"message": "Backend is running"}