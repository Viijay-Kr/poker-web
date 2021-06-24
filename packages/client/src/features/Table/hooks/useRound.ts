import {
  Player,
  PlayerAction,
  PlayerActionList,
  PlayerToActListenerParams,
} from "@poker-web/types";
import { useEffect, useState } from "react";
import { getSocketInstance } from "services/game";

const usePlayerToAct = (players: Player[]) => {
  const socket = getSocketInstance();

  const [playerToAct, setPlayerToAct] = useState<Player>();
  const [actions, setActions] = useState<PlayerActionList>([]);
  const onAction = (action: PlayerAction, customBet?: number) => {
    // emit the action here
    socket.emit("on_player_act", {
      player: playerToAct,
      action,
      customBet,
    });
  };
  useEffect(() => {
    socket.on(
      "on_player_to_act",
      ({ playerToAct, actions }: PlayerToActListenerParams) => {
        setPlayerToAct(playerToAct);
        setActions(actions);
      }
    );
  }, [socket]);

  return { playerToAct, actions, onAction };
};

export { usePlayerToAct };
