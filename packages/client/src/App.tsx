import React, { useState } from "react";
import joinTable from "./services/game";

function App() {
  const [joinedTable, setJoinedTable] = useState(false);
  const [playersCount, setPlayersCount] = useState(0);
  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const playerName = data.get("player-name");
    if (playerName !== null) {
      joinTable(playerName.toString(), (playersCount) => {
        setJoinedTable(true);
        setPlayersCount(playersCount);
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
    </div>
  );
}

export default App;
