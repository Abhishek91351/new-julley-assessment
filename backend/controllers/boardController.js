
import Board from "../models/Board.js";

// Create a board
export const createBoard = async (req, res) => {
  try {
    const { organizationId, tenantId } = req.params;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Board name is required"
      });
    }

    const board = await Board.create({
      name: name.trim(),
      description: description || "",
      organizationId,
      tenantId,
      createdBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "Board created successfully",
      board
    });

  } catch (error) {
    console.error("Create Board Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create board",
      error: error.message
    });
  }
};

// Get all boards in a tenant
export const getBoards = async (req, res) => {
  try {
    const { organizationId, tenantId } = req.params;

    const boards = await Board.find({
      organizationId,
      tenantId,
      isArchived: false
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: boards.length,
      boards
    });

  } catch (error) {
    console.error("Get Boards Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch boards",
      error: error.message
    });
  }
};

// Get one board
export const getBoardById = async (req, res) => {
  try {
    const { organizationId, tenantId, boardId } = req.params;

    const board = await Board.findOne({
      _id: boardId,
      organizationId,
      tenantId,
      isArchived: false
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found"
      });
    }

    return res.status(200).json({
      success: true,
      board
    });

  } catch (error) {
    console.error("Get Board Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch board",
      error: error.message
    });
  }
};

// Update board
export const updateBoard = async (req, res) => {
  try {
    const { organizationId, tenantId, boardId } = req.params;
    const { name, description } = req.body;

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Board name cannot be empty"
        });
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update"
      });
    }

    const board = await Board.findOneAndUpdate(
      {
        _id: boardId,
        organizationId,
        tenantId,
        isArchived: false
      },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Board updated successfully",
      board
    });

  } catch (error) {
    console.error("Update Board Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update board",
      error: error.message
    });
  }
};

// Delete board (soft delete)
export const deleteBoard = async (req, res) => {
  try {
    const { organizationId, tenantId, boardId } = req.params;

    const board = await Board.findOneAndUpdate(
      {
        _id: boardId,
        organizationId,
        tenantId,
        isArchived: false
      },
      { $set: { isArchived: true } },
      { new: true }
    );

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Board archived successfully"
    });

  } catch (error) {
    console.error("Delete Board Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to archive board",
      error: error.message
    });
  }
};
