from fastapi import APIRouter
from app.services.task_service import TaskService

router = APIRouter()
taskservice = TaskService()

@router.get("/tasks")
def fetch_tasks():
    return taskservice.get_tasks()

@router.post("/tasks/{id}/complete")
def complete_task(id: int):
    return taskservice.complete_task(id)

@router.post("/tasks/{id}/notes")
def update_notes(id: int, notes: str):
    return taskservice.update_notes(id, notes)