
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FolderKanban,
  LayoutGrid,
  LogOut,
  Menu,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
  Layers3,
  RefreshCw,
} from "lucide-react";

import api from "../api/axios";
import useAuthStore from "../store/authStore";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const getMe = useAuthStore((state) => state.getMe);
  const logout = useAuthStore((state) => state.logout);

  const [organizations, setOrganizations] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [boards, setBoards] = useState([]);

  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedTenant, setSelectedTenant] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [boardDescription, setBoardDescription] = useState("");

  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [creatingBoard, setCreatingBoard] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const getId = (item) => item?._id || item?.id || "";

  // Load organizations
  const fetchOrganizations = useCallback(async () => {
    try {
      setLoadingOrganizations(true);
      setError("");

      const response = await api.get("/organizations/my");
      const organizationList = response.data.organizations || [];

      setOrganizations(organizationList);

      if (organizationList.length > 0) {
        setSelectedOrganization((current) => {
          const stillExists = organizationList.some(
            (org) => getId(org) === current
          );

          return stillExists ? current : getId(organizationList[0]);
        });
      } else {
        setSelectedOrganization("");
        setSelectedTenant("");
        setTenants([]);
        setBoards([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your organizations."
      );
    } finally {
      setLoadingOrganizations(false);
    }
  }, []);

  // Initialize authentication and dashboard
  useEffect(() => {
    let active = true;

    const initializeDashboard = async () => {
      try {
        if (!user) {
          const result = await getMe();

          if (result?.success === false) {
            logout();
            navigate("/login", { replace: true });
            return;
          }
        }

        if (active) {
          await fetchOrganizations();
        }
      } catch {
        if (active) {
          logout();
          navigate("/login", { replace: true });
        }
      }
    };

    initializeDashboard();

    return () => {
      active = false;
    };
  }, [user, getMe, logout, navigate, fetchOrganizations]);

  // Load tenants when organization changes
  useEffect(() => {
    if (!selectedOrganization) return;

    let active = true;

    const fetchTenants = async () => {
      try {
        setLoadingTenants(true);
        setTenants([]);
        setSelectedTenant("");
        setBoards([]);
        setError("");

        const response = await api.get(
          `/tenants/${selectedOrganization}`
        );

        if (!active) return;

        const tenantList = response.data.tenants || [];
        setTenants(tenantList);

        if (tenantList.length > 0) {
          setSelectedTenant(getId(tenantList[0]));
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load workspaces."
          );
        }
      } finally {
        if (active) setLoadingTenants(false);
      }
    };

    fetchTenants();

    return () => {
      active = false;
    };
  }, [selectedOrganization]);

  // Load boards
  const fetchBoards = useCallback(async () => {
    if (!selectedOrganization || !selectedTenant) {
      setBoards([]);
      return;
    }

    try {
      setLoadingBoards(true);
      setError("");

      const response = await api.get(
        `/boards/${selectedOrganization}/${selectedTenant}`
      );

      setBoards(response.data.boards || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load boards."
      );
    } finally {
      setLoadingBoards(false);
    }
  }, [selectedOrganization, selectedTenant]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  // Filter boards
  const filteredBoards = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return boards;

    return boards.filter((board) =>
      `${board.name || ""} ${board.description || ""}`
        .toLowerCase()
        .includes(search)
    );
  }, [boards, searchTerm]);

  // Create board
  const handleCreateBoard = async (event) => {
    event.preventDefault();

    if (!boardName.trim()) {
      setError("Please enter a board name.");
      return;
    }

    if (!selectedOrganization || !selectedTenant) {
      setError("Please select an organization and workspace.");
      return;
    }

    try {
      setCreatingBoard(true);
      setError("");

      const response = await api.post(
        `/boards/${selectedOrganization}/${selectedTenant}`,
        {
          name: boardName.trim(),
          description: boardDescription.trim(),
        }
      );

      const newBoard = response.data.board;

      if (!newBoard) {
        throw new Error("The server did not return the created board.");
      }

      setBoards((current) => [newBoard, ...current]);

      setBoardName("");
      setBoardDescription("");
      setShowCreateModal(false);

      setSuccess("Your new board has been created.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to create board."
      );
    } finally {
      setCreatingBoard(false);
    }
  };

  // Open board
  const openBoard = (board) => {
    navigate(
      `/board/${getId(board)}?organizationId=${selectedOrganization}&tenantId=${selectedTenant}`
    );
  };

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const currentOrganization = organizations.find(
    (org) => getId(org) === selectedOrganization
  );

  const currentTenant = tenants.find(
    (tenant) => getId(tenant) === selectedTenant
  );

  const displayName = user?.name?.split(" ")[0] || "there";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar ${
          mobileSidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="dashboard-brand">
          <div className="brand-icon">
            <LayoutGrid size={23} />
          </div>

          <div className="brand-text">
            <h2>FlowBoard</h2>
            <span>WORKSPACE</span>
          </div>

          <button
            className="sidebar-close"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">WORKSPACE</span>

          <button className="sidebar-nav-item active">
            <FolderKanban size={18} />
            <span>My Boards</span>
            <span className="nav-count">{boards.length}</span>
          </button>

          <div className="sidebar-nav-item">
            <Users size={18} />
            <span>Team Workspace</span>
          </div>

          <div className="sidebar-nav-item">
            <Activity size={18} />
            <span>Activity</span>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon">
              <CircleHelp size={19} />
            </div>
            <div>
              <strong>Need some help?</strong>
              <span>Manage your workspace</span>
            </div>
          </div>

          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {mobileSidebarOpen && (
        <button
          className="sidebar-overlay"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}

      {/* Main */}
      <main className="dashboard-main">
        {/* Topbar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div className="breadcrumb">
              <span>Workspace</span>
              <span className="breadcrumb-separator">/</span>
              <strong>My Boards</strong>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-status">
              <span className="online-dot" />
              All systems operational
            </div>

            <button
              className="icon-button"
              title="Refresh boards"
              onClick={fetchBoards}
              disabled={loadingBoards}
            >
              <RefreshCw
                size={18}
                className={loadingBoards ? "spin-icon" : ""}
              />
            </button>

            <div className="user-profile">
              <div className="user-avatar">{initials}</div>
              <div className="user-profile-info">
                <strong>{user?.name || "User"}</strong>
                <span>{user?.email || "Workspace member"}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Welcome */}
          <section className="welcome-banner">
            <div className="welcome-content">
              <div className="welcome-eyebrow">
                <Sparkles size={15} />
                YOUR WORKSPACE
              </div>

              <h1>
                Good day, {displayName} <span>✦</span>
              </h1>

              <p>
                Organize your work, collaborate with your team, and keep
                every project moving forward.
              </p>

              <button
                className="primary-button welcome-button"
                onClick={() => setShowCreateModal(true)}
                disabled={!selectedTenant}
              >
                <Plus size={18} />
                Create new board
              </button>
            </div>

            <div className="welcome-decoration">
              <div className="decoration-circle circle-one" />
              <div className="decoration-circle circle-two" />
              <div className="decoration-card">
                <div className="decoration-card-top">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="decoration-line line-large" />
                <div className="decoration-line" />
                <div className="decoration-task">
                  <CheckCircle2 size={16} />
                  Project completed
                </div>
              </div>
            </div>
          </section>

          {/* Alerts */}
          {error && (
            <div className="dashboard-alert error-alert">
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {success && (
            <div className="dashboard-alert success-alert">
              <CheckCircle2 size={18} />
              <span>{success}</span>
              <button
                onClick={() => setSuccess("")}
                aria-label="Dismiss message"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* Statistics */}
          <section className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-card-icon purple-icon">
                <FolderKanban size={21} />
              </div>
              <div className="stat-card-info">
                <span>Total boards</span>
                <strong>{boards.length}</strong>
                <small>Your project boards</small>
              </div>
              <ArrowUpRight className="stat-trend" size={19} />
            </div>

            <div className="stat-card">
              <div className="stat-card-icon blue-icon">
                <Layers3 size={21} />
              </div>
              <div className="stat-card-info">
                <span>Workspaces</span>
                <strong>{tenants.length}</strong>
                <small>Available workspaces</small>
              </div>
              <ArrowUpRight className="stat-trend" size={19} />
            </div>

            <div className="stat-card">
              <div className="stat-card-icon green-icon">
                <Users size={21} />
              </div>
              <div className="stat-card-info">
                <span>Organizations</span>
                <strong>{organizations.length}</strong>
                <small>Your organizations</small>
              </div>
              <ArrowUpRight className="stat-trend" size={19} />
            </div>

            <div className="stat-card">
              <div className="stat-card-icon orange-icon">
                <Clock3 size={21} />
              </div>
              <div className="stat-card-info">
                <span>Workspace status</span>
                <strong className="status-active">Active</strong>
                <small>Ready to collaborate</small>
              </div>
              <span className="online-dot stat-online-dot" />
            </div>
          </section>

          {/* Boards */}
          <section className="boards-section">
            <div className="boards-heading">
              <div>
                <span className="section-eyebrow">
                  PROJECT MANAGEMENT
                </span>
                <h2>Your boards</h2>
                <p>
                  Everything your team is working on, in one place.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={() => setShowCreateModal(true)}
                disabled={!selectedTenant}
              >
                <Plus size={18} />
                New board
              </button>
            </div>

            {/* Filters */}
            <div className="workspace-filter-panel">
              <div className="filter-heading">
                <div className="filter-heading-icon">
                  <Layers3 size={18} />
                </div>
                <div>
                  <strong>Workspace filters</strong>
                  <span>Choose where you want to work</span>
                </div>
              </div>

              <div className="filter-controls">
                <div className="form-group filter-group">
                  <label htmlFor="organization-select">
                    Organization
                  </label>

                  <select
                    id="organization-select"
                    value={selectedOrganization}
                    onChange={(event) =>
                      setSelectedOrganization(event.target.value)
                    }
                    disabled={
                      loadingOrganizations || organizations.length === 0
                    }
                  >
                    {organizations.length === 0 && (
                      <option value="">No organizations available</option>
                    )}

                    {organizations.map((organization) => (
                      <option
                        key={getId(organization)}
                        value={getId(organization)}
                      >
                        {organization.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group filter-group">
                  <label htmlFor="tenant-select">
                    Workspace / Branch
                  </label>

                  <select
                    id="tenant-select"
                    value={selectedTenant}
                    onChange={(event) =>
                      setSelectedTenant(event.target.value)
                    }
                    disabled={loadingTenants || tenants.length === 0}
                  >
                    {loadingTenants && (
                      <option value="">Loading workspaces...</option>
                    )}

                    {!loadingTenants && tenants.length === 0 && (
                      <option value="">No workspaces available</option>
                    )}

                    {tenants.map((tenant) => (
                      <option key={getId(tenant)} value={getId(tenant)}>
                        {tenant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group search-group">
                  <label htmlFor="board-search">Search boards</label>

                  <div className="search-input-wrapper">
                    <Search size={18} />
                    <input
                      id="board-search"
                      type="search"
                      placeholder="Search by board name..."
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(event.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Board heading */}
            <div className="board-list-heading">
              <div>
                <h3>All projects</h3>
                <span>
                  {currentOrganization?.name || "Organization"}{" "}
                  <span className="breadcrumb-separator">/</span>{" "}
                  {currentTenant?.name || "Workspace"}
                </span>
              </div>

              <span className="board-count">
                {filteredBoards.length}{" "}
                {filteredBoards.length === 1 ? "board" : "boards"}
              </span>
            </div>

            {/* Board states */}
            {loadingBoards || loadingOrganizations ? (
              <div className="dashboard-loading">
                <div className="loading-spinner" />
                <p>Loading your workspace...</p>
              </div>
            ) : !selectedTenant ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Layers3 size={30} />
                </div>
                <h3>No workspace selected</h3>
                <p>
                  Select an organization and workspace to view your boards.
                </p>
              </div>
            ) : filteredBoards.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  {searchTerm ? (
                    <Search size={30} />
                  ) : (
                    <FolderKanban size={30} />
                  )}
                </div>

                <h3>
                  {searchTerm
                    ? "No matching boards"
                    : "Your workspace is empty"}
                </h3>

                <p>
                  {searchTerm
                    ? "Try another search term."
                    : "Create your first board and start organizing your projects."}
                </p>

                {!searchTerm && (
                  <button
                    className="primary-button"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus size={18} />
                    Create your first board
                  </button>
                )}
              </div>
            ) : (
              <div className="boards-grid">
                {filteredBoards.map((board, index) => (
                  <article
                    className="board-card"
                    key={getId(board)}
                    onClick={() => openBoard(board)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openBoard(board);
                      }
                    }}
                  >
                    <div className={`board-card-cover cover-${index % 4}`}>
                      <div className="board-cover-symbol">
                        <FolderKanban size={25} />
                      </div>
                      <span className="board-card-menu">
                        <ArrowUpRight size={19} />
                      </span>
                    </div>

                    <div className="board-card-body">
                      <div className="board-card-title-row">
                        <h3>{board.name}</h3>
                        <span className="board-status">
                          <span className="online-dot" />
                          Active
                        </span>
                      </div>

                      <p className="board-description">
                        {board.description ||
                          "Keep your tasks organized and your team moving forward."}
                      </p>

                      <div className="board-card-footer">
                        <div className="board-members">
                          <div className="mini-avatar">{initials}</div>
                          <span>Workspace board</span>
                        </div>

                        <span className="board-open-link">
                          Open board <ArrowRight size={15} />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}

                <button
                  className="create-board-card"
                  onClick={() => setShowCreateModal(true)}
                >
                  <div className="create-board-icon">
                    <Plus size={23} />
                  </div>
                  <strong>Create a new board</strong>
                  <span>Start organizing a new project</span>
                </button>
              </div>
            )}
          </section>

          <footer className="dashboard-footer">
            <span>© {new Date().getFullYear()} FlowBoard</span>
            <span>Built for better teamwork.</span>
          </footer>
        </div>
      </main>

      {/* Create board modal */}
      {showCreateModal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !creatingBoard
            ) {
              setShowCreateModal(false);
            }
          }}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-board-title"
          >
            <div className="modal-header">
              <div className="modal-title-icon">
                <FolderKanban size={22} />
              </div>

              <button
                className="icon-button modal-close"
                onClick={() => setShowCreateModal(false)}
                disabled={creatingBoard}
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            <div className="modal-heading">
              <span className="section-eyebrow">NEW PROJECT</span>
              <h2 id="create-board-title">Create a board</h2>
              <p>
                Give your project a name and a short description to get
                started.
              </p>
            </div>

            <form onSubmit={handleCreateBoard}>
              <div className="form-group">
                <label htmlFor="board-name">
                  Board name <span className="required-mark">*</span>
                </label>

                <input
                  id="board-name"
                  type="text"
                  placeholder="e.g. Website Redesign"
                  value={boardName}
                  onChange={(event) => setBoardName(event.target.value)}
                  maxLength={60}
                  required
                  autoFocus
                />

                <small>{boardName.length}/60 characters</small>
              </div>

              <div className="form-group">
                <label htmlFor="board-description">
                  Description{" "}
                  <span className="optional-label">Optional</span>
                </label>

                <textarea
                  id="board-description"
                  placeholder="What is this project about?"
                  value={boardDescription}
                  onChange={(event) =>
                    setBoardDescription(event.target.value)
                  }
                  rows={4}
                  maxLength={250}
                />

                <small>{boardDescription.length}/250 characters</small>
              </div>

              <div className="modal-context">
                <Layers3 size={17} />
                <span>
                  Creating in{" "}
                  <strong>
                    {currentTenant?.name || "Selected workspace"}
                  </strong>
                </span>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creatingBoard}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={creatingBoard || !boardName.trim()}
                >
                  {creatingBoard ? (
                    "Creating..."
                  ) : (
                    <>
                      Create board <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
