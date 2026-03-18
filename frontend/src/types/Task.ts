export interface Task{
    id: number
    topic: string
    focusArea: string
    completed: boolean
    date: string
    day: string
    timeBlock: string
    learningResource: string
    practiseResource: string
    notes?: string
}