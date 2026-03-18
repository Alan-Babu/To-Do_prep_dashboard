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
      {/* HEADER */}
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
          <p className="task-card-day">
            {task.day} • {task.date}
          </p>
          <p className="task-card-time">{task.timeBlock}</p>
          <p className="task-card-focus">{task.focusArea}</p>
          <p className="task-card-topic">{task.topic}</p>
        </div>
      </div>

      {/*Resource*/}
      <div className="task-card-resources">
          {task.learningResource && (<a href={task.learningResource} target="_blank" rel="noopener noreferrer">📘 Learning Resource</a>)} 
          {task.practiseResource && (<a href={task.practiseResource} target="_blank" rel="noopener noreferrer">📝 Practice Resource</a>)}
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