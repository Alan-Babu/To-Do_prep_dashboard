import pandas as pd
import os
import dotenv
import logging

dotenv.load_dotenv()

Filepath = os.getenv("FILEPATH")

class ExcelLoader:
    def __init__(self):
        self.df = pd.read_excel(Filepath)
        
    def load_tasks_from_excel(self):
        tasks =[]
        for index, row in self.df.iterrows():
            tasks.append({
                "id": index+1,
                "date":str(row.get("Date","")),
                "day":row.get("Day",""),
                "timeBlock":row.get("Time Block",""),
                "focusArea":row.get("Focus Area",""),
                "topic":row.get("Topic",""),
                "learningResource":row.get("Learning Resource",""),
                "practiseResource":row.get("Practice Resource",""),
                "completed":False,
                "notes":""
            })
        return tasks
        
