import React from "react";
import { Suit, Kind } from "@poker-web/types";
import styled, { css } from "styled-components";
import spade from "assets/spades.svg";
import clubs from "assets/clubs.svg";
import diamond from "assets/diamonds.svg";
import heart from "assets/hearts.svg";

interface Props {
  suit: Suit;
  kind: Kind;
  cardIndex?: number;
}
const Card: React.FC<Props> = (props) => {
  const { suit, kind, cardIndex } = props;

  return (
    <StyledCard cardIndex={cardIndex}>
      <StyledSuit suit={suit} />
      <StyledKind>{kind}</StyledKind>
    </StyledCard>
  );
};

export const StyledCard = styled.div<{ cardIndex?: number }>`
  box-sizing: border-box;
  height: 120px;
  width: 90px;
  border-radius: 8px;
  background-color: #fff;
  border: 2px solid #1e1c1c;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  z-index: 100;
  ${(props) =>
    props.cardIndex === 1
      ? css`
          transform: rotate(22deg);
          z-index: 99;
          margin-left: -20px;
          margin-top: 10px;
        `
      : ""};
`;

const StyledKind = styled.span`
  font-family: "Adobe Caslon Pro";
  font-size: 36px;
  font-weight: 600;
  line-height: 36px;
`;

const SuitIconMap: Record<Suit, any> = {
  C: clubs,
  D: diamond,
  H: heart,
  S: spade,
};

const SuitColorMap: Record<Suit, "red" | "black"> = {
  C: "black",
  S: "black",
  H: "red",
  D: "red",
};

const StyledSuit = styled.i<{ suit: Suit }>`
  height: 40px;
  width: 40px;
  mask-image: url(${(props) => SuitIconMap[props.suit]});
  mask-size: 40px;
  background: ${(props) => SuitColorMap[props.suit]};
  background-repeat: no-repeat;
`;

export default Card;
