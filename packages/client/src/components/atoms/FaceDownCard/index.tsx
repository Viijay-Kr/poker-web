import React from "react";
import faceDown from "assets/face-down.svg";
import styled, { css } from "styled-components";

const FaceDownCard: React.FC<{ cardIndex: number }> = ({ cardIndex }) => {
  return <StyledFaceDownCard cardIndex={cardIndex} />;
};

const StyledFaceDownCard = styled.i<{ cardIndex: number }>`
  height: 120px;
  width: 90px;
  background-image: url(${faceDown});
  background-repeat: no-repeat;
  z-index: 100;
  ${(props) =>
    props.cardIndex === 1
      ? css`
          transform: rotate(20deg);
          z-index: 99;
          margin-top: 0px;
          margin-left: -80px;
        `
      : ""}
`;

export default FaceDownCard;
