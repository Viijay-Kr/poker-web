export type Suit = "H" | "S" | "C" | "D";

export type Kind =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";

export interface Card {
  suit: Suit;
  kind: Kind;
}

export type Flush = Partial<
  Record<
    Suit,
    {
      kinds: Kind[];
    }
  >
>;

export type Straight = Partial<Record<Kind, number>>;
