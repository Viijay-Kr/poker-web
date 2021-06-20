import { Server, Socket } from "socket.io";
import { v4 as uuidV4 } from "uuid";
import { Player } from "@poker-web/types";

const players = new Map<string, Player>();

export default function initTable(io: Server) {
  io.on("connection", (socket: Socket) => {
    socket.on("join_table", (player: string) => {
      const playerId = uuidV4();
      const _player = {
        name: player,
        chips: 400,
        cards: [],
        id: playerId,
      };
      players.set(playerId, _player);
      // Sent the signal to the able about the joined player
      socket.emit("joined_table", {
        playersCount: io.engine.clientsCount,
        player: _player,
      });
      console.info(`${player} joined the game`);
      console.info(`${io.engine.clientsCount} Player connected to the game`);
    });
  });
}
