import { Card, Kind, Suit } from "@poker-web/types";

const suits: Suit[] = ["C", "D", "H", "S"];
const kinds: Kind[] = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "A",
  "J",
  "K",
  "Q",
];

const cardsWeight: Record<Kind, number> & { 0: number } = {
  "0": 0,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};
let cards: Card[] = [];

const refreshCards = () => {
  cards = [];
  for (let s = 0; s < suits.length; s++) {
    for (let k = 0; k < kinds.length; k++) {
      cards.push({
        suit: suits[s],
        kind: kinds[k],
      });
    }
  }
};

const deal = () => {
  const card1Index = Math.floor(Math.random() * cards.length);
  const card1 = cards[card1Index];
  cards.splice(card1Index, 1);
  const card2Index = Math.floor(Math.random() * cards.length);
  const card2 = cards[card2Index];
  cards.splice(card2Index, 1);

  return [card1, card2];
};

const getFlop = () => {
  const card1Index = Math.floor(Math.random() * cards.length);
  const card1 = cards[card1Index];
  cards.splice(card1Index, 1);
  const card2Index = Math.floor(Math.random() * cards.length);
  const card2 = cards[card2Index];
  cards.splice(card2Index, 1);
  const card3Index = Math.floor(Math.random() * cards.length);
  const card3 = cards[card3Index];
  cards.splice(card3Index, 1);

  return [card1, card2, card3];
};

const getTurn = () => {
  const card1Index = Math.floor(Math.random() * cards.length);
  const card1 = cards[card1Index];
  return card1;
};

const getRiver = () => {
  const card1Index = Math.floor(Math.random() * cards.length);
  const card1 = cards[card1Index];
  return card1;
};

export { refreshCards, deal, getFlop, getTurn, getRiver, cardsWeight };
