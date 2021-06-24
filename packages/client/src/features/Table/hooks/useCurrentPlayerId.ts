import { Player } from "@poker-web/types";

export default function useCurrentPlayerId(
  players: Player[],
  currentPlayerName: string
) {
  return players.find(({ name }) => name === currentPlayerName);
}
