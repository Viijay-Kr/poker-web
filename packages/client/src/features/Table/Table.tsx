import React, { useEffect } from "react";
import styled, { css } from "styled-components";
import CurrentPlayer from "components/molecules/CurrentPlayer";
import OpponentPlayer from "components/molecules/Opponents";
import { usePlayerToAct } from "./hooks/useRound";
import { useCommunityCards } from "./hooks/useCommunityCards";
import { useWinner } from "./hooks/useWinner";
import PlayerActions from "features/Table/components/PlayerActions";
import CommunityCards from "features/Table/components/CommunityCards";
import { PlayersList } from "@poker-web/types/table/table";
interface Props {
  players: PlayersList;
  currentPlayerName: string;
}
const Table: React.FC<Props> = (props) => {
  const { players, currentPlayerName } = props;
  const { actions, playerToAct, onAction } = usePlayerToAct();
  const { communityCards, potSize } = useCommunityCards();
  const winner = useWinner();

  useEffect(() => {
    if (winner) {
      alert(`${winner.winningPlayer?.name} won by ${winner.wonBy}`);
    }
  }, [winner]);
  return (
    <TableWrapper>
      {players.map(({ player }, index) => (
        <StyledPlayer playerIndex={index}>
          {player.name === currentPlayerName ? (
            <CurrentPlayer key={player.id} player={player} />
          ) : (
            <OpponentPlayer key={player.id} player={player} />
          )}
        </StyledPlayer>
      ))}
      <CommunityCards potSize={potSize} communityCards={communityCards} />
      {currentPlayerName === playerToAct?.name && (
        <PlayerActions actions={actions} onAction={onAction} />
      )}
    </TableWrapper>
  );
};

const TableWrapper = styled.div`
  height: 100vh;
  width: 100vw;
  position: relative;
`;
const StyledPlayer = styled.div<{ playerIndex?: number }>`
  display: flex;
  flex-direction: column;
  height: 178px;
  width: 241px;
  position: absolute;
  ${(props) => {
    switch (props.playerIndex) {
      case 0: {
        return css`
          bottom: 5%;
          left: 45%;
        `;
      }
      case 1: {
        return css`
          top: 45%;
          left: 5%;
        `;
      }
      case 2: {
        return css`
          top: 5%;
          left: 45%;
        `;
      }
      case 3: {
        return css`
          top: 45%;
          right: 5%;
        `;
      }
      default:
        return "";
    }
  }}}
`;

export default Table;
