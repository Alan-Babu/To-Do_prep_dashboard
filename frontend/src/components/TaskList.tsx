import { useMemo, useState } from "react";
import type { Task } from "../types/Task";
import TaskCard from "./TaskCard";

interface Props {
  readonly tasks: Task[];
  readonly onComplete: (id: number) => void;
  readonly onNotes: (id: number, notes: string) => void;
}

type CompletionFilter = "all" | "completed" | "open";
type PageSize = 5 | 10 | 20 | 50 | "all";

const normalizeDay = (day: string) => {
  return day?.trim() || "Unscheduled";
};

const normalizeDateKey = (date: string) => {
  return date?.trim() || "Unscheduled";
};

const parseDateTs = (value: string) => {
  const d = new Date(value);
  const ts = d.getTime();
  return Number.isNaN(ts) ? null : ts;
};

const formatDateKeyFromTs = (ts: number) => {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function sortTasks(tasks: Task[]) {
  // Order by (weekStart, weekday(Mon..Sun), date, time, topic).
  return [...tasks].sort((a, b) => {
    const da = parseDateTs(a.date ?? "");
    const db = parseDateTs(b.date ?? "");

    // If either date is invalid, fall back to string comparisons.
    if (da === null || db === null) {
      const dateCmp = (a.date ?? "").localeCompare(b.date ?? "");
      if (dateCmp !== 0) return dateCmp;
      const timeCmp = (a.timeBlock ?? "").localeCompare(b.timeBlock ?? "");
      if (timeCmp !== 0) return timeCmp;
      return (a.topic ?? "").localeCompare(b.topic ?? "");
    }

    const dateA = new Date(da);
    const dateB = new Date(db);

    // JS: getDay() => 0(Sun) .. 6(Sat). Convert to offset from Monday.
    // Monday => 0, Tuesday => 1, ..., Sunday => 6.
    const weekdayIndexA = (dateA.getDay() + 6) % 7;
    const weekdayIndexB = (dateB.getDay() + 6) % 7;

    const weekStartOffsetDaysA = weekdayIndexA; // Monday is start
    const weekStartOffsetDaysB = weekdayIndexB;

    const weekStartA = da - weekStartOffsetDaysA * 86400000;
    const weekStartB = db - weekStartOffsetDaysB * 86400000;

    if (weekStartA !== weekStartB) return weekStartA - weekStartB;
    if (weekdayIndexA !== weekdayIndexB) return weekdayIndexA - weekdayIndexB;
    if (da !== db) return da - db;

    const timeCmp = (a.timeBlock ?? "").localeCompare(b.timeBlock ?? "");
    if (timeCmp !== 0) return timeCmp;

    return (a.topic ?? "").localeCompare(b.topic ?? "");
  });
}

function TaskList({ tasks, onComplete, onNotes }: Props) {
  const [query, setQuery] = useState("");
  const [completion, setCompletion] = useState<CompletionFilter>("all");
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [page, setPage] = useState(1);

  const sortedTasks = useMemo(() => sortTasks(tasks), [tasks]);

  const uniqueDays = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const task of sortedTasks) {
      const day = normalizeDay(task.day);
      if (seen.has(day)) continue;
      seen.add(day);
      out.push(day);
    }
    return out;
  }, [sortedTasks]);

  const effectiveSelectedDay = useMemo(() => {
    if (selectedDay === "all") return "all";
    return uniqueDays.includes(selectedDay) ? selectedDay : "all";
  }, [selectedDay, uniqueDays]);

  const matchingTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedTasks.filter((task) => {
      let matchesCompletion = true;
      if (completion === "completed") matchesCompletion = task.completed;
      else if (completion === "open") matchesCompletion = !task.completed;

      const matchesDay =
        effectiveSelectedDay === "all"
          ? true
          : normalizeDay(task.day) === effectiveSelectedDay;

      if (!matchesCompletion || !matchesDay) return false;
      if (!q) return true;

      const haystack = `${task.topic} ${task.focusArea} ${normalizeDay(
        task.day,
      )} ${task.date} ${task.timeBlock} ${task.learningResource ?? ""} ${task.practiseResource ?? ""}`.toLowerCase();

      return haystack.includes(q);
    });
  }, [sortedTasks, query, completion, effectiveSelectedDay]);

  const matchingCount = matchingTasks.length;

  const pagination = useMemo(() => {
    if (matchingCount === 0) {
      return {
        totalPages: 1,
        currentPage: 1,
        visibleTasks: [] as Task[],
        rangeStart: 0,
        rangeEnd: 0,
      };
    }

    if (pageSize === "all") {
      return {
        totalPages: 1,
        currentPage: 1,
        visibleTasks: matchingTasks,
        rangeStart: 1,
        rangeEnd: matchingCount,
      };
    }

    const weekKeyForTask = (task: Task) => {
      const ts = parseDateTs(task.date ?? "");
      if (ts === null) return "Unscheduled";

      // Monday is start: offset from Monday (Mon=0..Sun=6)
      const dateObj = new Date(ts);
      const weekdayIndex = (dateObj.getDay() + 6) % 7;
      const weekStartTs = ts - weekdayIndex * 86400000;
      return formatDateKeyFromTs(weekStartTs);
    };

    type WeekBucket = {
      weekKey: string;
      tasks: Task[];
    };

    // Weeks are derived from the already-sorted matchingTasks so order is stable.
    const weeks: WeekBucket[] = [];
    const weekIndexByKey = new Map<string, number>();

    for (const task of matchingTasks) {
      const key = weekKeyForTask(task);
      const existingIndex = weekIndexByKey.get(key);
      if (existingIndex === undefined) {
        weekIndexByKey.set(key, weeks.length);
        weeks.push({ weekKey: key, tasks: [task] });
      } else {
        weeks[existingIndex].tasks.push(task);
      }
    }

    // Create pages but never split a week across pages.
    const pages: WeekBucket[][] = [];
    let currentPageWeeks: WeekBucket[] = [];
    let currentTaskCount = 0;

    for (const week of weeks) {
      if (currentPageWeeks.length === 0) {
        currentPageWeeks = [week];
        currentTaskCount = week.tasks.length;
        continue;
      }

      if (currentTaskCount + week.tasks.length <= pageSize) {
        currentPageWeeks.push(week);
        currentTaskCount += week.tasks.length;
      } else {
        pages.push(currentPageWeeks);
        currentPageWeeks = [week];
        currentTaskCount = week.tasks.length;
      }
    }

    if (currentPageWeeks.length > 0) pages.push(currentPageWeeks);

    const totalPages = Math.max(1, pages.length);
    const currentPage = Math.min(Math.max(1, page), totalPages);

    const visibleWeeks = pages[currentPage - 1] ?? [];
    const visibleTasks = visibleWeeks.flatMap((w) => w.tasks);

    const prevWeeks = pages.slice(0, currentPage - 1);
    const prevTasksCount = prevWeeks.reduce(
      (sum, weekArr) =>
        sum + weekArr.reduce((weekSum, w) => weekSum + w.tasks.length, 0),
      0,
    );

    const rangeStart = prevTasksCount + 1;
    const rangeEnd = prevTasksCount + visibleTasks.length;

    return {
      totalPages,
      currentPage,
      visibleTasks,
      rangeStart,
      rangeEnd,
    };
  }, [matchingCount, matchingTasks, page, pageSize]);

  const pageTasks = pagination.visibleTasks;
  const totalPages = pagination.totalPages;
  const currentPage = pagination.currentPage;
  const rangeStart = pagination.rangeStart;
  const rangeEnd = pagination.rangeEnd;

  const grouped = useMemo(() => {
    return pageTasks.reduce(
      (
        acc: Record<
          string,
          {
            label: string;
            date: string;
            tasks: Task[];
          }
        >,
        task,
      ) => {
        const dateKey = normalizeDateKey(task.date);
        if (!acc[dateKey]) {
          acc[dateKey] = {
            label: normalizeDay(task.day),
            date: dateKey,
            tasks: [],
          };
        }
        acc[dateKey].tasks.push(task);
        return acc;
      },
      {} as Record<
        string,
        {
          label: string;
          date: string;
          tasks: Task[];
        }
      >,
    );
  }, [pageTasks]);

  const clearFilters = () => {
    setQuery("");
    setCompletion("all");
    setSelectedDay("all");
    setPageSize(10);
    setPage(1);
  };

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => p + 1);

  const parsePageSize = (value: string): PageSize => {
    if (value === "all") return "all";
    const num = Number(value);
    return num as PageSize;
  };

  const canGoPrev = pageSize !== "all" && currentPage > 1;
  const canGoNext = pageSize !== "all" && currentPage < totalPages;

  return (
    <>
      <section className="task-list-toolbar" aria-label="Task filters and pagination">
        <div className="task-list-filters">
          <label className="field">
            <span className="field-label">Search</span>
            <input
              className="field-input"
              type="text"
              placeholder="Search topic, focus, day…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              aria-label="Search tasks"
            />
          </label>

          <label className="field">
            <span className="field-label">Status</span>
            <select
              className="field-select"
              value={completion}
              onChange={(e) => {
                setCompletion(e.target.value as CompletionFilter);
                setPage(1);
              }}
              aria-label="Completion status filter"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="open">Not completed</option>
            </select>
          </label>

          <label className="field">
            <span className="field-label">Day</span>
            <select
              className="field-select"
              value={effectiveSelectedDay}
              onChange={(e) => {
                setSelectedDay(e.target.value);
                setPage(1);
              }}
              aria-label="Day filter"
            >
              <option value="all">All days</option>
              {uniqueDays.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="task-list-page-size">
          <label className="field">
            <span className="field-label">Page size</span>
            <select
              className="field-select"
              value={pageSize}
              onChange={(e) => {
                setPageSize(parsePageSize(e.target.value));
                setPage(1);
              }}
              aria-label="Page size"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="all">All</option>
            </select>
          </label>
        </div>
      </section>

      <div className="task-list-meta" aria-live="polite">
        {matchingCount === 0 ? (
          <p>No matching tasks.</p>
        ) : (
          <p>
            Showing <strong>{rangeStart}</strong>–<strong>{rangeEnd}</strong> of{" "}
            <strong>{matchingCount}</strong> tasks
          </p>
        )}
      </div>

      {matchingCount === 0 ? (
        <section className="task-empty">
          <p className="task-empty-title">No tasks match your filters.</p>
          <button type="button" className="task-list-button" onClick={clearFilters}>
            Clear filters
          </button>
        </section>
      ) : (
        <>
          <nav className="task-list-nav" aria-label="Pagination">
            <button
              type="button"
              className="task-list-button"
              disabled={!canGoPrev}
              onClick={goPrev}
            >
              Previous
            </button>
            <p className="task-list-page-info">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </p>
            <button
              type="button"
              className="task-list-button"
              disabled={!canGoNext}
              onClick={goNext}
            >
              Next
            </button>
          </nav>

          <div className="task-list">
            {Object.entries(grouped).map(([dateKey, group]) => (
              <div key={dateKey} className="task-list-day">
                <h2>
                  {group.label} <span className="task-list-day-date">• {group.date}</span>
                </h2>
                {group.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={onComplete}
                    onNotes={onNotes}
                  />
                ))}
              </div>
            ))}
          </div>

          <nav className="task-list-nav task-list-nav--bottom" aria-label="Pagination">
            <button
              type="button"
              className="task-list-button"
              disabled={!canGoPrev}
              onClick={goPrev}
            >
              Previous
            </button>
            <p className="task-list-page-info">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </p>
            <button
              type="button"
              className="task-list-button"
              disabled={!canGoNext}
              onClick={goNext}
            >
              Next
            </button>
          </nav>
        </>
      )}
    </>
  );
}

export default TaskList;