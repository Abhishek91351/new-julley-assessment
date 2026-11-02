
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  RefreshCw,
  Plus,
  Pencil,
  ArrowRightLeft,
  Trash2,
  Clock,
  AlertCircle,
  History,
  UserRound,
} from "lucide-react";

import api from "../api/axios";
import "./ActivityPanel.css";

function ActivityPanel({
  organizationId,
  tenantId,
  boardId,
  refreshKey = 0,
}) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchActivities = useCallback(
    async (manualRefresh = false) => {
      if (!organizationId || !tenantId || !boardId) {
        setLoading(false);
        return;
      }

      try {
        if (manualRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await api.get(
          `/activity/${organizationId}/${tenantId}/${boardId}`
        );

        setActivities(response.data.activities || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load activity history."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [organizationId, tenantId, boardId]
  );

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities, refreshKey]);

  const getActionDetails = (action) => {
    switch (action) {
      case "TASK_CREATED":
        return {
          label: "created a task",
          icon: Plus,
          className: "activity-created",
        };

      case "TASK_UPDATED":
        return {
          label: "updated a task",
          icon: Pencil,
          className: "activity-updated",
        };

      case "TASK_MOVED":
        return {
          label: "moved a task",
          icon: ArrowRightLeft,
          className: "activity-moved",
        };

      case "TASK_DELETED":
        return {
          label: "deleted a task",
          icon: Trash2,
          className: "activity-deleted",
        };

      default:
        return {
          label: "performed an action",
          icon: Activity,
          className: "activity-default",
        };
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return "Unknown time";

    const seconds = Math.floor(
      (Date.now() - new Date(date).getTime()) / 1000
    );

    if (!Number.isFinite(seconds) || seconds < 0) {
      return new Date(date).toLocaleString();
    }

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return new Date(date).toLocaleDateString();
  };

  return (
    <section className="activity-panel">
      {/* Header */}
      <div className="activity-panel-header">
        <div className="activity-heading-left">
          <div className="activity-heading-icon">
            <Activity size={19} />
          </div>

          <div>
            <h3>Activity History</h3>
            <p>Keep track of what's happening in this workspace.</p>
          </div>
        </div>

        <div className="activity-heading-actions">
          <span className="activity-count">
            {activities.length} {activities.length === 1 ? "event" : "events"}
          </span>

          <button
            type="button"
            className="activity-refresh-button"
            onClick={() => fetchActivities(true)}
            disabled={refreshing || loading}
            title="Refresh activity"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "activity-spin" : ""}
            />
            <span>{refreshing ? "Refreshing" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Activity Content */}
      <div className="activity-panel-content">
        {loading ? (
          <div className="activity-state">
            <span className="activity-spinner" />
            <p>Loading activity history...</p>
          </div>
        ) : error ? (
          <div className="activity-state activity-error">
            <AlertCircle size={24} />
            <p>{error}</p>

            <button
              type="button"
              onClick={() => fetchActivities(true)}
              disabled={refreshing}
            >
              Try again
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="activity-state activity-empty">
            <div className="activity-empty-icon">
              <History size={27} />
            </div>

            <h4>No activity yet</h4>
            <p>
              Task creation, updates, and movements will appear here.
            </p>
          </div>
        ) : (
          <div className="activity-timeline">
            {activities.map((item) => {
              const action = getActionDetails(item.action);
              const ActionIcon = action.icon;

              return (
                <div className="activity-item" key={item._id}>
                  <div
                    className={`activity-item-icon ${action.className}`}
                  >
                    <ActionIcon size={16} />
                  </div>

                  <div className="activity-item-body">
                    <div className="activity-item-top">
                      <p className="activity-description">
                        <span className="activity-user-name">
                          {item.userId?.name || "Unknown user"}
                        </span>{" "}
                        {action.label}
                      </p>

                      <span className="activity-time-ago">
                        {getTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    {item.details && (
                      <p className="activity-details">
                        {item.details}
                      </p>
                    )}

                    <div className="activity-item-footer">
                      <span>
                        <UserRound size={12} />
                        {item.userId?.name || "Unknown user"}
                      </span>

                      <span>
                        <Clock size={12} />
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : "Date unavailable"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default ActivityPanel;
