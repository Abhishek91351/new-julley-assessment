
import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhZTgyOGUxOTdhMDMyNTc2YzBkZTFmOSIsImlhdCI6MTc5MzYwNTc2NiwiZXhwIjoxNzk0MjEwNTY2fQ.IsxCx9doBFcxBffZjqla6iCR-Cv9-Uo4zcfMVasUKwo",
  },
});

socket.on("connect", () => {
  console.log("Listener connected:", socket.id);

  socket.emit(
    "joinTenant",
    {
      organizationId: "6ae828e197a032576c0de1fa",
      tenantId: "6ae82ee4a3ed8a6f7dd104a6",
    },
    (response) => {
      console.log("Room response:", response);
    }
  );
});

socket.on("task:created", (data) => {
  console.log("New task received!");
  console.log(data.task);
});

socket.on("task:updated", (data) => {
  console.log("Task updated!");
  console.log(data.task);
});

socket.on("task:deleted", (data) => {
  console.log("Task archived!");
  console.log(data);
});

socket.on("connect_error", (error) => {
  console.log("Connection error:", error.message);
});
