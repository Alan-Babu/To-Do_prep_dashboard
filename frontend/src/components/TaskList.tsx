import type { Task } from "../types/Task";
import TaskCard from "./TaskCard";

interface Props{
    tasks: Task[]
    onComplete:(id:number)=> void
    onNotes:(id:number, notes: string) => void
}

function TaskList({tasks, onComplete, onNotes}: Props){
    const grouped = tasks.reduce((acc,task)=>{
        if(!acc[task.day]) acc[task.day] = []
        acc[task.day].push(task)
        return acc
    },{} as Record<string, Task[]>)
    return(
        <>
            {Object.entries(grouped).map(([day,tasks])=>
               <div key={day}>
                    <h2>{day}</h2>
                    {tasks.map(task=>(
                        <TaskCard
                            key={task.id}
                            task={task}
                            onComplete={onComplete}
                            onNotes={onNotes}
                        />
                    ))}
                </div>
         )}
        </>
    )
}

export default TaskList