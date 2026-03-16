import { useEffect, useState } from "react";
import type { Task } from "../types/Task";
import { getTasks, completeTask, updateNotes } from "../services/api";
import TaskList from "../components/TaskList";
import ProgressBar from "../components/ProgressBar";

function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    getTasks().then(setTasks);
  }, []);

  const handleComplete = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    const nextCompleted = !task?.completed;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: nextCompleted } : t,
      ),
    );

    if (nextCompleted) {
      await completeTask(id);
    }
  };

  const handleNotes = async (id: number, notes: string) => {
    await updateNotes(id, notes);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, notes } : t)),
    );
  };

  const completed = tasks.filter((t) => t.completed).length;

  return (
    <main className="app-shell">
      <header className="dashboard-header">
        <p className="dashboard-eyebrow">Interview prep tracker</p>
        <h1>AI Backend Interview Prep</h1>
        <p className="dashboard-subtitle">
          Stay on top of your preparation with a clear overview of what&apos;s
          done and what&apos;s next.
        </p>
      </header>

      <section className="dashboard-content">
        <ProgressBar completed={completed} total={tasks.length} />
        <TaskList tasks={tasks} onComplete={handleComplete} onNotes={handleNotes} />
      </section>
    </main>
  );
}

export default Dashboard;

