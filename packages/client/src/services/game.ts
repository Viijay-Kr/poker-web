import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  withCredentials: true,
});

export default function joinTable(
  name: string,
  onJoin: (playersCount: number) => void
) {
  socket.emit("join_table", name);
  socket.on("joined_table", ({ playersCount }: { playersCount: number }) => {
    onJoin(playersCount);
  });
}
