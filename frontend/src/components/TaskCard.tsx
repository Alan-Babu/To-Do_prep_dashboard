import { type Task } from "../types/Task";

interface Props {
  readonly task: Task;
  readonly onComplete: (id: number) => void;
  readonly onNotes: (id: number, notes: string) => void;
}

function TaskCard({ task, onComplete, onNotes }: Props) {
  return (
    <article
      className={`task-card ${task.completed ? "task-card--completed" : ""}`}
    >
      <div className="task-card-header">
        <label className="task-checkbox">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onComplete(task.id)}
            aria-label={`Mark "${task.topic}" as completed`}
          />
          <span className="task-checkbox-visual" />
        </label>
        <div className="task-card-text">
          <p className="task-card-focus">{task.focusArea}</p>
          <p className="task-card-topic">{task.topic}</p>
        </div>
      </div>

      <textarea
        className="task-notes"
        placeholder="Add notes, links, or key takeaways…"
        value={task.notes ?? ""}
        onChange={(e) => onNotes(task.id, e.target.value)}
      />
    </article>
  );
}

export default TaskCard;