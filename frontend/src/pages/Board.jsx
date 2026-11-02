
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  LayoutDashboard,
  Plus,
  X,
  CalendarDays,
  ClipboardList,
  Pencil,
  Trash2,
  RefreshCw,
  GripVertical,
  Search,
  MoreHorizontal,
  Layers3,
  AlertCircle,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { io } from "socket.io-client";

import ActivityPanel from "../components/ActivityPanel";
import api from "../api/axios";
import "./Board.css";

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const emptyTaskForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
  dueDate: "",
};

const getId = (value) => value?._id || value;

const getPriorityClass = (priority) => {
  const styles = {
    URGENT: "priority-urgent",
    HIGH: "priority-high",
    MEDIUM: "priority-medium",
    LOW: "priority-low",
  };

  return styles[priority] || "priority-low";
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

// --------------------------------------------------
// TASK CARD
// --------------------------------------------------

function SortableTaskCard({
  task,
  onEdit,
  onDelete,
  deletingTaskId,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: {
      type: "task",
      columnId: getId(task.columnId),
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate).setHours(0, 0, 0, 0) <
      new Date().setHours(0, 0, 0, 0);

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`kanban-task-card ${isDragging ? "is-dragging" : ""}`}
    >
      <div className="task-card-top">
        <button
          type="button"
          className="task-drag-handle"
          {...attributes}
          {...listeners}
          title="Drag task"
          aria-label={`Drag ${task.title}`}
          style={{ touchAction: "none" }}
        >
          <GripVertical size={17} />
        </button>

        <span className={`task-priority ${getPriorityClass(task.priority)}`}>
          <span className="priority-dot" />
          {task.priority || "MEDIUM"}
        </span>

        <div className="task-card-actions">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="task-icon-button"
            title="Edit task"
            aria-label="Edit task"
          >
            <Pencil size={14} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(task)}
            disabled={deletingTaskId === task._id}
            className="task-icon-button task-delete-button"
            title="Delete task"
            aria-label="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h4 className="task-card-title">{task.title}</h4>

      {task.description && (
        <p className="task-card-description">{task.description}</p>
      )}

      <div className="task-card-footer">
        {task.dueDate ? (
          <span className={`task-due-date ${isOverdue ? "overdue" : ""}`}>
            <CalendarDays size={13} />
            {formatDate(task.dueDate)}
          </span>
        ) : (
          <span className="task-no-date">No due date</span>
        )}

        {task.assignedTo && (
          <span
            className="task-assignee"
            title={task.assignedTo.name || "Assigned member"}
          >
            {getInitials(task.assignedTo.name || "Member")}
          </span>
        )}
      </div>

      {deletingTaskId === task._id && (
        <div className="task-deleting-label">Deleting task...</div>
      )}
    </article>
  );
}

// --------------------------------------------------
// KANBAN COLUMN
// --------------------------------------------------

function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  deletingTaskId,
  tasksLoading,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column._id}`,
    data: {
      type: "column",
      columnId: column._id,
    },
  });

  return (
    <section
      ref={setNodeRef}
      className={`kanban-column ${isOver ? "column-drag-over" : ""}`}
    >
      <div className="kanban-column-header">
        <div className="kanban-column-heading">
          <span className="column-color-dot" />
          <h3>{column.name}</h3>
          <span className="column-task-count">{tasks.length}</span>
        </div>

        <button
          type="button"
          className="column-menu-button"
          title="Column options"
          aria-label="Column options"
          onClick={() => onAddTask(column)}
        >
          <MoreHorizontal size={19} />
        </button>
      </div>

      <div className="kanban-column-meta">
        <span>{tasks.length === 1 ? "1 task" : `${tasks.length} tasks`}</span>
        <span>Position {column.position}</span>
      </div>

      <button
        type="button"
        className="column-add-task"
        onClick={() => onAddTask(column)}
      >
        <Plus size={16} />
        Add task
      </button>

      <SortableContext
        items={tasks.map((task) => task._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="kanban-task-list">
          {tasksLoading ? (
            <div className="column-loading">
              <span className="loading-spinner" />
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="column-empty">
              <ClipboardList size={25} />
              <p>No tasks yet</p>
              <span>Add a task or drag one here.</span>
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task._id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                deletingTaskId={deletingTaskId}
              />
            ))
          )}
        </div>
      </SortableContext>
    </section>
  );
}

// --------------------------------------------------
// REUSABLE MODAL
// --------------------------------------------------

function BoardModal({ title, subtitle, onClose, children, size = "medium" }) {
  return (
    <div
      className="board-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`board-modal board-modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="board-modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>

          <button
            type="button"
            className="board-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={19} />
          </button>
        </header>

        <div className="board-modal-content">{children}</div>
      </section>
    </div>
  );
}

