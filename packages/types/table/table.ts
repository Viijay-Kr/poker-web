import { Card } from "../cards/cards";
import { Player } from "../players/player";

export type PlayerEntity = { player: Player; next: Player | null };
export type PlayersList = Array<PlayerEntity>;
export type JoinedTableFunc = (players: PlayersList) => void;
export type Actions = "call" | "fold" | "raise" | "check";

export interface JoinedTable {
  players: PlayersList;
}

export type PlayerAction =
  | {
      option: "call";
      amountToAct: number;
    }
  | {
      option: "fold";
    }
  | {
      option: "raise";
      amountToAct: {
        min: number;
      };
    }
  | {
      option: "check";
    };

export type PlayerActionList = Array<PlayerAction>;

export interface PlayerToActListenerParams {
  playerToAct: Player;
  actions: PlayerActionList;
}

export interface OnPlayerActParams {
  player: Player;
  action: PlayerAction;
  // TODO refactor this
  customRaise?: number;
}

export type CommunityCardsStatus = "preflop" | "flop" | "turn" | "river";

export interface CommunityCardsParams {
  communityCards: Card[];
  communityCardsStatus: CommunityCardsStatus;
  potSize: number;
}
