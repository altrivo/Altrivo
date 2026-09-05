type Status = "todo" | "in-progress" | "in-review" | "done" | "blocked";

export interface StatusPillProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; bg: string; text: string }> = {
  todo: { label: "To Do", bg: "bg-status-todo-bg", text: "text-status-todo-text" },
  "in-progress": {
    label: "In Progress",
    bg: "bg-status-progress-bg",
    text: "text-status-progress-text",
  },
  "in-review": {
    label: "In Review",
    bg: "bg-status-review-bg",
    text: "text-status-review-text",
  },
  done: { label: "Done", bg: "bg-status-done-bg", text: "text-status-done-text" },
  blocked: {
    label: "Blocked",
    bg: "bg-status-blocked-bg",
    text: "text-status-blocked-text",
  },
};

export function StatusPill({ status, className = "" }: StatusPillProps) {
  const { label, bg, text } = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full text-sm font-medium px-2.5 py-1 ${bg} ${text} ${className}`}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
