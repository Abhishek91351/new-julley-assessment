# Real-Time Collaborative Kanban Board

A full-stack, real-time collaborative Kanban application that enables multiple organizations and their branches (tenants) to manage boards, columns, and tasks with secure access control and live synchronization.

## 🚀 Features

- **Authentication:** User registration and login with JWT authentication.
- **Multi-Tenant Architecture:** Manage multiple organizations and branches.
- **Role-Based Access Control:** Organization Admin, Tenant Admin, and Member roles.
- **Board Management:** Create and manage multiple Kanban boards.
- **Task Management:** Create, update, delete, and archive tasks.
- **Column Management:** Organize tasks into customizable columns.
- **Real-Time Collaboration:** Synchronize task updates using Socket.IO.
- **Tenant Isolation:** Restrict access to authorized organization and tenant data.
- **Concurrency Handling:** Version-based conflict detection to prevent conflicting updates.
- **Activity Tracking:** Maintain records of task activities.

## 🛠️ Tech Stack

**Frontend**
- React.js
- JavaScript (ES6+)
- Tailwind CSS

**Backend**
- Node.js
- Express.js
- RESTful APIs
- JWT Authentication
- Socket.IO

**Database**
- MongoDB
- Mongoose

**Tools**
- Git & GitHub
- Postman
- MongoDB Atlas

## 🏗️ Architecture

The application follows a multi-organization and multi-tenant hierarchy:

```text
Organization
    |
    |-- Tenant / Branch 1
    |       |-- Boards
    |       |     |-- Columns
    |       |            |-- Tasks
    |
    |-- Tenant / Branch 2
            |-- Boards
                  |-- Columns
                         |-- Tasks
```

Each tenant maintains isolated business data, ensuring users can access only the resources they are authorized to manage.

## ⚡ Real-Time Collaboration

Socket.IO enables real-time communication between users working within the same tenant.

- Tenant-specific socket rooms.
- Real-time task creation and update events.
- Live synchronization between connected clients.
- Scoped event broadcasting.

## 🔒 Concurrency Handling

Implemented version-based optimistic concurrency control.

- Each task maintains a version number.
- Updates validate the current version.
- Successful updates increment the version.
- Conflicting updates return HTTP 409 (Conflict).

## 📦 Installation

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Real-Time-Collaborative-Kanban
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in your terminal.

## 🗄️ Database Design

The application uses MongoDB collections to manage:

- Organizations
- Tenants
- Users
- Memberships
- Boards
- Columns
- Tasks
- Activity Logs

Business records are associated with tenant information to support tenant-level data isolation.

## 🔗 API Overview

| Module | Operations |
|---|---|
| Authentication | Register, Login |
| Organizations | Create, Read, Update, Delete |
| Tenants | Create, Read, Update, Delete |
| Boards | Create, Read, Update, Delete |
| Columns | Create, Read, Update, Delete |
| Tasks | Create, Read, Update, Delete, Archive |

All protected operations require authentication and appropriate authorization.

## 🎯 Project Objective

To build a scalable collaborative task management platform with secure multi-tenant architecture, real-time communication, role-based permissions, and reliable concurrent task updates.

## 👨‍💻 Developer

**Abhishek Yadav**

GitHub: [Abhishek91351](https://github.com/Abhishek91351)

