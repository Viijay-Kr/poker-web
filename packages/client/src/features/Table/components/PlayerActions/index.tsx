import React, { useCallback, useRef } from "react";
import styled from "styled-components";
import { PlayerAction, PlayerActionList } from "@poker-web/types";

interface Props {
  actions: PlayerActionList;
  onAction: (action: PlayerAction, customBet?: number) => void;
}
const PlayerActions: React.FC<Props> = (props) => {
  const { actions, onAction } = props;
  const raiseInputRef = useRef<HTMLInputElement>(null);
  const onRaise = useCallback(
    (action) => {
      const customRaise = raiseInputRef.current?.value;
      if (customRaise) {
        onAction(action, parseInt(customRaise, 10));
      } else {
        onAction(action);
      }
    },
    [onAction]
  );
  return (
    <ActionContainer>
      {actions.map((action) => {
        switch (action.option) {
          case "call":
            return (
              <ActionButtonWrapper>
                <ActionButton onClick={() => onAction(action)}>
                  Call
                </ActionButton>
                <BetAmount>{action.amountToAct}</BetAmount>
              </ActionButtonWrapper>
            );
          case "raise":
            return (
              <ActionButtonWrapper>
                <ActionButton onClick={() => onRaise(action)}>
                  Raise
                </ActionButton>
                <BetAmount>{action.amountToAct.min}</BetAmount>
                <span style={{ marginBottom: "10px" }}>or</span>
                <input ref={raiseInputRef} type="number" name="raise" />
              </ActionButtonWrapper>
            );
          case "fold":
            return (
              <ActionButtonWrapper>
                <ActionButton onClick={() => onAction(action)}>
                  Fold
                </ActionButton>
              </ActionButtonWrapper>
            );
          case "check":
            return (
              <ActionButtonWrapper>
                <ActionButton onClick={() => onAction(action)}>
                  Check
                </ActionButton>
              </ActionButtonWrapper>
            );
          default:
            return null;
        }
      })}
    </ActionContainer>
  );
};

const ActionButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 25px;
`;
const ActionButton = styled.button`
  height: 33px;
  width: 91px;
  border-radius: 8px;
  background-color: rgba(255, 91, 0, 0.94);
  outline: none;
  border: none;
`;

const BetAmount = styled.span`
  font-size: 18px;
  line-height: 18px;
  text-align: center;
  color: #060606;
  margin-top: 10px;
`;
const ActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  position: absolute;
  bottom: 5%;
  right: 25%;
`;

export default PlayerActions;
