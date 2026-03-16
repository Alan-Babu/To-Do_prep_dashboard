import type { Task } from "../types/Task";

let tasks: Task[] = [
    {
    id: 1,
    topic: "Arrays",
    focusArea: "DSA",
    completed: false,
    notes: ""
  },
  {
    id: 2,
    topic: "Generators",
    focusArea: "Python",
    completed: false,
    notes: ""
  }
]

export const getTasks=async(): Promise<Task[]> =>{
    return Promise.resolve(tasks)
}

export const completeTask = async(id: number)=>{
    tasks = tasks.map(t=>
        t.id === id ? {...t, completed: true} : t
    )
}

export const updateNotes = async(id: number, notes: string)=>{
    tasks = tasks.map(t=> t.id === id ? {...t, notes} : t)
}
