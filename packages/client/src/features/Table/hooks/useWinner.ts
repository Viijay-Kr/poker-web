import { useEffect, useState } from "react";
import { getSocketInstance } from "services/game";
import { Player } from "@poker-web/types";
const useWinner = () => {
  const [winner, setWinner] = useState<{
    winningPlayer?: Player;
    wonBy: string;
  }>();
  const socket = getSocketInstance();
  useEffect(() => {
    socket.on("winner", ({ winner }) => {
      setWinner(winner);
    });
  });

  return winner;
};

export { useWinner };
