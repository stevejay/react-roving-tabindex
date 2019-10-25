import { uniqueId } from "lodash";
import React from "react";
import { storiesOf } from "@storybook/react";
import { withKnobs, boolean, select } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { RovingTabIndexProvider, useRovingTabIndex, useFocusEffect } from "..";
import { Button } from "./button";

const ToolbarButton = ({
  disabled,
  children,
  onClick
}: {
  disabled: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => {
  const id = React.useRef<string>(uniqueId());
  const ref = React.useRef<HTMLButtonElement>(null);
  const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
    ref,
    disabled
  );

  useFocusEffect(focused, ref);

  return (
    <Button
      ref={ref}
      id={id.current}
      onKeyDown={handleKeyDown}
      onClick={() => {
        handleClick();
        onClick();
      }}
      tabIndex={tabIndex}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

const stories = storiesOf("RovingTabIndex", module);

stories.addDecorator(withKnobs);

stories.add("Example", () => (
  <RovingTabIndexProvider
    direction={select(
      "Direction",
      { Horizontal: "horizontal", Vertical: "vertical", Both: "both" },
      "horizontal"
    )}
  >
    <div>
      <span>
        <ToolbarButton
          disabled={boolean("Button One Disabled", false)}
          onClick={action("Button One clicked")}
        >
          Button One
        </ToolbarButton>
      </span>
      <ToolbarButton
        disabled={boolean("Button Two Disabled", false)}
        onClick={action("Button Two clicked")}
      >
        Button Two
      </ToolbarButton>
      <ToolbarButton
        disabled={boolean("Button Three Disabled", true)}
        onClick={action("Button Three clicked")}
      >
        Button Three
      </ToolbarButton>
      <span>
        <span>
          <ToolbarButton
            disabled={boolean("Button Four Disabled", false)}
            onClick={action("Button Four clicked")}
          >
            Button Four
          </ToolbarButton>
        </span>
      </span>
      <ToolbarButton
        disabled={boolean("Button Five Disabled", false)}
        onClick={action("Button Five clicked")}
      >
        Button Five
      </ToolbarButton>
    </div>
  </RovingTabIndexProvider>
));
