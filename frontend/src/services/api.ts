import type { Task } from "../types/Task";

const API_URL = "http://localhost:8000";

export const getTasks=async(): Promise<Task[]> =>{
    const res = await fetch(`${API_URL}/tasks`);
    if(!res.ok){
        throw new Error("Failed to fetch tasks");
    }
    return res.json();
}

export const completeTask = async(id: number)=>{
    const res = await fetch(`${API_URL}/tasks/${id}/complete`, {method: "POST"});
    if(!res.ok){
        throw new Error("Failed to complete task");
    }
    return res.json();
}

export const updateNotes = async(id: number, notes: string)=>{
    const res =await fetch(`${API_URL}/tasks/${id}/notes?notes=${encodeURIComponent(notes)}`,
    {
        method:"POST"
    });
    if(!res.ok){
        throw new Error("Failed to update notes");
    }
    return res.json();
}
