
import Board from "../models/Board.js";
import Column from "../models/Column.js";

// Helper: verify board belongs to this tenant and organization
const findBoard = async (organizationId, tenantId, boardId) => {
  return await Board.findOne({
    _id: boardId,
    organizationId,
    tenantId,
    isArchived: false
  });
};

// Create column
export const createColumn = async (req, res) => {
  try {
    const { organizationId, tenantId, boardId } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Column name is required"
      });
    }

    const board = await findBoard(organizationId, tenantId, boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found"
      });
    }

    const lastColumn = await Column.findOne({
      boardId,
      organizationId,
      tenantId
    }).sort({ position: -1 });

    const position = lastColumn ? lastColumn.position + 1000 : 1000;

    const column = await Column.create({
      name: name.trim(),
      boardId,
      organizationId,
      tenantId,
      position,
      createdBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "Column created successfully",
      column
    });

  } catch (error) {
    console.error("Create Column Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create column",
      error: error.message
    });
  }
};

// Get all columns of a board
export const getColumns = async (req, res) => {
  try {
    const { organizationId, tenantId, boardId } = req.params;

    const board = await findBoard(organizationId, tenantId, boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found"
      });
    }

    const columns = await Column.find({
      boardId,
      organizationId,
      tenantId
    }).sort({ position: 1 });

    return res.status(200).json({
      success: true,
      count: columns.length,
      columns
    });

  } catch (error) {
    console.error("Get Columns Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch columns",
      error: error.message
    });
  }
};

// Update column
export const updateColumn = async (req, res) => {
  try {
    const { organizationId, tenantId, boardId, columnId } = req.params;
    const { name, position } = req.body;

    const board = await findBoard(organizationId, tenantId, boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found"
      });
    }

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Column name cannot be empty"
        });
      }
      updates.name = name.trim();
    }

    if (position !== undefined) {
      if (typeof position !== "number" || !Number.isFinite(position)) {
        return res.status(400).json({
          success: false,
          message: "Position must be a valid number"
        });
      }
      updates.position = position;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide name or position to update"
      });
    }

    const column = await Column.findOneAndUpdate(
      {
        _id: columnId,
        boardId,
        organizationId,
        tenantId
      },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!column) {
      return res.status(404).json({
        success: false,
        message: "Column not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Column updated successfully",
      column
    });

  } catch (error) {
    console.error("Update Column Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update column",
      error: error.message
    });
  }
};

// Delete column
export const deleteColumn = async (req, res) => {
  try {
    const { organizationId, tenantId, boardId, columnId } = req.params;

    const board = await findBoard(organizationId, tenantId, boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found"
      });
    }

    const column = await Column.findOneAndDelete({
      _id: columnId,
      boardId,
      organizationId,
      tenantId
    });

    if (!column) {
      return res.status(404).json({
        success: false,
        message: "Column not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Column deleted successfully"
    });

  } catch (error) {
    console.error("Delete Column Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete column",
      error: error.message
    });
  }
};
