import React from "react";
import { Player } from "@poker-web/types";
import Card from "components/atoms/Card";
import Chips from "components/atoms/Chips";
import styled from "styled-components";
interface Props {
  player: Player;
}

const PlayerSeat: React.FC<Props> = (props) => {
  const {
    player: { cards, chips, name },
  } = props;

  return (
    <>
      <StackContainer>
        {cards.map(({ suit, kind }, index) => (
          <Card suit={suit} key={index} kind={kind} cardIndex={index} />
        ))}
        <Chips count={chips} />
      </StackContainer>
      <PlayerName>{name}</PlayerName>
    </>
  );
};

const PlayerName = styled.span`
  font-family: "Al Bayan";
  font-size: 22px;
  font-weight: 700;
  line-height: 34px;
  text-align: center;
  margin-top: 10px;
`;

const StackContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

export default PlayerSeat;
