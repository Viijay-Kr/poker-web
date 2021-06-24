import { Server, Socket } from "socket.io";
import { v4 as uuidV4 } from "uuid";
import { Player, Players } from "@poker-web/types";
import { deal, refreshCards } from "./cards";
import { toPlayersList } from "../utils";
import { computeBlinds, onPlayerAct, startRound } from "./rounds";

const players: Players = new Map();

const onJoinTable = (player: string, io: Server, socket: Socket) => {
  if (players.size === 0) {
    refreshCards();
  }
  const playerId = uuidV4();
  const _player: Player = {
    name: player,
    chips: 400,
    cards: deal(),
    id: playerId,
    hasFolded: false,
    hasActedThisRound: false,
  };
  players.set(playerId, _player);
  computeBlinds(players);

  // Sent the signal to the able about the joined player
  io.sockets.emit<"update_players">("update_players", {
    players: toPlayersList(players),
  });

  console.info(`${player} joined the game`);
  console.info(`${players.size} Player connected to the game`);
};
export default function initTable(io: Server) {
  io.on("connection", (socket: Socket) => {
    socket.on("join_table", (playerName) => {
      onJoinTable(playerName, io, socket);
      startRound({ io, players });
      onPlayerAct({ io, socket, players });
    });
  });
}
