
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Plus, ClipboardList } from "lucide-react";
import SortableTaskCard from "./SortableTaskCard";

function KanbanColumn({
  column,
  tasks,
  tasksLoading,
  onAddTask,
  onEditTask,
  onDeleteTask,
  getPriorityStyle,
  deletingTaskId,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-80 min-w-80 rounded-xl p-4 transition-colors ${
        isOver ? "bg-blue-100" : "bg-slate-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-800">
          {column.name}
        </h4>

        <span className="rounded-full bg-white px-2 py-1 text-xs text-gray-600">
          {tasks.length}
        </span>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Position: {column.position}
      </p>

      <button
        onClick={() => onAddTask(column)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-400 bg-white px-3 py-2 text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600"
      >
        <Plus size={16} />
        Add Task
      </button>

      <SortableContext
        items={tasks.map((task) => task._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="mt-4 min-h-24 space-y-3">
          {tasksLoading ? (
            <p className="text-center text-sm text-gray-500">
              Loading tasks...
            </p>
          ) : tasks.length === 0 ? (
            <div className="rounded-lg bg-white p-4 text-center">
              <ClipboardList
                size={22}
                className="mx-auto text-gray-400"
              />
              <p className="mt-2 text-xs text-gray-400">
                Drop tasks here
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task._id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                getPriorityStyle={getPriorityStyle}
                deletingTaskId={deletingTaskId}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default KanbanColumn;
