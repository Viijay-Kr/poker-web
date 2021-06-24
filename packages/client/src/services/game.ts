import { io } from "socket.io-client";
import { JoinedTableFunc, JoinedTable } from "@poker-web/types";
const socket = io("http://localhost:3001", {
  withCredentials: true,
});

export default function joinTable(name: string, onJoin: JoinedTableFunc) {
  socket.emit("join_table", name);
  socket.on("update_players", ({ players }: JoinedTable) => {
    onJoin(players);
  });
}

export const getSocketInstance = () => socket;
