import React from "react";
import chips from "assets/chips.svg";
import styled from "styled-components";

interface Props {
  count: number;
}

const Chips: React.FC<Props> = (props) => {
  return (
    <>
      <ChipsContainer>
        <ChipsWrapper>
          <StyledChip></StyledChip>
          <StyledChip></StyledChip>
          <StyledChip></StyledChip>
        </ChipsWrapper>
        <ChipsCount>{props.count}</ChipsCount>
      </ChipsContainer>
    </>
  );
};

const ChipsContainer = styled.div`
  display: flex;
  height: 69px;
  width: 70px;
  flex-direction: column;
  margin-left: 10px;
`;
const ChipsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`;
const StyledChip = styled.i`
  height: 28px;
  width: 28px;
  mask-size: 28px;
  mask-image: url(${chips});
  background: #000;
  background-repeat: no-repeat;
`;

const ChipsCount = styled.span`
  font-size: 22px;
  font-weight: 700;
  line-height: 34px;
  text-align: center;
`;

export default Chips;
