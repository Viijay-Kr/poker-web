import { Card, Players } from "@poker-web/types";
import { computeWinner } from "../compute_winner";

describe.skip("Test compute winner", () => {
  it("should return a winner player based on high card", () => {
    const players: Players = new Map();
    players.set("player_1", {
      name: "Vij",
      id: "player_1",
      cards: [
        { kind: "10", suit: "D" },
        { kind: "K", suit: "H" },
      ],
      hasActedThisRound: true,
      chips: 334,
      hasFolded: false,
    });
    players.set("player_2", {
      name: "Vik",
      id: "player_2",
      cards: [
        { kind: "6", suit: "D" },
        { kind: "J", suit: "H" },
      ],
      hasActedThisRound: true,
      chips: 334,
      hasFolded: false,
    });
    const communityCards: Card[] = [
      { kind: "8", suit: "H" },
      { kind: "5", suit: "C" },
      { kind: "2", suit: "D" },
      { kind: "Q", suit: "S" },
      { kind: "A", suit: "C" },
    ];
    const winner = computeWinner(players, communityCards);
    expect(winner?.winningPlayer?.name).toEqual("Vij");
  });
  it("should return a winner player based on highest pair", () => {
    const players: Players = new Map();
    players.set("player_1", {
      name: "Vij",
      id: "player_1",
      cards: [
        { kind: "K", suit: "D" },
        { kind: "K", suit: "H" },
      ],
      hasActedThisRound: true,
      chips: 334,
      hasFolded: false,
    });
    players.set("player_2", {
      name: "Vik",
      id: "player_2",
      cards: [
        { kind: "6", suit: "D" },
        { kind: "J", suit: "H" },
      ],
      hasActedThisRound: true,
      chips: 334,
      hasFolded: false,
    });
    const communityCards: Card[] = [
      { kind: "10", suit: "H" },
      { kind: "5", suit: "C" },
      { kind: "2", suit: "D" },
      { kind: "J", suit: "S" },
      { kind: "A", suit: "C" },
    ];
    expect(computeWinner(players, communityCards)).toEqual({
      winningPlayer: {
        name: "Vij",
        id: "player_1",
        cards: [
          { kind: "K", suit: "D" },
          { kind: "K", suit: "H" },
        ],
        hasActedThisRound: true,
        chips: 334,
        hasFolded: false,
      },
      wonBy: "pair",
    });
  });
  it("should return a winner player based on highest two pair", () => {
    const players: Players = new Map();
    players.set("player_1", {
      name: "Vij",
      id: "player_1",
      cards: [
        { kind: "10", suit: "C" },
        { kind: "A", suit: "H" },
      ],
      hasActedThisRound: true,
      chips: 334,
      hasFolded: false,
    });
    players.set("player_2", {
      name: "Vik",
      id: "player_2",
      cards: [
        { kind: "6", suit: "D" },
        { kind: "A", suit: "H" },
      ],
      hasActedThisRound: true,
      chips: 334,
      hasFolded: false,
    });
    const communityCards: Card[] = [
      { kind: "10", suit: "H" },
      { kind: "6", suit: "C" },
      { kind: "2", suit: "D" },
      { kind: "J", suit: "S" },
      { kind: "A", suit: "C" },
    ];
    const winner = computeWinner(players, communityCards);
    expect(winner?.winningPlayer?.name).toEqual("Vij");
    expect(winner?.wonBy).toEqual("two_pair");
  });
  it("should return a winner player based on highest tips/set", () => {
    const players: Players = new Map();
    players.set("player_1", {
      name: "Vij",
      id: "player_1",
      cards: [
        { kind: "Q", suit: "C" },
        { kind: "A", suit: "H" },
      ],
      hasActedThisRound: true,
      chips: 334,
      hasFolded: false,
    });
    players.set("player_2", {
      name: "Vik",
      id: "player_2",
      cards: [
        { kind: "4", suit: "D" },
        { kind: "K", suit: "D" },
      ],
      hasActedThisRound: true,
      chips: 334,
      hasFolded: false,
    });
    const communityCards: Card[] = [
      { kind: "Q", suit: "H" },
      { kind: "6", suit: "C" },
      { kind: "10", suit: "D" },
      { kind: "K", suit: "S" },
      { kind: "K", suit: "C" },
    ];
    const winner = computeWinner(players, communityCards);
    // expect(winner?.winningPlayer?.name).toEqual("Vik");
    expect(winner?.wonBy).toEqual("trips");
  });
  it("should return a winner player based on highest Quads", () => {
    const players: Players = new Map();
    players.set("player_1", {
      name: "Vij",
      id: "player_1",
      cards: [
        { kind: "Q", suit: "C" },
        { kind: "Q", suit: "D" },
      ],
      hasActedThisRound: true,
      chips: 334,
      hasFolded: false,
    });
    players.set("player_2", {
      name: "Vik",
      id: "player_2",
      cards: [
        { kind: "K", suit: "H" },
        { kind: "K", suit: "D" },
      ],
      hasActedThisRound: true,
      chips: 334,
      hasFolded: false,
    });
    const communityCards: Card[] = [
      { kind: "Q", suit: "H" },
      { kind: "Q", suit: "S" },
      { kind: "K", suit: "S" },
      { kind: "4", suit: "D" },
      { kind: "K", suit: "C" },
    ];
    const winner = computeWinner(players, communityCards);
    expect(winner?.winningPlayer?.name).toEqual("Vik");
    expect(winner?.wonBy).toEqual("quads");
  });
  it("should return a winner player based on highest full house", () => {
    const players: Players = new Map();
    players.set("player_1", {
      name: "Vij",
      id: "player_1",
      cards: [
        { kind: "Q", suit: "C" },
        { kind: "Q", suit: "D" },
      ],
      hasActedThisRound: true,
      chips: 334,
      hasFolded: false,
    });
    players.set("player_2", {
      name: "Vik",
      id: "player_2",
      cards: [
        { kind: "A", suit: "S" },
        { kind: "K", suit: "D" },
      ],
      hasActedThisRound: true,
      chips: 334,
      hasFolded: false,
    });
    const communityCards: Card[] = [
      { kind: "Q", suit: "H" },
      { kind: "6", suit: "S" },
      { kind: "K", suit: "S" },
      { kind: "4", suit: "D" },
      { kind: "K", suit: "C" },
    ];
    const winner = computeWinner(players, communityCards);
    expect(winner?.winningPlayer?.name).toEqual("Vij");
    expect(winner?.wonBy).toEqual("full_house");
  });

  it("should return a winner player based on highest flush", () => {
    const players: Players = new Map();
    players.set("player_1", {
      name: "Vij",
      id: "player_1",
      cards: [
        { kind: "Q", suit: "C" },
        { kind: "K", suit: "C" },
      ],
      hasActedThisRound: true,
      chips: 334,
      hasFolded: false,
    });
    players.set("player_2", {
      name: "Vik",
      id: "player_2",
      cards: [
        { kind: "A", suit: "C" },
        { kind: "2", suit: "C" },
      ],
      hasActedThisRound: true,
      chips: 334,
      hasFolded: false,
    });
    const communityCards: Card[] = [
      { kind: "J", suit: "C" },
      { kind: "6", suit: "C" },
      { kind: "10", suit: "C" },
      { kind: "4", suit: "C" },
      { kind: "3", suit: "C" },
    ];
    const winner = computeWinner(players, communityCards);
    expect(winner?.winningPlayer?.name).toEqual("Vik");
    expect(winner?.wonBy).toEqual("flush");
  });

  it.only("should return a winner player based on nut straight", () => {
    const players: Players = new Map();
    players.set("player_1", {
      name: "Vijay",
      id: "player_1",
      cards: [
        { kind: "3", suit: "H" },
        { kind: "2", suit: "C" },
      ],
      hasActedThisRound: true,
      chips: 334,
      hasFolded: false,
    });
    players.set("player_2", {
      name: "Dev",
      id: "player_2",
      cards: [
        { kind: "J", suit: "D" },
        { kind: "K", suit: "D" },
      ],
      hasActedThisRound: true,
      chips: 334,
      hasFolded: false,
    });
    const communityCards: Card[] = [
      { kind: "7", suit: "H" },
      { kind: "A", suit: "H" },
      { kind: "6", suit: "H" },
      { kind: "5", suit: "C" },
      { kind: "4", suit: "D" },
    ];
    const winner = computeWinner(players, communityCards);
    expect(winner?.winningPlayer?.name).toEqual("Vijay");
    expect(winner?.wonBy).toEqual("straight");
  });
});
