import { createServer } from "http";
import { Server, Socket } from "socket.io";
import initTable from "./services/table";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true,
  },
});

// Initialize the table here
// Table is used to connect players and emit players data to the client
initTable(io);

httpServer.listen(3001);
