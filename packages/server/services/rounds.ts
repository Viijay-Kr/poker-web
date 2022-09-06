import { Server, Socket } from "socket.io";
import {
  CommunityCardsStatus,
  Card,
  OnPlayerActParams,
  Players,
  PlayerAction,
  Player,
  Actions,
} from "@poker-web/types";
import { toPlayersList } from "../utils";
import { deal, getFlop, getRiver, getTurn, refreshCards } from "./cards";
import { computeWinner } from "./compute_winner";

let communityCardsStatus: CommunityCardsStatus;
let communityCards: Card[];
let hands: number;
let preFlop: boolean;
let isHeadsUp: boolean;
let smallBlindValue: number;
let bigBlindValue: number;
let pot: number;

export const defineGlobals = (players: Players) => {
  communityCardsStatus = "preflop";
  communityCards = [];
  hands = 1;
  preFlop = true;
  isHeadsUp = players.size === 2;
  smallBlindValue = 2;
  bigBlindValue = 4;
  pot = 6;
};

export const overRideGlobals = ({
  communityCardsStatus,
  hands,
  preFlop,
  isHeadsUp,
  pot,
}: {
  communityCardsStatus: CommunityCardsStatus;
  hands: number;
  preFlop: boolean;
  isHeadsUp: boolean;
  pot: number;
}) => {
  communityCardsStatus = communityCardsStatus;
  hands = hands;
  preFlop = preFlop;
  isHeadsUp = isHeadsUp;
  pot = pot;
};

const computeAmountToCallOnEveryRound = ({
  raiseOnPlay,
  isSmallBlind,
  isBigBlind,
}: {
  raiseOnPlay?: number;
  isSmallBlind?: boolean;
  isBigBlind?: boolean;
}) => {
  if (isHeadsUp) {
    if (preFlop && raiseOnPlay) {
      if (isBigBlind) {
        return raiseOnPlay - smallBlindValue;
      }
      if (isSmallBlind) {
        return raiseOnPlay;
      }
      return raiseOnPlay;
    }
    return smallBlindValue;
  } else {
    if (preFlop && raiseOnPlay) {
      if (isSmallBlind) {
        return raiseOnPlay - smallBlindValue;
      }
      if (isBigBlind) {
        return raiseOnPlay - bigBlindValue;
      }
      return raiseOnPlay;
    }
    return bigBlindValue;
  }
};

const computeAmountToRaiseOnRound = ({
  raiseOnPlay,
  isSmallBlind,
  isBigBlind,
}: {
  raiseOnPlay?: number;
  isSmallBlind?: boolean;
  isBigBlind?: boolean;
}) => {
  if (raiseOnPlay) {
    if (preFlop) {
      if (isSmallBlind) {
        return raiseOnPlay - smallBlindValue + bigBlindValue;
      } else if (isBigBlind) {
        return raiseOnPlay * 2 - bigBlindValue;
      }
    }
    return raiseOnPlay / 2 + raiseOnPlay;
  }
  if (preFlop) {
    if (isSmallBlind) {
      return smallBlindValue + bigBlindValue;
    } else if (isBigBlind) {
      return bigBlindValue;
    } else {
      return bigBlindValue * 2;
    }
  }

  return bigBlindValue;
};

export const getActOptionsForPlayerToAct = (
  player: Player,
  currentPotValue: number,
  action?: PlayerAction
): PlayerAction[] | [] => {
  const isPlayerBigBlind = player.bigBlind;
  const isPlayerSmallBlind = player.smallBlind;
  switch (action?.option) {
    case "call": {
      // handle the first round action here
      // big blind can check/raise
      const callOrCheckOption: PlayerAction =
        preFlop && isPlayerBigBlind
          ? {
              option: "check",
            }
          : {
              option: "call",
              amountToAct: action.amountToAct,
            };
      return [
        callOrCheckOption,
        {
          option: "raise",
          amountToAct: {
            min: computeAmountToRaiseOnRound({
              isBigBlind: isPlayerBigBlind,
              isSmallBlind: isPlayerSmallBlind,
            }),
          },
        },
      ];
    }
    case "raise": {
      return [
        {
          option: "call",
          amountToAct: computeAmountToCallOnEveryRound({
            raiseOnPlay: action.amountToAct.min,
            isBigBlind: isPlayerBigBlind,
            isSmallBlind: isPlayerSmallBlind,
          }),
        },
        {
          option: "raise",
          amountToAct: {
            min: computeAmountToRaiseOnRound({
              raiseOnPlay: action.amountToAct.min,
              isSmallBlind: isPlayerSmallBlind,
              isBigBlind: isPlayerBigBlind,
            }),
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
            min: computeAmountToRaiseOnRound({}),
          },
        },
      ];
    }
    default:
      break;
  }
  if (preFlop) {
    // small blind will have options to call/raise/fold
    return [
      {
        option: "call",
        amountToAct: isPlayerSmallBlind
          ? smallBlindValue
          : computeAmountToCallOnEveryRound({
              isBigBlind: isPlayerBigBlind,
              isSmallBlind: isPlayerSmallBlind,
              raiseOnPlay: bigBlindValue,
            }),
      },
      {
        option: "raise",
        amountToAct: {
          min: computeAmountToRaiseOnRound({
            isSmallBlind: isPlayerSmallBlind,
            isBigBlind: isPlayerBigBlind,
            raiseOnPlay: 4,
          }),
        },
      },
      { option: "fold" },
    ];
  } else {
    return [
      { option: "check" },
      {
        option: "raise",
        amountToAct: {
          min: computeAmountToRaiseOnRound({
            isSmallBlind: isPlayerSmallBlind,
            isBigBlind: isPlayerBigBlind,
          }),
        },
      },
    ];
  }
};

