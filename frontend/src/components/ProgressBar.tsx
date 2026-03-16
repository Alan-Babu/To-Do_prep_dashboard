interface Props {
  readonly completed: number;
  readonly total: number;
}

function ProgressBar({ completed, total }: Props) {
  const safeTotal = total || 1;
  const percent = Math.min(100, Math.round((completed / safeTotal) * 100));

  return (
    <section className="progress-card" aria-label="Progress">
      <div className="progress-header">
        <p className="progress-title">Overall progress</p>
        <p className="progress-meta">
          {completed}/{total} completed
        </p>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </section>
  );
}

export default ProgressBar;