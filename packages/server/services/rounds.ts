import { Server, Socket } from "socket.io";
import {
  CommunityCardsStatus,
  Card,
  OnPlayerActParams,
  Players,
  PlayerAction,
} from "@poker-web/types";
import { toPlayersList } from "../utils";
import { deal, getFlop, getRiver, getTurn, refreshCards } from "./cards";
import { computeWinner } from "./compute_winner";

let communityCardsStatus: CommunityCardsStatus = "preflop";
let communityCards: Card[] = [];
let hands = 0;
let preFlop = true;

const smallBlindValue = 2;
const bigBlindValue = 4;
let pot = 0;
let currentActionInPlay: PlayerAction;

let rounds = 0;

const getActOptionsForNextPlayerToAct = (
  isPlayerBigBlind?: boolean
): PlayerAction[] | [] => {
  const action = currentActionInPlay;
  switch (action.option) {
    case "call": {
      // handle the first round action here
      // big blind can check/raise
      const option: PlayerAction =
        isPlayerBigBlind && rounds === 0
          ? {
              option: "check",
            }
          : {
              option: "call",
              amountToAct: action.amountToAct,
            };
      return [
        option,
        {
          option: "raise",
          amountToAct: {
            min: bigBlindValue,
          },
        },
        {
          option: "fold",
        },
      ];
    }
    case "raise": {
      return [
        {
          option: "call",
          amountToAct: action.amountToAct.min,
        },
        {
          option: "raise",
          amountToAct: {
            min: action.amountToAct.min,
          },
        },
        {
          option: "fold",
        },
      ];
    }
    case "check": {
      return [
        {
          option: "check",
        },
        {
          option: "raise",
          amountToAct: {
            min: bigBlindValue,
          },
        },
      ];
    }
    default:
      return [];
  }
};

const computeBlinds = (players: Players) => {
  const playersList = toPlayersList(players);
  const smallBlind = playersList.find((player) => player.smallBlind);
  const bigBlind = playersList.find((player) => player.bigBlind);
  const bigBlindPosition = playersList.findIndex((player) => player.bigBlind);
  if (!smallBlind) {
    const player1 = playersList[0];
    players.set(player1.id, {
      ...player1,
      chips: player1.chips - 2,
      smallBlind: true,
    });
  }
  if (players.size > 1 && !bigBlind) {
    const player2 = playersList[1];
    players.set(player2.id, {
      ...player2,
      chips: player2.chips - 4,
      bigBlind: true,
    });
  }
  if (smallBlind && bigBlind && rounds > 0) {
    players.set(bigBlind.id, {
      ...bigBlind,
      chips: bigBlind.chips - 2,
      smallBlind: true,
      bigBlind: false,
    });
    let nextBigBlind;
    if (players.size > 2) {
      // if there more than 2 players assign the big blind the player next to big blind
      nextBigBlind = playersList[bigBlindPosition + 1];
    } else {
      nextBigBlind = playersList[0];
    }
    players.set(nextBigBlind.id, {
      ...nextBigBlind,
      chips: nextBigBlind.chips - 4,
      bigBlind: true,
      smallBlind: false,
      hasActedThisRound: true,
    });
  }
  pot = 6;
};

const startRound = ({ io, players }: { io: Server; players: Players }) => {
  // The player next to big blind will start the round pre flop
  // Else the small blind always starts the round
  const playersList = toPlayersList(players);
  let playerToStart;
  if (players.size > 1) {
    if (preFlop) {
      const bigBlindIndex = playersList.findIndex(({ bigBlind }) => !!bigBlind);

      if (players.size > 2) {
        if (rounds < 1) {
          playerToStart = playersList[bigBlindIndex + 1];
        } else {
          // handle the post flop here
          playerToStart = playersList.find(({ smallBlind }) => !!smallBlind);
        }
      } else {
        // Small blind will start the round in heads up
        // preflop will be small blind and post flop will be big blind to act
        if (rounds >= 1) {
          playerToStart = playersList[bigBlindIndex];
        } else {
          playerToStart = playersList.find(({ smallBlind }) => !!smallBlind);
        }
      }
    }
  }
  if (playerToStart) {
    if (rounds === 0) {
      currentActionInPlay = {
        option: "call",
        amountToAct: smallBlindValue,
      };
    } else {
      // always start with check
      currentActionInPlay = {
        option: "check",
      };
    }
    io.sockets.emit("on_player_to_act", {
      playerToAct: playerToStart,
      actions: getActOptionsForNextPlayerToAct(),
    });
  }
};

