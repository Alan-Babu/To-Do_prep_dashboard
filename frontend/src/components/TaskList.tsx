import type { Task } from "../types/Task";
import TaskCard from "./TaskCard";

interface Props{
    tasks: Task[]
    onComplete:(id:number)=> void
    onNotes:(id:number, notes: string) => void
}

function TaskList({tasks, onComplete, onNotes}: Props){
    return(
        <>
            {tasks.map(task=>(
                <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={onComplete}
                    onNotes={onNotes}
                />
            ))}
        </>
    )
}

export default TaskList