// --------------------------------------------------
// MAIN BOARD
// --------------------------------------------------

function Board() {
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [searchParams] = useSearchParams();

  const organizationId = searchParams.get("organizationId");
  const tenantId = searchParams.get("tenantId");

  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);

  const [error, setError] = useState("");
  const [taskError, setTaskError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const [draggingTaskId, setDraggingTaskId] = useState(null);

  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columnName, setColumnName] = useState("");
  const [creatingColumn, setCreatingColumn] = useState(false);
  const [columnError, setColumnError] = useState("");

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [createTaskError, setCreateTaskError] = useState("");

  const [editingTask, setEditingTask] = useState(null);
  const [updatingTask, setUpdatingTask] = useState(false);
  const [editError, setEditError] = useState("");

  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --------------------------------------------------
  // FETCH COLUMNS
  // --------------------------------------------------

  useEffect(() => {
    const fetchColumns = async () => {
      if (!organizationId || !tenantId || !boardId) {
        setError("Missing board or workspace information.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/columns/${organizationId}/${tenantId}/${boardId}`
        );

        setColumns(response.data.columns || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load board columns."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchColumns();
  }, [organizationId, tenantId, boardId]);

  // --------------------------------------------------
  // FETCH TASKS
  // --------------------------------------------------

  const fetchTasks = useCallback(async () => {
    if (!organizationId || !tenantId || !boardId) {
      setTasksLoading(false);
      return;
    }

    try {
      setTasksLoading(true);
      setTaskError("");

      const response = await api.get(
        `/tasks/${organizationId}/${tenantId}/${boardId}`
      );

      setTasks(response.data.tasks || []);
    } catch (err) {
      setTaskError(
        err.response?.data?.message || "Unable to load tasks."
      );
    } finally {
      setTasksLoading(false);
    }
  }, [organizationId, tenantId, boardId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // --------------------------------------------------
  // SOCKET.IO
  // --------------------------------------------------

  useEffect(() => {
    if (!organizationId || !tenantId || !boardId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

    const socket = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      socket.emit(
        "joinTenant",
        { organizationId, tenantId },
        (result) => {
          if (!result?.success) {
            console.error(
              "Unable to join workspace room:",
              result?.message
            );
          }
        }
      );
    });

    const handleTaskChange = (data) => {
      const eventBoardId = data?.task?.boardId
        ? getId(data.task.boardId)
        : data?.boardId;

      if (
        eventBoardId &&
        String(eventBoardId) !== String(boardId)
      ) {
        return;
      }

      fetchTasks();
      setActivityRefreshKey((previous) => previous + 1);
    };

    socket.on("task:created", handleTaskChange);
    socket.on("task:updated", handleTaskChange);
    socket.on("task:deleted", handleTaskChange);

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      socket.off("task:created", handleTaskChange);
      socket.off("task:updated", handleTaskChange);
      socket.off("task:deleted", handleTaskChange);
      socket.disconnect();
    };
  }, [organizationId, tenantId, boardId, fetchTasks]);

  // --------------------------------------------------
  // COLUMN ACTIONS
  // --------------------------------------------------

  const handleCreateColumn = async (event) => {
    event.preventDefault();

    if (!columnName.trim()) {
      setColumnError("Please enter a column name.");
      return;
    }

    try {
      setCreatingColumn(true);
      setColumnError("");

      const response = await api.post(
        `/columns/${organizationId}/${tenantId}/${boardId}`,
        { name: columnName.trim() }
      );

      setColumns((previous) => [...previous, response.data.column]);
      setColumnName("");
      setShowColumnModal(false);
    } catch (err) {
      setColumnError(
        err.response?.data?.message || "Unable to create column."
      );
    } finally {
      setCreatingColumn(false);
    }
  };

  // --------------------------------------------------
  // TASK FORM ACTIONS
  // --------------------------------------------------

  const handleTaskFormChange = (event) => {
    const { name, value } = event.target;

    setTaskForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openTaskModal = (column) => {
    setSelectedColumn(column);
    setTaskForm(emptyTaskForm);
    setCreateTaskError("");
    setShowTaskModal(true);
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();

    if (!taskForm.title.trim() || !selectedColumn) {
      setCreateTaskError("Task title is required.");
      return;
    }

    try {
      setCreatingTask(true);
      setCreateTaskError("");

      await api.post(
        `/tasks/${organizationId}/${tenantId}/${boardId}`,
        {
          title: taskForm.title.trim(),
          description: taskForm.description.trim(),
          columnId: selectedColumn._id,
          priority: taskForm.priority,
          dueDate: taskForm.dueDate || null,
        }
      );

      setShowTaskModal(false);
      setTaskForm(emptyTaskForm);
      await fetchTasks();
      setActivityRefreshKey((previous) => previous + 1);
    } catch (err) {
      setCreateTaskError(
        err.response?.data?.message || "Unable to create task."
      );
    } finally {
      setCreatingTask(false);
    }
  };

  // --------------------------------------------------
  // EDIT TASK
  // --------------------------------------------------

  const openEditModal = (task) => {
    setEditingTask(task);

    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "MEDIUM",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    });

    setEditError("");
  };

  const handleUpdateTask = async (event) => {
    event.preventDefault();

    if (!taskForm.title.trim()) {
      setEditError("Task title is required.");
      return;
    }

    try {
      setUpdatingTask(true);
      setEditError("");

      await api.put(
        `/tasks/${organizationId}/${tenantId}/${boardId}/${editingTask._id}`,
        {
          title: taskForm.title.trim(),
          description: taskForm.description.trim(),
          priority: taskForm.priority,
          dueDate: taskForm.dueDate || null,
          version: editingTask.version,
        }
      );

      setEditingTask(null);
      setTaskForm(emptyTaskForm);
      await fetchTasks();
      setActivityRefreshKey((previous) => previous + 1);
    } catch (err) {
      if (err.response?.status === 409) {
        setEditError(
          "This task was changed by another user. Load the latest version before saving."
        );
      } else {
        setEditError(
          err.response?.data?.message || "Unable to update task."
        );
      }
    } finally {
      setUpdatingTask(false);
    }
  };

  const refreshEditedTask = async () => {
    if (!editingTask?._id) return;

    try {
      const response = await api.get(
        `/tasks/${organizationId}/${tenantId}/${boardId}/${editingTask._id}`
      );

      const latestTask = response.data.task;

      setEditingTask(latestTask);
      setTaskForm({
        title: latestTask.title || "",
        description: latestTask.description || "",
        priority: latestTask.priority || "MEDIUM",
        dueDate: latestTask.dueDate
          ? new Date(latestTask.dueDate).toISOString().split("T")[0]
          : "",
      });

      setEditError("Latest version loaded. Review and save again.");
      await fetchTasks();
    } catch (err) {
      setEditError(
        err.response?.data?.message || "Unable to refresh this task."
      );
    }
  };

  // --------------------------------------------------
  // DELETE TASK
  // --------------------------------------------------

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;

    try {
      setDeletingTaskId(task._id);
      setTaskError("");

      await api.delete(
        `/tasks/${organizationId}/${tenantId}/${boardId}/${task._id}`
      );

      setTasks((previous) =>
        previous.filter((item) => item._id !== task._id)
      );

      setActivityRefreshKey((previous) => previous + 1);
    } catch (err) {
      setTaskError(
        err.response?.data?.message || "Unable to delete task."
      );
    } finally {
      setDeletingTaskId(null);
    }
  };

  // --------------------------------------------------
  // GET TASKS FOR COLUMN
  // --------------------------------------------------

  const getColumnTasks = (columnId) =>
    tasks
      .filter((task) => String(getId(task.columnId)) === String(columnId))
      .sort((a, b) => a.position - b.position)
      .filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // --------------------------------------------------
  // DRAG AND DROP
  // --------------------------------------------------

  const handleDragStart = (event) => {
    setDraggingTaskId(event.active.id);
  };

  const handleDragCancel = () => {
    setDraggingTaskId(null);
  };

  const handleDragEnd = async (event) => {
    setDraggingTaskId(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((task) => task._id === active.id);
    if (!activeTask) return;

    const destinationColumnId =
      over.data.current?.columnId ||
      (String(over.id).startsWith("column-")
        ? String(over.id).replace("column-", "")
        : null);

    if (!destinationColumnId) return;

    const destinationTasks = tasks
      .filter(
        (task) =>
          String(getId(task.columnId)) === String(destinationColumnId) &&
          task._id !== activeTask._id
      )
      .sort((a, b) => a.position - b.position);

    const overTask = tasks.find((task) => task._id === over.id);

    let insertIndex = destinationTasks.length;

    if (overTask) {
      const index = destinationTasks.findIndex(
        (task) => task._id === overTask._id
      );

      if (index !== -1) insertIndex = index;
    }

    const previousTask =
      insertIndex > 0 ? destinationTasks[insertIndex - 1] : null;

    const nextTask =
      insertIndex < destinationTasks.length
        ? destinationTasks[insertIndex]
        : null;

    let newPosition;

    if (previousTask && nextTask) {
      newPosition = (previousTask.position + nextTask.position) / 2;
    } else if (previousTask) {
      newPosition = previousTask.position + 1000;
    } else if (nextTask) {
      newPosition = nextTask.position - 1000;
    } else {
      newPosition = 1000;
    }

    const previousTasks = tasks;

    setTasks((current) =>
      current.map((task) =>
        task._id === activeTask._id
          ? {
              ...task,
              columnId: destinationColumnId,
              position: newPosition,
            }
          : task
      )
    );

    try {
      await api.put(
        `/tasks/${organizationId}/${tenantId}/${boardId}/${activeTask._id}`,
        {
          columnId: destinationColumnId,
          position: newPosition,
          version: activeTask.version,
        }
      );

      await fetchTasks();
      setActivityRefreshKey((previous) => previous + 1);
    } catch (err) {
      setTasks(previousTasks);
      await fetchTasks();

      if (err.response?.status === 409) {
        setTaskError(
          "Another user changed this task. The latest board data has been loaded."
        );
      } else {
        setTaskError(
          err.response?.data?.message || "Unable to move this task."
        );
      }
    }
  };

  // --------------------------------------------------
  // DERIVED VALUES
  // --------------------------------------------------

  const totalTasks = tasks.length;
  const urgentTasks = tasks.filter(
    (task) => task.priority === "URGENT"
  ).length;
  const completedColumns = columns.filter((column) =>
    /done|complete|completed/i.test(column.name)
  ).length;

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="board-page">
      <header className="board-topbar">
        <div className="board-topbar-left">
          <button
            type="button"
            className="board-back-button"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={17} />
            <span>Dashboard</span>
          </button>

          <span className="board-breadcrumb-divider">/</span>

          <div className="board-brand-mark">
            <LayoutDashboard size={18} />
          </div>

          <div>
            <div className="board-brand-name">FlowBoard</div>
            <div className="board-brand-caption">TEAM WORKSPACE</div>
          </div>
        </div>

        <div className="board-topbar-right">
          <span className="board-live-indicator">
            <span />
            Live workspace
          </span>
        </div>
      </header>

      <main className="board-content">
        <section className="board-heading-section">
          <div>
            <div className="board-eyebrow">
              <Layers3 size={14} />
              WORKSPACE / BOARD
            </div>

            <h1>Kanban Workspace</h1>
            <p>
              Organize work, track progress, and collaborate with your team.
            </p>
          </div>

          <button
            type="button"
            className="board-primary-button"
            onClick={() => {
              setColumnError("");
              setShowColumnModal(true);
            }}
          >
            <Plus size={17} />
            Add column
          </button>
        </section>

        {(error || taskError) && (
          <div className="board-alert">
            <AlertCircle size={17} />
            <span>{error || taskError}</span>
            <button
              type="button"
              onClick={() => {
                setError("");
                setTaskError("");
              }}
              aria-label="Dismiss alert"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <section className="board-stats">
          <div className="board-stat-card">
            <div className="board-stat-icon stat-icon-purple">
              <ClipboardList size={19} />
            </div>
            <div>
              <strong>{totalTasks}</strong>
              <span>Total tasks</span>
            </div>
          </div>

          <div className="board-stat-card">
            <div className="board-stat-icon stat-icon-red">
              <AlertCircle size={19} />
            </div>
            <div>
              <strong>{urgentTasks}</strong>
              <span>Urgent tasks</span>
            </div>
          </div>

          <div className="board-stat-card">
            <div className="board-stat-icon stat-icon-green">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <strong>{completedColumns}</strong>
              <span>Completed columns</span>
            </div>
          </div>

          <div className="board-stat-card">
            <div className="board-stat-icon stat-icon-blue">
              <Layers3 size={19} />
            </div>
            <div>
              <strong>{columns.length}</strong>
              <span>Board columns</span>
            </div>
          </div>
        </section>

        <section className="board-workspace-panel">
          <div className="board-toolbar">
            <div>
              <h2>Board overview</h2>
              <p>Drag tasks between columns to update their progress.</p>
            </div>

            <label className="board-search">
              <Search size={16} />
              <input
                type="search"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
          </div>

          {loading ? (
            <div className="board-loading">
              <span className="loading-spinner" />
              Loading your board...
            </div>
          ) : columns.length === 0 ? (
            <div className="board-empty-state">
              <div className="board-empty-icon">
                <Layers3 size={28} />
              </div>
              <h3>Your board is ready</h3>
              <p>
                Create your first column to start organizing tasks and work.
              </p>
              <button
                type="button"
                className="board-primary-button"
                onClick={() => setShowColumnModal(true)}
              >
                <Plus size={17} />
                Create first column
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragCancel={handleDragCancel}
              onDragEnd={handleDragEnd}
            >
              <div className="kanban-board-scroll">
                <div className="kanban-board">
                  {columns.map((column) => (
                    <KanbanColumn
                      key={column._id}
                      column={column}
                      tasks={getColumnTasks(column._id)}
                      onAddTask={openTaskModal}
                      onEditTask={openEditModal}
                      onDeleteTask={handleDeleteTask}
                      deletingTaskId={deletingTaskId}
                      tasksLoading={tasksLoading}
                    />
                  ))}

                  <button
                    type="button"
                    className="kanban-add-column"
                    onClick={() => setShowColumnModal(true)}
                  >
                    <Plus size={18} />
                    Add another column
                  </button>
                </div>
              </div>
            </DndContext>
          )}

          {draggingTaskId && (
            <div className="board-drag-hint">
              <GripVertical size={15} />
              Release to move the task
            </div>
          )}
        </section>

        <section className="board-activity-section">
          <div className="board-activity-heading">
            <div>
              <h2>Recent activity</h2>
              <p>Keep track of changes made across this board.</p>
            </div>
            <span className="board-activity-live">
              <span />
              Activity log
            </span>
          </div>

          <ActivityPanel
            organizationId={organizationId}
            tenantId={tenantId}
            boardId={boardId}
            refreshKey={activityRefreshKey}
          />
        </section>

        <footer className="board-footer">
          <span>FlowBoard · Collaborative workspace</span>
          <span>
            <Clock3 size={13} />
            Changes sync in real time
          </span>
        </footer>
      </main>

      {/* CREATE COLUMN MODAL */}
      {showColumnModal && (
        <BoardModal
          title="Create a column"
          subtitle="Add a new stage to your workflow."
          onClose={() => !creatingColumn && setShowColumnModal(false)}
        >
          <form onSubmit={handleCreateColumn}>
            <label className="board-form-label">Column name</label>
            <input
              className="board-form-input"
              type="text"
              value={columnName}
              onChange={(event) => setColumnName(event.target.value)}
              placeholder="e.g. In Review"
              maxLength={40}
              autoFocus
              required
            />

            {columnError && (
              <p className="board-form-error">{columnError}</p>
            )}

            <div className="board-modal-actions">
              <button
                type="button"
                className="board-secondary-button"
                onClick={() => setShowColumnModal(false)}
                disabled={creatingColumn}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="board-primary-button"
                disabled={creatingColumn}
              >
                {creatingColumn ? "Creating..." : "Create column"}
              </button>
            </div>
          </form>
        </BoardModal>
      )}

      {/* CREATE TASK MODAL */}
      {showTaskModal && (
        <BoardModal
          title="Create a task"
          subtitle={`Add a task to ${selectedColumn?.name || "this column"}.`}
          onClose={() => !creatingTask && setShowTaskModal(false)}
          size="large"
        >
          <form onSubmit={handleCreateTask}>
            <label className="board-form-label">Task title</label>
            <input
              className="board-form-input"
              type="text"
              name="title"
              value={taskForm.title}
              onChange={handleTaskFormChange}
              placeholder="What needs to be done?"
              maxLength={120}
              autoFocus
              required
            />

            <label className="board-form-label">Description</label>
            <textarea
              className="board-form-textarea"
              name="description"
              value={taskForm.description}
              onChange={handleTaskFormChange}
              placeholder="Add more details about this task..."
              rows={4}
            />

            <div className="board-form-grid">
              <div>
                <label className="board-form-label">Priority</label>
                <select
                  className="board-form-input"
                  name="priority"
                  value={taskForm.priority}
                  onChange={handleTaskFormChange}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="board-form-label">Due date</label>
                <input
                  className="board-form-input"
                  type="date"
                  name="dueDate"
                  value={taskForm.dueDate}
                  onChange={handleTaskFormChange}
                />
              </div>
            </div>

            {createTaskError && (
              <p className="board-form-error">{createTaskError}</p>
            )}

            <div className="board-modal-actions">
              <button
                type="button"
                className="board-secondary-button"
                onClick={() => setShowTaskModal(false)}
                disabled={creatingTask}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="board-primary-button"
                disabled={creatingTask}
              >
                {creatingTask ? "Creating..." : "Create task"}
              </button>
            </div>
          </form>
        </BoardModal>
      )}

      {/* EDIT TASK MODAL */}
      {editingTask && (
        <BoardModal
          title="Edit task"
          subtitle="Update the task details and save your changes."
          onClose={() => !updatingTask && setEditingTask(null)}
          size="large"
        >
          <form onSubmit={handleUpdateTask}>
            <label className="board-form-label">Task title</label>
            <input
              className="board-form-input"
              type="text"
              name="title"
              value={taskForm.title}
              onChange={handleTaskFormChange}
              required
            />

            <label className="board-form-label">Description</label>
            <textarea
              className="board-form-textarea"
              name="description"
              value={taskForm.description}
              onChange={handleTaskFormChange}
              rows={4}
            />

            <div className="board-form-grid">
              <div>
                <label className="board-form-label">Priority</label>
                <select
                  className="board-form-input"
                  name="priority"
                  value={taskForm.priority}
                  onChange={handleTaskFormChange}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="board-form-label">Due date</label>
                <input
                  className="board-form-input"
                  type="date"
                  name="dueDate"
                  value={taskForm.dueDate}
                  onChange={handleTaskFormChange}
                />
              </div>
            </div>

            {editError && (
              <div className="board-conflict-message">
                <AlertCircle size={16} />
                <div>
                  <p>{editError}</p>
                  {editError.includes("changed by another user") && (
                    <button
                      type="button"
                      onClick={refreshEditedTask}
                    >
                      <RefreshCw size={13} />
                      Load latest version
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="board-modal-actions">
              <button
                type="button"
                className="board-secondary-button"
                onClick={() => setEditingTask(null)}
                disabled={updatingTask}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="board-primary-button"
                disabled={updatingTask}
              >
                {updatingTask ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </BoardModal>
      )}
    </div>
  );
}

export default Board;
