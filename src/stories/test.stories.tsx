import { uniqueId } from "lodash";
import React from "react";
import { storiesOf } from "@storybook/react";
import {withKnobs, boolean, select} from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { RovingTabIndexProvider, useRovingTabIndex, useFocusEffect } from "..";

const TestButton = ({
  disabled,
  children,
  onClick,
  style
}: {
  disabled: boolean;
  children: React.ReactNode;
  onClick: () => void;
  style?: Record<string, string>
}) => {
  const id = React.useRef<string>(uniqueId());
  const ref = React.useRef<HTMLButtonElement>(null);
  const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
    ref,
    disabled
  );
  useFocusEffect(focused, ref);

  return (
    <button
      ref={ref}
      id={id.current}
      onKeyDown={handleKeyDown}
      onClick={() => {
        handleClick();
        onClick();
      }}
      tabIndex={tabIndex}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
};

const stories = storiesOf("RovingTabIndex", module);

stories.addDecorator(withKnobs);

stories.add("Example", () => (
  <RovingTabIndexProvider direction={select("Direction", {Horizontal: "horizontal", Vertical: "vertical", Both: "both"}, "horizontal")}>
    <div>
      <span>
        <TestButton
          disabled={boolean("Button One Disabled", false)}
          onClick={action("Button One clicked")}
        >
          Button One
        </TestButton>
      </span>
      <TestButton
        disabled={boolean("Button Two Disabled", false)}
        onClick={action("Button Two clicked")}
      >
        Button Two
      </TestButton>
      <TestButton
        disabled={boolean("Button Three Disabled", true)}
        onClick={action("Button Three clicked")}
      >
        Button Three
      </TestButton>
      <span>
        <span>
          <TestButton
            disabled={boolean("Button Four Disabled", false)}
            onClick={action("Button Four clicked")}
          >
            Button Four
          </TestButton>
        </span>
      </span>
      <TestButton
        disabled={boolean("Button Five Disabled", false)}
        onClick={action("Button Five clicked")}
      >
        Button Five
      </TestButton>
    </div>
  </RovingTabIndexProvider>
));
