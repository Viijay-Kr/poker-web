import React, { useState } from "react";
import joinTable from "services/game";
import { Player } from "@poker-web/types";
import Table from "features/Table/Table";
function App() {
  const [joinedTable, setJoinedTable] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [players, setPlayers] = useState<Player[]>();
  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const playerName = data.get("player-name");
    if (playerName !== null) {
      joinTable(playerName.toString(), (players) => {
        setJoinedTable(true);
        setCurrentPlayer(playerName.toString());
        setPlayers(players);
      });
    }
  };
  return (
    <div className="App">
      <header className="App-header"></header>
      {!joinedTable && (
        <form onSubmit={onSubmit}>
          <input type="text" name="player-name" />
          <input type="submit" value="Enter Table" />
        </form>
      )}
      {players && <Table players={players} currentPlayerName={currentPlayer} />}
    </div>
  );
}

export default App;
