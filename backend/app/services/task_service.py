from app.utils.excel_loader import ExcelLoader

class TaskService:
    def __init__(self):
        self.tasks = ExcelLoader().load_tasks_from_excel()
    
    def get_tasks(self):
        return self.tasks

    def complete_task(self, id):
        for task in self.tasks:
            if task["id"] == id:
                task["completed"] = True
        return True

    def update_notes(self, id, notes):
        for task in self.tasks:
            if task["id"] == id:
                task["notes"] = notes
        return self.tasks