import {
  Card,
  Flush,
  Kind,
  Player,
  Players,
  Straight,
  Suit,
} from "@poker-web/types";
import { toPlayersList } from "../utils";
import { cardsWeight } from "./cards";

type PossibleHands =
  | "royal_flush"
  | "straight_flush"
  | "quads"
  | "full_house"
  | "flush"
  | "straight"
  | "trips"
  | "two_pair"
  | "pair"
  | "high_card";

const orderOfHands: PossibleHands[] = [
  "royal_flush",
  "straight_flush",
  "quads",
  "full_house",
  "flush",
  "straight",
  "trips",
  "two_pair",
  "pair",
  "high_card",
];
const computeWinner = (players: Players, communityCards: Card[]) => {
  const handsWeight: Record<
    PossibleHands,
    () => {
      winningPlayer?: Player;
      wonBy: PossibleHands;
    }
  > = {
    high_card: () => {
      let winningPlayer: Player | undefined;
      toPlayersList(players).reduce((acc, player) => {
        const sortedCards = player.cards.sort(
          (a, b) => cardsWeight[b.kind] - cardsWeight[a.kind]
        );
        const currentPlayerWeight = cardsWeight[sortedCards[0].kind];
        if (currentPlayerWeight > acc) {
          winningPlayer = player;
          return currentPlayerWeight;
        }
        return acc;
      }, 0);
      return {
        winningPlayer,
        wonBy: "high_card",
      };
    },
    pair: () => {
      let winningPlayer;
      toPlayersList(players).reduce((acc, player) => {
        let currentPlayerWeight = 0;
        const [card1, card2] = player.cards;
        // find the highest card of the two cards and compute its weight
        let highPair: Array<Card | undefined> = [];
        if (card1.kind === card2.kind) {
          highPair = [card1, card2];
        } else {
          highPair = [
            communityCards.find((card) => card.kind === card1.kind),
            communityCards.find((card) => card.kind === card2.kind),
          ];
        }
        currentPlayerWeight = highPair.reduce(
          (acc, card) => acc + cardsWeight[card?.kind || "0"],
          0
        );
        if (currentPlayerWeight > acc) {
          winningPlayer = player;
          return currentPlayerWeight;
        }
        return acc;
      }, 0);
      return {
        winningPlayer,
        wonBy: "pair",
      };
    },
    two_pair: () => {
      let winningPlayer;
      toPlayersList(players).reduce((acc, player) => {
        let currentPlayerWeight = 0;
        const [card1, card2] = player.cards;
        const firstMatchedPair = communityCards.find(
          (card) => card.kind === card1.kind
        );
        const secondMatchedPair = communityCards.find(
          (card) => card.kind === card2.kind
        );
        if (firstMatchedPair && secondMatchedPair) {
          const bestFiveCards = [
            firstMatchedPair,
            secondMatchedPair,
            secondMatchedPair,
            firstMatchedPair,
          ];
          const restOfSortedCards = communityCards
            .filter(
              (card) =>
                card.kind != firstMatchedPair.kind &&
                card.kind != secondMatchedPair.kind
            )
            .sort((a, b) => cardsWeight[b.kind] - cardsWeight[a.kind]);
          bestFiveCards.push(restOfSortedCards[0]);
          currentPlayerWeight = bestFiveCards.reduce(
            (acc, card) => acc + cardsWeight[card.kind],
            0
          );
        }
        if (currentPlayerWeight > acc) {
          winningPlayer = player;
          return currentPlayerWeight;
        }
        return acc;
      }, 0);
      return {
        winningPlayer,
        wonBy: "two_pair",
      };
    },
    trips: () => {
      let winningPlayer;
      toPlayersList(players).reduce((acc, player) => {
        let currentPlayerWeight = 0;
        const [card1, card2] = player.cards;
        // find the highest three of a kind
        // check if there is a possiblity of set
        const allCards = [card1, card2].concat(communityCards);
        let trips: Partial<Record<Kind, number>> = {};
        allCards.forEach((card) => {
          const kind = card.kind;
          if (trips[kind]) {
            trips[kind]!++;
          } else {
            trips[card.kind] = 1;
          }
        });
        currentPlayerWeight = (Object.keys(trips) as Kind[]).reduce(
          (acc, kind) => {
            if (trips[kind] === 3) {
              return acc + cardsWeight[kind];
            }
            return acc;
          },
          0
        );
        if (currentPlayerWeight && currentPlayerWeight > acc) {
          winningPlayer = player;
          return currentPlayerWeight;
        }
        return acc;
      }, 0);
      return {
        winningPlayer,
        wonBy: "trips",
      };
    },
    quads: () => {
      // Handle four of a kind here
      let winningPlayer;
      toPlayersList(players).reduce((acc, player) => {
        let currentPlayerWeight = 0;
        const [card1, card2] = player.cards;
        const allCards = [card1, card2].concat(communityCards);
        let quads: Partial<Record<Kind, number>> = {};
        allCards.forEach((card) => {
          const kind = card.kind;
          if (quads[kind]) {
            quads[kind]!++;
          } else {
            quads[card.kind] = 1;
          }
        });
        currentPlayerWeight = (Object.keys(quads) as Kind[]).reduce(
          (acc, kind) => {
            if (quads[kind] === 4) {
              return acc + cardsWeight[kind];
            }
            return acc;
          },
          0
        );
        if (currentPlayerWeight && currentPlayerWeight > acc) {
          winningPlayer = player;
          return currentPlayerWeight;
        }
        return acc;
      }, 0);
      return {
        winningPlayer,
        wonBy: "quads",
      };
    },
    full_house: () => {
      let winningPlayer;
      toPlayersList(players).reduce((acc, player) => {
        let currentPlayerWeight = 0;
        const [card1, card2] = player.cards;
        let fullHouse: Partial<Record<Kind, number>> = {};
        const allCards = [card1, card2].concat(communityCards);
        allCards.forEach((card) => {
          const kind = card.kind;
          if (fullHouse[kind]) {
            fullHouse[kind]!++;
          } else {
            fullHouse[card.kind] = 1;
          }
        });
        // reduce the hash to only 2 and 3 entries
        const fullHouseSet = (Object.keys(fullHouse) as Kind[]).reduce<
          Array<{
            kind: Kind;
            count: number;
          }>
        >((acc, kind) => {
          if (fullHouse[kind] === 2 || fullHouse[kind] === 3) {
            return acc.concat({
              kind,
              count: fullHouse[kind]!,
            });
          }
          return acc;
        }, []);
        const fullHouseSize = fullHouseSet.reduce(
          (acc, { count }) => acc + count,
          0
        );
        if (fullHouseSize === 5) {
          currentPlayerWeight = fullHouseSet.reduce(
            (acc, { kind, count }) => acc + cardsWeight[kind] * count,
            0
          );
        }
        if (currentPlayerWeight > acc) {
          winningPlayer = player;
          return currentPlayerWeight;
        }
        return acc;
      }, 0);
      return {
        winningPlayer,
        wonBy: "full_house",
      };
    },
    flush: () => {
      let winningPlayer;
      toPlayersList(players).reduce((acc, player) => {
        let currentPlayerWeight = 0;
        const [card1, card2] = player.cards;
        let flush: Flush = {};
        const allCards = [card1, card2].concat(communityCards);
        allCards.forEach((card) => {
          const suit = card.suit;
          if (flush[suit]) {
            flush[suit] = {
              ...flush[suit],
              kinds: flush[suit]!.kinds.concat(card.kind),
            };
          } else {
            flush[suit] = {
              kinds: [card.kind],
            };
          }
        });
        const flushSet = (
          Object.values(flush) as Array<{
            kinds: Kind[];
          }>
        ).find((flush) => flush.kinds.length >= 5);
        if (flushSet) {
          const highestKind = flushSet.kinds.sort(
            (a, b) => cardsWeight[b] - cardsWeight[a]
          );
          currentPlayerWeight = cardsWeight[highestKind[0]];
        }
        // reduce the hash to only 2 and 3 entries
        if (currentPlayerWeight > acc) {
          winningPlayer = player;
          return currentPlayerWeight;
        }
        return acc;
      }, 0);
      return {
        winningPlayer,
        wonBy: "flush",
      };
    },
    straight_flush: () => ({ wonBy: "straight_flush" }),
    straight: () => {
      let winningPlayer: Player | undefined;
      toPlayersList(players).reduce((acc, player) => {
        let currentPlayerWeight = 0;
        const allCards = player.cards
          .concat(communityCards)
          .sort((a, b) => cardsWeight[b.kind] - cardsWeight[a.kind]);
        // Find the range of indices using the weight
        let start = 0;
        let startingWeight = cardsWeight[allCards[0].kind];
        let end = 0;
        allCards.forEach((card, index) => {
          const currentWeight = cardsWeight[card.kind];
          if (end - start === 4) {
            return;
          }
          if (startingWeight - 1 === currentWeight) {
            //
            startingWeight = currentWeight;
            end++;
          } else {
            startingWeight = currentWeight;
            start = index;
            end = start;
          }
        });
        if (end - start === 4) {
          for (let i = start; i < end; i++) {
            currentPlayerWeight += cardsWeight[allCards[i].kind];
          }
        }
        if (currentPlayerWeight > acc) {
          winningPlayer = player;
          return currentPlayerWeight;
        }
        return acc;
      }, 0);
      return {
        winningPlayer,
        wonBy: "straight",
      };
    },
    royal_flush: () => ({ wonBy: "royal_flush" }),
  };
  for (let i = 0; i < orderOfHands.length; i++) {
    const handFunc = handsWeight[orderOfHands[i]];
    const winner = handFunc();
    if (winner.winningPlayer) {
      return winner;
    }
  }
};

export { computeWinner };
