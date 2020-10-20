import "jspolyfill-array.prototype.findIndex";
import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { RovingTabIndexProvider, useRovingTabIndex, useFocusEffect } from "..";
import { Button } from "./button";
import { Toolbar } from "./toolbar";

type ButtonClickHandler = (
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>
) => void;

const ToolbarButton: React.FC<{
  disabled: boolean;
  id?: string;
  onClick: ButtonClickHandler;
}> = ({ disabled, id, children, onClick }) => {
  const idRef = React.useRef<string>(id);
  const ref = React.useRef<HTMLButtonElement>(null);
  const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
    ref,
    disabled,
    idRef.current ? { id: idRef.current } : undefined
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
  buttonOneDisabled: boolean;
  onButtonOneClicked: ButtonClickHandler;
  buttonTwoDisabled: boolean;
  onButtonTwoClicked: ButtonClickHandler;
  buttonThreeDisabled: boolean;
  onButtonThreeClicked: ButtonClickHandler;
  buttonFourDisabled: boolean;
  onButtonFourClicked: ButtonClickHandler;
  buttonFiveDisabled: boolean;
  onButtonFiveClicked: ButtonClickHandler;
  removeButtonFour: boolean;
};

export const WithoutCustomIds: React.FC<ExampleProps> = ({
  buttonOneDisabled,
  onButtonOneClicked,
  buttonTwoDisabled,
  onButtonTwoClicked,
  buttonThreeDisabled,
  onButtonThreeClicked,
  buttonFourDisabled,
  onButtonFourClicked,
  buttonFiveDisabled,
  onButtonFiveClicked,
  removeButtonFour
}) => (
  <>
    <Button>Something before to focus on</Button>
    <Toolbar role="toolbar">
      <RovingTabIndexProvider>
        <span>
          <ToolbarButton
            disabled={!!buttonOneDisabled}
            onClick={onButtonOneClicked}
          >
            Button One
          </ToolbarButton>
        </span>
        <ToolbarButton
          disabled={!!buttonTwoDisabled}
          onClick={onButtonTwoClicked}
        >
          Button Two
        </ToolbarButton>
        <ToolbarButton
          disabled={!!buttonThreeDisabled}
          onClick={onButtonThreeClicked}
        >
          Button Three
        </ToolbarButton>
        {!removeButtonFour && (
          <span>
            <span>
              <ToolbarButton
                disabled={!!buttonFourDisabled}
                onClick={onButtonFourClicked}
              >
                Button Four
              </ToolbarButton>
            </span>
          </span>
        )}
        <ToolbarButton
          disabled={!!buttonFiveDisabled}
          onClick={onButtonFiveClicked}
        >
          Button Five
        </ToolbarButton>
      </RovingTabIndexProvider>
    </Toolbar>
    <Button>Something after to focus on</Button>
  </>
);

export const WithCustomIds: React.FC<ExampleProps> = ({
  buttonOneDisabled,
  onButtonOneClicked,
  buttonTwoDisabled,
  onButtonTwoClicked,
  buttonThreeDisabled,
  onButtonThreeClicked,
  buttonFourDisabled,
  onButtonFourClicked,
  buttonFiveDisabled,
  onButtonFiveClicked,
  removeButtonFour
}) => (
  <>
    <Button>Something before to focus on</Button>
    <Toolbar role="toolbar">
      <RovingTabIndexProvider>
        <span>
          <ToolbarButton
            id="button-1"
            disabled={!!buttonOneDisabled}
            onClick={onButtonOneClicked}
          >
            Button One
          </ToolbarButton>
        </span>
        <ToolbarButton
          id="button-2"
          disabled={!!buttonTwoDisabled}
          onClick={onButtonTwoClicked}
        >
          Button Two
        </ToolbarButton>
        <ToolbarButton
          id="button-3"
          disabled={!!buttonThreeDisabled}
          onClick={onButtonThreeClicked}
        >
          Button Three
        </ToolbarButton>
        {!removeButtonFour && (
          <span>
            <span>
              <ToolbarButton
                id="button-4"
                disabled={!!buttonFourDisabled}
                onClick={onButtonFourClicked}
              >
                Button Four
              </ToolbarButton>
            </span>
          </span>
        )}
        <ToolbarButton
          id="button-5"
          disabled={!!buttonFiveDisabled}
          onClick={onButtonFiveClicked}
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
  component: WithoutCustomIds,
  argTypes: {
    onButtonOneClicked: { table: { disable: true } },
    onButtonTwoClicked: { table: { disable: true } },
    onButtonThreeClicked: { table: { disable: true } },
    onButtonFourClicked: { table: { disable: true } },
    onButtonFiveClicked: { table: { disable: true } },
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
  },
  parameters: { actions: { argTypesRegex: "^on.*" } }
} as Meta;
