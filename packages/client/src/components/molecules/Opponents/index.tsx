import React from "react";
import { Player } from "@poker-web/types";
import Chips from "components/atoms/Chips";
import styled from "styled-components";
import FaceDownCard from "components/atoms/FaceDownCard";
interface Props {
  player: Player;
}

const OpponentPlayer: React.FC<Props> = (props) => {
  const {
    player: { cards, chips, name },
  } = props;

  return (
    <>
      <PlayerName>{name}</PlayerName>
      <StackContainer>
        <Chips count={chips} />
        {cards.map((_, index) => (
          <FaceDownCard key={index} cardIndex={index} />
        ))}
      </StackContainer>
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
  margin-top: 10px;
`;

export default OpponentPlayer;
