import React from "react";
import { Card } from "@poker-web/types";
import styled from "styled-components";
import CardComponent from "components/atoms/Card";
import Chips from "components/atoms/Chips";
interface Props {
  communityCards: Card[];
  potSize: number;
}

const CommunityCards: React.FC<Props> = (props) => {
  const { communityCards, potSize } = props;

  return (
    <CommunityCardsWrapper>
      {communityCards.length > 0 && (
        <StackContainer>
          <Chips count={potSize} />
        </StackContainer>
      )}
      {communityCards.map((card) => (
        <div style={{ marginRight: 20 }}>
          <CardComponent suit={card.suit} kind={card.kind} />
        </div>
      ))}
    </CommunityCardsWrapper>
  );
};

const CommunityCardsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  top: 45%;
  left: 35%;
  position: absolute;
`;

const StackContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

export default CommunityCards;
