
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Pencil,
  Trash2,
  CalendarDays,
} from "lucide-react";

function SortableTaskCard({
  task,
  onEdit,
  onDelete,
  getPriorityStyle,
  deletingTaskId,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start gap-2">
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab text-gray-400 hover:text-gray-700 active:cursor-grabbing"
          style={{ touchAction: "none" }}
          title="Drag task"
        >
          <GripVertical size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <h5 className="break-words font-semibold text-slate-800">
            {task.title}
          </h5>

          {task.description && (
            <p className="mt-2 break-words text-sm text-gray-600">
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityStyle(
                task.priority
              )}`}
            >
              {task.priority}
            </span>

            {task.dueDate && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <CalendarDays size={13} />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-2 border-t pt-3">
            <button
              onClick={() => onEdit(task)}
              className="flex items-center gap-1 rounded-md bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-100"
            >
              <Pencil size={14} />
              Edit
            </button>

            <button
              onClick={() => onDelete(task)}
              disabled={deletingTaskId === task._id}
              className="flex items-center gap-1 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              <Trash2 size={14} />
              {deletingTaskId === task._id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SortableTaskCard;
