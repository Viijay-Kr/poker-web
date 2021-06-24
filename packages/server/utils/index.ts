import { Players } from "@poker-web/types";

const toPlayersList = (players: Players) =>
  Array.from(players, ([_, player]) => player);

export { toPlayersList };
