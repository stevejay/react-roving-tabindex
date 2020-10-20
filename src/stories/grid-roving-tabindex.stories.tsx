import "jspolyfill-array.prototype.findIndex";
import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import {
  RovingTabIndexProvider,
  useRovingTabIndex,
  useFocusEffect,
  KeyConfig,
  Navigation,
  Key
} from "..";
import { Button } from "./button";
import { Grid } from "./grid";
import { GridCellButton } from "./grid-cell-button";

const GRID_KEY_CONFIG: KeyConfig = {
  [Key.ARROW_LEFT]: Navigation.PREVIOUS,
  [Key.ARROW_RIGHT]: Navigation.NEXT,
  [Key.ARROW_UP]: Navigation.PREVIOUS_ROW,
  [Key.ARROW_DOWN]: Navigation.NEXT_ROW,
  [Key.HOME]: Navigation.FIRST_IN_ROW,
  [Key.HOME_WITH_CTRL]: Navigation.FIRST,
  [Key.END]: Navigation.LAST_IN_ROW,
  [Key.END_WITH_CTRL]: Navigation.LAST
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const NOOP_HANDLER = () => {};

type ButtonClickHandler = (
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>
) => void;

const GridButton: React.FC<{
  disabled: boolean;
  rowIndex: number;
  id?: string;
  onClick: ButtonClickHandler;
}> = ({ disabled, id, rowIndex, children, onClick }) => {
  const idRef = React.useRef<string>(id);
  const ref = React.useRef<HTMLButtonElement>(null);
  const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
    ref,
    disabled,
    idRef.current ? { id: idRef.current, rowIndex } : { rowIndex }
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
  onButtonOneClicked: ButtonClickHandler;
  buttonTwoDisabled: boolean;
  onButtonTwoClicked: ButtonClickHandler;
  buttonThreeDisabled: boolean;
  onButtonThreeClicked: ButtonClickHandler;
  buttonFourDisabled: boolean;
  onButtonFourClicked: ButtonClickHandler;
  buttonFiveDisabled: boolean;
  onButtonFiveClicked: ButtonClickHandler;
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
  onButtonFiveClicked
}) => (
  <>
    <Button>Something before to focus on</Button>
    <Grid role="grid">
      <RovingTabIndexProvider keyConfig={GRID_KEY_CONFIG}>
        <GridButton
          disabled={!!buttonOneDisabled}
          onClick={onButtonOneClicked}
          rowIndex={0}
        >
          Button One
        </GridButton>
        <GridButton
          disabled={!!buttonTwoDisabled}
          onClick={onButtonTwoClicked}
          rowIndex={0}
        >
          Button Two
        </GridButton>
        <GridButton
          disabled={!!buttonThreeDisabled}
          onClick={onButtonThreeClicked}
          rowIndex={0}
        >
          Button Three
        </GridButton>
        <GridButton
          disabled={!!buttonFourDisabled}
          onClick={onButtonFourClicked}
          rowIndex={0}
        >
          Button Four
        </GridButton>
        <GridButton
          disabled={!!buttonFiveDisabled}
          onClick={onButtonFiveClicked}
          rowIndex={1}
        >
          Button Five
        </GridButton>
        <GridButton disabled={false} onClick={NOOP_HANDLER} rowIndex={1}>
          Button Six
        </GridButton>
        <GridButton disabled={false} onClick={NOOP_HANDLER} rowIndex={1}>
          Button Seven
        </GridButton>
        <GridButton disabled={false} onClick={NOOP_HANDLER} rowIndex={1}>
          Button Eight
        </GridButton>
        <GridButton disabled={false} onClick={NOOP_HANDLER} rowIndex={2}>
          Button Nine
        </GridButton>
        <GridButton disabled={false} onClick={NOOP_HANDLER} rowIndex={2}>
          Button Ten
        </GridButton>
        <GridButton disabled={false} onClick={NOOP_HANDLER} rowIndex={2}>
          Button Eleven
        </GridButton>
        <GridButton disabled={false} onClick={NOOP_HANDLER} rowIndex={2}>
          Button Twelve
        </GridButton>
      </RovingTabIndexProvider>
    </Grid>
    <Button>Something after to focus on</Button>
  </>
);

export default {
  title: "Grid RovingTabIndex",
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
