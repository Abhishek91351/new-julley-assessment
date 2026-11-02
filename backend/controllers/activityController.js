
import ActivityLog from "../models/ActivityLog.js";

export const getBoardActivities = async (req, res) => {
  try {
    const activities = await ActivityLog.find({
      organizationId: req.organizationId,
      tenantId: req.tenantId,
      boardId: req.params.boardId,
    })
      .populate("userId", "name email")
      .populate("taskId", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error("Get activities error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch activity logs",
    });
  }
};
