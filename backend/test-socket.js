import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhZTgyOGUxOTdhMDMyNTc2YzBkZTFmOSIsImlhdCI6MTc5MzYwNTAxNiwiZXhwIjoxNzk0MjA5ODE2fQ.Bwqw9kLVmJKovGMNwg8QlNmTJRfFhndMw2Sqpmw5P3w",
  },
});

socket.on("connect", () => {
  console.log("Connected successfully!");
  console.log("Socket ID:", socket.id);

  // Request access to the tenant room
  socket.emit(
    "joinTenant",
    {
      organizationId: "6ae828e197a032576c0de1fa",
      tenantId: "6ae82ee4a3ed8a6f7dd104a6",
    },
    (response) => {
      console.log("Tenant room response:", response);
      socket.disconnect();
    }
  );
});

socket.on("connect_error", (error) => {
  console.log("Connection failed:", error.message);
});