const onPlayerAct = ({
  io,
  socket,
  players,
}: {
  io: Server;
  socket: Socket;
  players: Players;
}) => {
  socket.on(
    "on_player_act",
    ({ player, action, customBet }: OnPlayerActParams) => {
      let hasPlayerRaised = false;
      const currentPlayerId = player.id;
      switch (action.option) {
        case "call": {
          player.chips -= action.amountToAct;
          pot += action.amountToAct;
          player.hasActedThisRound = true;
          currentActionInPlay = action;
          break;
        }
        case "raise": {
          player.chips -= customBet || action.amountToAct.min;
          pot += customBet || action.amountToAct.min;
          hasPlayerRaised = true;
          player.hasActedThisRound = true;
          currentActionInPlay = {
            option: "raise",
            amountToAct: {
              min: customBet
                ? customBet - action.amountToAct.min
                : action.amountToAct.min,
            },
          };
          break;
        }
        case "check":
          player.hasActedThisRound = true;
          currentActionInPlay = action;
          break;
        case "fold":
          player.hasFolded = true;
          player.hasActedThisRound = true;
          break;
        default:
          break;
      }
      players.set(player.id, {
        ...player,
      });
      const playersList = toPlayersList(players);
      const nextPlayerToAct = toPlayersList(players).find(
        (player) => !player.hasActedThisRound
      );
      if (hasPlayerRaised) {
        playersList.forEach(
          (player) =>
            player.id !== currentPlayerId &&
            players.set(player.id, {
              ...player,
              hasActedThisRound: false,
            })
        );
      }
      const hasAllPlayersActedThisRound = toPlayersList(players).every(
        (player) => player.hasActedThisRound
      );

      if (hasAllPlayersActedThisRound) {
        // if all the players have acted do the community cards
        console.log(
          ">>> hasAllPlayersActedThisRound",
          hasAllPlayersActedThisRound,
          communityCardsStatus
        );
        switch (communityCardsStatus) {
          case "preflop":
            // emit flop cards here
            communityCards = getFlop();
            communityCardsStatus = "flop";
            break;
          case "flop":
            communityCards = communityCards.concat(getTurn());
            communityCardsStatus = "turn";
            break;
          case "turn":
            communityCards = communityCards.concat(getRiver());
            communityCardsStatus = "river";
            break;
          case "river":
            // Once all players acted compute the winner here
            const winner = computeWinner(players, communityCards);
            if (winner?.winningPlayer) {
              players.set(winner.winningPlayer.id, {
                ...winner.winningPlayer,
                chips: winner.winningPlayer.chips + pot,
              });
            }
            io.sockets.emit("winner", {
              winner,
            });
            refreshGame(players, io);
            // Refresh the whole game here
            break;
          default:
            break;
        }
        players.forEach((player, key) =>
          players.set(key, {
            ...player,
            hasActedThisRound: false,
          })
        );
        rounds++;
        startRound({ io, players });
      } else if (nextPlayerToAct) {
        io.sockets.emit("on_player_to_act", {
          playerToAct: nextPlayerToAct,
          actions: getActOptionsForNextPlayerToAct(nextPlayerToAct.bigBlind),
        });
      }
      io.sockets.emit("community_cards", {
        communityCardsStatus,
        communityCards,
        potSize: pot,
      });
      io.sockets.emit("update_players", {
        players: toPlayersList(players),
      });
    }
  );
};

const refreshGame = (players: Players, io: Server) => {
  refreshCards();
  rounds = 0;
  hands++;
  players.forEach((player) => {
    players.set(player.id, {
      ...player,
      cards: deal(),
    });
  });
  communityCards = [];
  communityCardsStatus = "preflop";
  computeBlinds(players);
  io.sockets.emit("community_cards", {
    communityCardsStatus,
    communityCards,
    potSize: pot,
  });

  io.sockets.emit<"update_players">("update_players", {
    players: toPlayersList(players),
  });
};

export { onPlayerAct, startRound, computeBlinds };
