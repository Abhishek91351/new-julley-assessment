
import Board from "../models/Board.js";
import Column from "../models/Column.js";
import Task from "../models/Task.js";
import Membership from "../models/Membership.js";
import ActivityLog from "../models/ActivityLog.js";

// ==================================================
// SAVE ACTIVITY LOG
// ==================================================

const saveActivity = async ({
  req,
  taskId,
  action,
  details,
}) => {
  try {
    await ActivityLog.create({
      organizationId: req.organizationId,
      tenantId: req.tenantId,
      boardId: req.params.boardId,
      taskId,
      userId: req.user._id,
      action,
      details,
    });
  } catch (error) {
    // Activity logging should not break task operations.
    console.error("Activity logging failed:", error.message);
  }
};

// ==================================================
// CHECK VALID ASSIGNEE
// ==================================================

const isValidAssignee = async (userId, organizationId, tenantId) => {
  if (!userId) return true;

  const membership = await Membership.findOne({
    userId,
    organizationId,
    isActive: true,
    $or: [
      { tenantId },
      { tenantId: null, role: "ORG_ADMIN" },
    ],
  });

  return Boolean(membership);
};

// ==================================================
// CREATE TASK
// ==================================================

export const createTask = async (req, res) => {
  try {
    const { organizationId, tenantId, boardId } = req.params;

    const {
      title,
      description,
      columnId,
      assignedTo,
      priority,
      dueDate,
    } = req.body;

    if (!title || !title.trim() || !columnId) {
      return res.status(400).json({
        success: false,
        message: "Task title and columnId are required",
      });
    }

    // Verify board belongs to this tenant.
    const board = await Board.findOne({
      _id: boardId,
      organizationId,
      tenantId,
      isArchived: false,
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    // Verify column belongs to this board and tenant.
    const column = await Column.findOne({
      _id: columnId,
      boardId,
      organizationId,
      tenantId,
    });

    if (!column) {
      return res.status(404).json({
        success: false,
        message: "Column not found in this board",
      });
    }

    // Validate assignee.
    if (
      assignedTo &&
      !(await isValidAssignee(assignedTo, organizationId, tenantId))
    ) {
      return res.status(400).json({
        success: false,
        message: "Assigned user is not a member of this tenant",
      });
    }

    // Find last task position in this column.
    const lastTask = await Task.findOne({
      boardId,
      columnId,
      organizationId,
      tenantId,
      isArchived: false,
    }).sort({ position: -1 });

    const position = lastTask
      ? lastTask.position + 1000
      : 1000;

    // Create task.
    const task = await Task.create({
      title: title.trim(),
      description: description || "",
      boardId,
      columnId,
      organizationId,
      tenantId,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
      priority: priority || "MEDIUM",
      dueDate: dueDate || null,
      position,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    // Save activity.
    await saveActivity({
      req,
      taskId: task._id,
      action: "TASK_CREATED",
      details: `Created task: ${task.title}`,
    });

    // Emit real-time task creation event.
    const io = req.app.get("io");

    if (io) {
      io.to(`tenant:${tenantId}`).emit("task:created", {
        task: populatedTask,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populatedTask,
    });

  } catch (error) {
    console.error("Create Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};

// ==================================================
// GET ALL TASKS IN A BOARD
// ==================================================

export const getTasks = async (req, res) => {
  try {
    const { organizationId, tenantId, boardId } = req.params;

    const board = await Board.findOne({
      _id: boardId,
      organizationId,
      tenantId,
      isArchived: false,
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    const tasks = await Task.find({
      boardId,
      organizationId,
      tenantId,
      isArchived: false,
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ columnId: 1, position: 1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });

  } catch (error) {
    console.error("Get Tasks Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};

// ==================================================
// GET ONE TASK
// ==================================================

export const getTaskById = async (req, res) => {
  try {
    const { organizationId, tenantId, boardId, taskId } = req.params;

    const task = await Task.findOne({
      _id: taskId,
      boardId,
      organizationId,
      tenantId,
      isArchived: false,
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });

  } catch (error) {
    console.error("Get Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch task",
      error: error.message,
    });
  }
};

// ==================================================
// UPDATE TASK WITH VERSION CONTROL
// ==================================================

export const updateTask = async (req, res) => {
  try {
    const { organizationId, tenantId, boardId, taskId } = req.params;

    const {
      version,
      title,
      description,
      columnId,
      assignedTo,
      priority,
      dueDate,
      position,
    } = req.body;

    if (!Number.isInteger(version) || version < 0) {
      return res.status(400).json({
        success: false,
        message: "A valid task version is required",
      });
    }

    // Get current task before updating.
    const previousTask = await Task.findOne({
      _id: taskId,
      boardId,
      organizationId,
      tenantId,
      isArchived: false,
    });

    if (!previousTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const updates = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Task title cannot be empty",
        });
      }

      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (priority !== undefined) {
      if (!["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task priority",
        });
      }

      updates.priority = priority;
    }

    if (dueDate !== undefined) {
      if (dueDate !== null && Number.isNaN(Date.parse(dueDate))) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date",
        });
      }

      updates.dueDate = dueDate;
    }

    if (position !== undefined) {
      if (
        typeof position !== "number" ||
        !Number.isFinite(position)
      ) {
        return res.status(400).json({
          success: false,
          message: "Position must be a valid number",
        });
      }

      updates.position = position;
    }

    // Validate destination column.
    if (columnId !== undefined) {
      const column = await Column.findOne({
        _id: columnId,
        boardId,
        organizationId,
        tenantId,
      });

      if (!column) {
        return res.status(404).json({
          success: false,
          message: "Destination column not found",
        });
      }

      updates.columnId = columnId;
    }

    // Validate assignee.
    if (assignedTo !== undefined) {
      if (
        assignedTo &&
        !(await isValidAssignee(assignedTo, organizationId, tenantId))
      ) {
        return res.status(400).json({
          success: false,
          message: "Assigned user is not a member of this tenant",
        });
      }

      updates.assignedTo = assignedTo || null;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    // Update only when the version matches.
    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        boardId,
        organizationId,
        tenantId,
        isArchived: false,
        version,
      },
      {
        $set: updates,
        $inc: { version: 1 },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!task) {
      const existingTask = await Task.findOne({
        _id: taskId,
        boardId,
        organizationId,
        tenantId,
        isArchived: false,
      });

      if (!existingTask) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "Task was modified by another user. Please refresh and try again.",
        currentVersion: existingTask.version,
      });
    }

    // Determine whether the task was moved.
    const oldColumnId = String(previousTask.columnId);
    const newColumnId = String(task.columnId);

    const wasMoved = oldColumnId !== newColumnId;

    // Save activity.
    await saveActivity({
      req,
      taskId: task._id,
      action: wasMoved ? "TASK_MOVED" : "TASK_UPDATED",
      details: wasMoved
        ? `Moved task: ${task.title}`
        : `Updated task: ${task.title}`,
    });

    // Emit real-time task update event.
    const io = req.app.get("io");

    if (io) {
      io.to(`tenant:${tenantId}`).emit("task:updated", {
        task,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });

  } catch (error) {
    console.error("Update Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};

// ==================================================
// DELETE TASK (SOFT DELETE)
// ==================================================

export const deleteTask = async (req, res) => {
  try {
    const { organizationId, tenantId, boardId, taskId } = req.params;

    // Archive task.
    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        boardId,
        organizationId,
        tenantId,
        isArchived: false,
      },
      {
        $set: { isArchived: true },
        $inc: { version: 1 },
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Save activity.
    await saveActivity({
      req,
      taskId: task._id,
      action: "TASK_DELETED",
      details: `Deleted task: ${task.title}`,
    });

    // Emit real-time task deletion event.
    const io = req.app.get("io");

    if (io) {
      io.to(`tenant:${tenantId}`).emit("task:deleted", {
        taskId: task._id,
        boardId: task.boardId,
        columnId: task.columnId,
        version: task.version,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task archived successfully",
    });

  } catch (error) {
    console.error("Delete Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to archive task",
      error: error.message,
    });
  }
};
