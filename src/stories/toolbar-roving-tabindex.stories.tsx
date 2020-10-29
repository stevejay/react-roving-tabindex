import "jspolyfill-array.prototype.findIndex";
import React, { FC, useRef } from "react";
import { Meta } from "@storybook/react/types-6-0";
import {
  RovingTabIndexProvider,
  useRovingTabIndex,
  useFocusEffect,
  KeyDirection
} from "..";
import { Button } from "./button";
import { Toolbar } from "./toolbar";

type ButtonClickHandler = (string) => void;

const ToolbarButton: FC<{
  disabled: boolean;
  onClick: ButtonClickHandler;
}> = ({ disabled, children, onClick }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
    ref,
    disabled
  );

  useFocusEffect(focused, ref);

  return (
    <Button
      ref={ref}
      onKeyDown={handleKeyDown}
      onClick={(event) => {
        handleClick();
        onClick(event);
      }}
      tabIndex={tabIndex}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

type ExampleProps = {
  direction: KeyDirection;
  buttonOneDisabled: boolean;
  buttonTwoDisabled: boolean;
  buttonThreeDisabled: boolean;
  buttonFourDisabled: boolean;
  buttonFiveDisabled: boolean;
  removeButtonFour: boolean;
  onClick: ButtonClickHandler;
};

export const ToolbarExample: FC<ExampleProps> = ({
  direction,
  buttonOneDisabled,
  buttonTwoDisabled,
  buttonThreeDisabled,
  buttonFourDisabled,
  buttonFiveDisabled,
  removeButtonFour,
  onClick
}) => (
  <>
    <Button>Something before to focus on</Button>
    <Toolbar role="toolbar">
      <RovingTabIndexProvider direction={direction} allowFocusOnClick={false}>
        <span>
          <ToolbarButton
            disabled={!!buttonOneDisabled}
            onClick={() => onClick("Button One")}
          >
            Button One
          </ToolbarButton>
        </span>
        <ToolbarButton
          disabled={!!buttonTwoDisabled}
          onClick={() => onClick("Button Two")}
        >
          Button Two
        </ToolbarButton>
        <ToolbarButton
          disabled={!!buttonThreeDisabled}
          onClick={() => onClick("Button Three")}
        >
          Button Three
        </ToolbarButton>
        {!removeButtonFour && (
          <span>
            <span>
              <ToolbarButton
                disabled={!!buttonFourDisabled}
                onClick={() => onClick("Button Four")}
              >
                Button Four
              </ToolbarButton>
            </span>
          </span>
        )}
        <ToolbarButton
          disabled={!!buttonFiveDisabled}
          onClick={() => onClick("Button Five")}
        >
          Button Five
        </ToolbarButton>
      </RovingTabIndexProvider>
    </Toolbar>
    <Button>Something after to focus on</Button>
  </>
);

export default {
  title: "Toolbar RovingTabIndex",
  component: ToolbarExample,
  argTypes: {
    direction: {
      name: "Direction",
      defaultValue: "horizontal"
    },
    onClick: {
      action: "onClick"
    },
    buttonOneDisabled: {
      name: "Disable Button One"
    },
    buttonTwoDisabled: {
      name: "Disable Button Two"
    },
    buttonThreeDisabled: {
      name: "Disable Button Three",
      defaultValue: true
    },
    buttonFourDisabled: {
      name: "Disable Button Four"
    },
    buttonFiveDisabled: {
      name: "Disable Button Five"
    },
    removeButtonFour: {
      name: "Remove Button Four"
    }
  }
} as Meta;
