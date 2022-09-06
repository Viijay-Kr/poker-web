import { Server, Socket } from "socket.io";
import { v4 as uuidV4 } from "uuid";
import { Player, Players } from "@poker-web/types";
import { deal, refreshCards } from "./cards";
import { toPlayersList } from "../utils";
import {
  computeBlinds,
  defineGlobals,
  onPlayerAct,
  startRound,
} from "./rounds";

const players: Players = new Map();

const createCircularPlayerList = (newPlayer: Player, players: Players) => {
  // Assign the new joined player to the list
  // find the player without a link
  // Attach the newly joined player as the link
  for (const [id, { player, next }] of players.entries()) {
    if (!next) {
      players.set(id, {
        player,
        next: newPlayer,
      });
    }
  }
  // Attach the first player in the list as next of the newly joined player
  const [firstPlayer] = players.values();
  players.set(newPlayer.id, {
    player: newPlayer,
    next: firstPlayer.player,
  });
};
const onJoinTable = (player: string, io: Server, socket: Socket) => {
  if (players.size === 0) {
    refreshCards();
  }
  const playerId = uuidV4();
  let _player: Player = {
    name: player,
    chips: 400,
    cards: deal(),
    id: playerId,
    hasFolded: false,
    hasActedThisRound: false,
  };

  players.set(playerId, {
    player: _player,
    next: null,
  });

  if (players.size > 1) {
    createCircularPlayerList(_player, players);
    defineGlobals(players);
    if (players.size === 2) {
      // Don't compute when a new player joins
      computeBlinds(players);
    }
    startRound({ io, players });
  }

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
      onPlayerAct({ io, socket, players });
    });
  });
}
