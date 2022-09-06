import { Player, Players } from "@poker-web/types";
import { defineGlobals, getActOptionsForPlayerToAct } from "../rounds";

describe("Test options for player to act in heads up preFlop", () => {
  const players: Players = new Map();
  beforeAll(() => {
    const player1: Player = {
      name: "Vijay",
      smallBlind: true,
      chips: 398,
      id: "123",
      cards: [
        { suit: "H", kind: "A" },
        { suit: "D", kind: "7" },
      ],
      hasActedThisRound: false,
      hasFolded: false,
    };
    const player2: Player = {
      name: "Vijayk",
      bigBlind: true,
      chips: 396,
      id: "1234",
      cards: [
        { suit: "C", kind: "A" },
        { suit: "S", kind: "7" },
      ],
      hasActedThisRound: false,
      hasFolded: false,
    };
    players.set("123", {
      player: player1,
      next: player2,
    });
    players.set("1234", {
      player: player2,
      next: player1,
    });
    defineGlobals(players);
  });
  it("should return correct options for small blind to act preflop", () => {
    const optionsToAct = getActOptionsForPlayerToAct(
      players.get("123")?.player!,
      6
    );

    expect(optionsToAct).toEqual([
      {
        option: "call",
        amountToAct: 2,
      },
      {
        option: "raise",
        amountToAct: {
          min: 6,
        },
      },
      {
        option: "fold",
      },
    ]);
  });
  it("should return correct options for big blind to act when small blind calls preflop", () => {
    const optionsToAct = getActOptionsForPlayerToAct(
      players.get("1234")?.player!,
      8,
      {
        option: "call",
        amountToAct: 2,
      }
    );
    expect(optionsToAct).toEqual([
      { option: "check" },
      {
        option: "raise",
        amountToAct: {
          min: 4,
        },
      },
    ]);
  });

  it("should return correct actions for bigblind when small blind min raises preflop", () => {
    const optionsToAct = getActOptionsForPlayerToAct(
      players.get("1234")?.player!,
      12,
      {
        option: "raise",
        amountToAct: {
          min: 6,
        },
      }
    );
    expect(optionsToAct).toEqual([
      {
        option: "call",
        amountToAct: 4,
      },
      {
        option: "raise",
        amountToAct: {
          min: 8,
        },
      },
      { option: "fold" },
    ]);
  });

  it("should return correct options for small blind when big blind min raises preflop", () => {
    const optionsToAct = getActOptionsForPlayerToAct(
      players.get("123")?.player!,
      12,
      {
        option: "raise",
        amountToAct: {
          min: 4,
        },
      }
    );

    expect(optionsToAct).toEqual([
      {
        option: "call",
        amountToAct: 4,
      },
      {
        option: "raise",
        amountToAct: {
          min: 6,
        },
      },
      {
        option: "fold",
      },
    ]);
  });
});

describe("Test options for players to act in a non heads up table pre flop", () => {
  const players: Players = new Map();
  beforeAll(() => {
    const player1: Player = {
      name: "Vijay",
      smallBlind: true,
      chips: 398,
      id: "123",
      cards: [
        { suit: "H", kind: "A" },
        { suit: "D", kind: "7" },
      ],
      hasActedThisRound: false,
      hasFolded: false,
    };
    const player2: Player = {
      name: "Vijayk",
      bigBlind: true,
      chips: 396,
      id: "1234",
      cards: [
        { suit: "C", kind: "A" },
        { suit: "S", kind: "7" },
      ],
      hasActedThisRound: false,
      hasFolded: false,
    };
    const player3: Player = {
      name: "Vijaykis",
      chips: 400,
      id: "1235",
      cards: [
        { suit: "C", kind: "A" },
        { suit: "S", kind: "7" },
      ],
      hasActedThisRound: false,
      hasFolded: false,
    };
    players.set("123", {
      player: player1,
      next: player2,
    });
    players.set("1234", {
      player: player2,
      next: player3,
    });
    players.set("1235", {
      player: player3,
      next: player1,
    });
    defineGlobals(players);
  });

  it("should return correct options for player under the gun to act preflop", () => {
    const optionsToAct = getActOptionsForPlayerToAct(
      players.get("1235")?.player!,
      6
    );

    expect(optionsToAct).toEqual([
      {
        option: "call",
        amountToAct: 4,
      },
      {
        option: "raise",
        amountToAct: {
          min: 8,
        },
      },
      {
        option: "fold",
      },
    ]);
  });

  it("should return correct options when a min raise is made pre flop by either small or big blind", () => {
    const optionsToAct = getActOptionsForPlayerToAct(
      players.get("1235")?.player!,
      16,
      {
        option: "raise",
        amountToAct: {
          min: 4,
        },
      }
    );

    expect(optionsToAct).toEqual([
      {
        option: "call",
        amountToAct: 4,
      },
      {
        option: "raise",
        amountToAct: {
          min: 6,
        },
      },
      {
        option: "fold",
      },
    ]);
  });

  it("should return correct options for small blind when there is a raise made preflop", () => {
    const optionsToAct = getActOptionsForPlayerToAct(
      players.get("123")?.player!,
      14,
      {
        option: "raise",
        amountToAct: {
          min: 8,
        },
      }
    );

    expect(optionsToAct).toEqual([
      {
        option: "call",
        amountToAct: 6,
      },
      {
        option: "raise",
        amountToAct: {
          min: 10,
        },
      },
      {
        option: "fold",
      },
    ]);
  });

  it("should return correct options for big blind when there is a raise made preflop", () => {
    const optionsToAct = getActOptionsForPlayerToAct(
      players.get("1234")?.player!,
      14,
      {
        option: "raise",
        amountToAct: {
          min: 8,
        },
      }
    );

    expect(optionsToAct).toEqual([
      {
        option: "call",
        amountToAct: 4,
      },
      {
        option: "raise",
        amountToAct: {
          min: 12,
        },
      },
      {
        option: "fold",
      },
    ]);
  });
});
