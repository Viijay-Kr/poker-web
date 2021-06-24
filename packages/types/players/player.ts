import { Card } from "../cards/cards";

export interface Player {
  name: string;
  chips: number;
  cards: Card[]; // To be replaced by cards interface
  id: string;
  smallBlind?: boolean;
  bigBlind?: boolean;
  button?: boolean;
  hasFolded: boolean;
  hasActedThisRound: boolean;
}

export type Players = Map<string, Player>;
