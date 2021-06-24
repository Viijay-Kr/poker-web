import { CommunityCardsParams } from "@poker-web/types";
import { useEffect, useState } from "react";
import { getSocketInstance } from "services/game";

const useCommunityCards = () => {
  const [communityCards, setCommunityCards] = useState<CommunityCardsParams>({
    communityCards: [],
    communityCardsStatus: "preflop",
    potSize: 0,
  });
  const socket = getSocketInstance();
  useEffect(() => {
    socket.on("community_cards", (communityCards: CommunityCardsParams) => {
      setCommunityCards(communityCards);
    });
  }, [socket]);

  return communityCards;
};

export { useCommunityCards };