const computeBlinds = (players: Players) => {
  const playersList = toPlayersList(players);
  const smallBlind = playersList.find(({ player }) => player.smallBlind);
  const bigBlind = playersList.find(({ player }) => player.bigBlind);
  if (players.size > 1) {
    if (hands === 1) {
      // In first hand assign the first player to small blind and the second player to big blind
      const player1 = playersList[0];
      players.set(player1.player.id, {
        ...player1,
        player: {
          ...player1.player,
          chips: player1.player.chips - smallBlindValue,
          smallBlind: true,
        },
      });
      if (players.size > 1) {
        const player2 = playersList[1];
        players.set(player2.player.id, {
          ...player2,
          player: {
            ...player2.player,
            chips: player2.player.chips - bigBlindValue,
            bigBlind: true,
          },
        });
      }
    } else {
      // Next hands assingn the small and big in a circular order
      if (smallBlind && bigBlind && smallBlind.next && bigBlind.next) {
        // In the next hand the player next to small blind will be small blind
        // The player next to bigblind will be big blind
        players.set(smallBlind.next.id, {
          ...smallBlind,
          player: {
            ...smallBlind.next,
            chips: smallBlind.next.chips - smallBlindValue,
            smallBlind: true,
            bigBlind: false,
          },
        });
        players.set(bigBlind.next.id, {
          ...bigBlind,
          player: {
            ...bigBlind.next,
            chips: bigBlind.next.chips - bigBlindValue,
            bigBlind: true,
            smallBlind: false,
          },
        });
        if (!isHeadsUp) {
          players.set(smallBlind.player.id, {
            ...smallBlind,
            player: {
              ...smallBlind.player,
              smallBlind: false,
              bigBlind: false,
              button: true,
            },
          });
        }
      }
    }
    pot = 6;
  }
};

const startRound = ({ io, players }: { io: Server; players: Players }) => {
  const playersList = toPlayersList(players);
  let playerToStart;
  isHeadsUp = players.size === 2;
  const bigBlind = playersList.find(({ player: { bigBlind } }) => !!bigBlind);
  const smallBlind = playersList.find(
    ({ player: { smallBlind } }) => !!smallBlind
  );
  if (players.size > 1) {
    if (smallBlind && bigBlind && bigBlind.next) {
      if (isHeadsUp) {
        if (preFlop) {
          // Small blind starts the round
          playerToStart = smallBlind.player;
        } else {
          playerToStart = bigBlind.player;
        }
      } else {
        if (preFlop) {
          // Player next to big blind starts the round
          playerToStart = bigBlind.next;
        } else {
          playerToStart = smallBlind.player;
        }
      }
    }
    if (playerToStart) {
      try {
        io.sockets.emit("on_player_to_act", {
          playerToAct: playerToStart,
          actions: getActOptionsForPlayerToAct(playerToStart, pot),
        });
      } catch (err) {
        // console.error((err as Unkno).message);
      }
    }
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
    ({ player, action: action, customRaise: maxRaise }: OnPlayerActParams) => {
      let hasPlayerRaised = false;
      const currentPlayerId = player.id;
      const currentPlayer = players.get(player.id)!;
      let currentActionInPlay: PlayerAction;
      switch (action.option) {
        case "call": {
          player.chips -= action.amountToAct;
          pot += action.amountToAct;
          player.hasActedThisRound = true;
          currentActionInPlay = action;
          break;
        }
        case "raise": {
          player.chips -= maxRaise || action.amountToAct.min;
          pot += maxRaise || action.amountToAct.min;
          hasPlayerRaised = true;
          player.hasActedThisRound = true;
          currentActionInPlay = {
            option: "raise",
            amountToAct: {
              min: maxRaise || action.amountToAct.min,
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
        ...currentPlayer,
        player: {
          ...player,
        },
      });

      const nextPlayerToAct = players.get(currentPlayer.next!.id)!;
      // If a player raises then all the other players have to act on it and only the initial raiser has finished acting
      if (hasPlayerRaised) {
        players.forEach(
          ({ player, next }) =>
            player.id !== currentPlayerId &&
            players.set(player.id, {
              next,
              player: {
                ...player,
                hasActedThisRound: false,
              },
            })
        );
      }
      const hasAllPlayersActedThisRound = toPlayersList(players).every(
        ({ player }) => player.hasActedThisRound
      );

      if (hasAllPlayersActedThisRound) {
        // if all the players have acted do the community cards
        switch (communityCardsStatus) {
          case "preflop":
            // emit flop cards here
            communityCards = getFlop();
            communityCardsStatus = "flop";
            preFlop = false;
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
              const playerWon = players.get(winner.winningPlayer.id)!;
              players.set(winner.winningPlayer.id, {
                ...playerWon,
                player: {
                  ...winner.winningPlayer,
                  chips: winner.winningPlayer.chips + pot,
                },
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
        players.forEach(({ player, next }, key) =>
          players.set(key, {
            next,
            player: { ...player, hasActedThisRound: false },
          })
        );
        startRound({ io, players });
      } else if (nextPlayerToAct) {
        io.sockets.emit("on_player_to_act", {
          playerToAct: nextPlayerToAct.player,
          actions: getActOptionsForPlayerToAct(
            nextPlayerToAct.player,
            pot,
            currentActionInPlay
          ),
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
  hands++;
  players.forEach(({ player, next }) => {
    players.set(player.id, {
      next,
      player: {
        ...player,
        cards: deal(),
      },
    });
  });
  preFlop = true;
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
