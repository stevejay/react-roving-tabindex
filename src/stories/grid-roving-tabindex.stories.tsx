import "jspolyfill-array.prototype.findIndex";
import React, { FC, useRef } from "react";
import { Meta } from "@storybook/react/types-6-0";
import { RovingTabIndexProvider, useRovingTabIndex, useFocusEffect } from "..";
import { Button } from "./button";
import { Grid } from "./grid";
import { GridCellButton } from "./grid-cell-button";

type ButtonClickHandler = (string) => void;

const GridButton: FC<{
  disabled: boolean;
  rowIndex: number;
  onClick: ButtonClickHandler;
}> = ({ disabled, rowIndex, children, onClick }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
    ref,
    disabled,
    rowIndex
  );

  useFocusEffect(focused, ref);

  return (
    <GridCellButton
      role="gridcell"
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
    </GridCellButton>
  );
};

type ExampleProps = {
  buttonOneDisabled: boolean;
  buttonTwoDisabled: boolean;
  buttonThreeDisabled: boolean;
  buttonFourDisabled: boolean;
  buttonFiveDisabled: boolean;
  useAlternateGridLayout: boolean;
  onClick: ButtonClickHandler;
};

export const GridExample: FC<ExampleProps> = ({
  buttonOneDisabled,
  buttonTwoDisabled,
  buttonThreeDisabled,
  buttonFourDisabled,
  buttonFiveDisabled,
  useAlternateGridLayout,
  onClick
}) => (
  <>
    <Button>Something before to focus on</Button>
    <Grid role="grid" useAlternateGridLayout={useAlternateGridLayout}>
      <RovingTabIndexProvider allowFocusOnClick={false}>
        <GridButton
          disabled={!!buttonOneDisabled}
          onClick={() => onClick("Button One")}
          rowIndex={useAlternateGridLayout ? 0 : 0}
        >
          Button One
        </GridButton>
        <GridButton
          disabled={!!buttonTwoDisabled}
          onClick={() => onClick("Button Two")}
          rowIndex={useAlternateGridLayout ? 0 : 0}
        >
          Button Two
        </GridButton>
        <GridButton
          disabled={!!buttonThreeDisabled}
          onClick={() => onClick("Button Three")}
          rowIndex={useAlternateGridLayout ? 0 : 0}
        >
          Button Three
        </GridButton>
        <GridButton
          disabled={!!buttonFourDisabled}
          onClick={() => onClick("Button Four")}
          rowIndex={useAlternateGridLayout ? 1 : 0}
        >
          Button Four
        </GridButton>
        <GridButton
          disabled={!!buttonFiveDisabled}
          onClick={() => onClick("Button Five")}
          rowIndex={useAlternateGridLayout ? 1 : 1}
        >
          Button Five
        </GridButton>
        <GridButton
          disabled={false}
          onClick={() => onClick("Button Six")}
          rowIndex={useAlternateGridLayout ? 1 : 1}
        >
          Button Six
        </GridButton>
        <GridButton
          disabled={false}
          onClick={() => onClick("Button Seven")}
          rowIndex={useAlternateGridLayout ? 2 : 1}
        >
          Button Seven
        </GridButton>
        <GridButton
          disabled={false}
          onClick={() => onClick("Button Eight")}
          rowIndex={useAlternateGridLayout ? 2 : 1}
        >
          Button Eight
        </GridButton>
        <GridButton
          disabled={false}
          onClick={() => onClick("Button Nine")}
          rowIndex={useAlternateGridLayout ? 2 : 2}
        >
          Button Nine
        </GridButton>
        <GridButton
          disabled={false}
          onClick={() => onClick("Button Ten")}
          rowIndex={useAlternateGridLayout ? 3 : 2}
        >
          Button Ten
        </GridButton>
        <GridButton
          disabled={false}
          onClick={() => onClick("Button Eleven")}
          rowIndex={useAlternateGridLayout ? 3 : 2}
        >
          Button Eleven
        </GridButton>
        <GridButton
          disabled={false}
          onClick={() => onClick("Button Twelve")}
          rowIndex={useAlternateGridLayout ? 3 : 2}
        >
          Button Twelve
        </GridButton>
      </RovingTabIndexProvider>
    </Grid>
    <Button>Something after to focus on</Button>
  </>
);

export default {
  title: "Grid RovingTabIndex",
  component: GridExample,
  argTypes: {
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
    useAlternateGridLayout: {
      name: "Use a 3x4 grid layout"
    }
  }
} as Meta;
