import React, { FC, useRef } from "react";
import { render } from "@testing-library/react";
import { Provider } from "../Provider";
import { useRovingTabIndex } from "../use-roving-tabindex";

const TestButton: FC<{ disabled: boolean; rowIndex?: number }> = ({
  disabled,
  rowIndex = null,
  children
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
    ref,
    disabled,
    rowIndex
  );
  return (
    <button
      ref={ref}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      tabIndex={tabIndex}
      data-focused={focused}
    >
      {children}
    </button>
  );
};

const TestToolbar: FC<{ flags?: Array<boolean> }> = ({
  flags = [false, false, false]
}) => (
  <Provider>
    <TestButton disabled={flags[0]}>Button One</TestButton>
    <div>
      <TestButton disabled={flags[1]}>Button Two</TestButton>
    </div>
    <TestButton disabled={flags[2]}>Button Three</TestButton>
  </Provider>
);

const TestGrid: FC<{ flags?: Array<boolean> }> = ({
  flags = [false, false, false]
}) => (
  <Provider>
    <TestButton disabled={flags[0]} rowIndex={0}>
      Button One
    </TestButton>
    <div>
      <TestButton disabled={flags[1]} rowIndex={0}>
        Button Two
      </TestButton>
    </div>
    <TestButton disabled={flags[2]} rowIndex={1}>
      Button Three
    </TestButton>
  </Provider>
);

describe("when used as part of a toolbar", () => {
  it("displays correctly initially when no buttons are disabled", async () => {
    const flags = [false, false, false];
    const { getByText } = render(<TestToolbar flags={flags} />);
    expect(getByText("Button One").tabIndex).toEqual(0);
    expect(getByText("Button One").getAttribute("data-focused")).toEqual(
      "false"
    );
    expect(getByText("Button Two").tabIndex).toEqual(-1);
    expect(getByText("Button Two").getAttribute("data-focused")).toEqual(
      "false"
    );
    expect(getByText("Button Three").tabIndex).toEqual(-1);
    expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
      "false"
    );
  });

  it("displays correctly initially when first button is disabled", async () => {
    const flags = [true, false, false];
    const { getByText } = render(<TestToolbar flags={flags} />);
    expect(getByText("Button One").tabIndex).toEqual(-1);
    expect(getByText("Button Two").tabIndex).toEqual(0);
    expect(getByText("Button Three").tabIndex).toEqual(-1);
  });

  it("updates correctly when a button changes to being disabled", async () => {
    let flags = [false, false, false];
    const { getByText, rerender } = render(<TestToolbar flags={flags} />);
    flags = [true, false, false];
    rerender(<TestToolbar flags={flags} />);
    expect(getByText("Button One").tabIndex).toEqual(-1);
    expect(getByText("Button Two").tabIndex).toEqual(0);
    expect(getByText("Button Three").tabIndex).toEqual(-1);
  });
});

describe("when used as part of a grid", () => {
  it("displays correctly initially when no buttons are disabled", async () => {
    const flags = [false, false, false];
    const { getByText } = render(<TestGrid flags={flags} />);
    expect(getByText("Button One").tabIndex).toEqual(0);
    expect(getByText("Button One").getAttribute("data-focused")).toEqual(
      "false"
    );
    expect(getByText("Button Two").tabIndex).toEqual(-1);
    expect(getByText("Button Two").getAttribute("data-focused")).toEqual(
      "false"
    );
    expect(getByText("Button Three").tabIndex).toEqual(-1);
    expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
      "false"
    );
  });

  it("displays correctly initially when first button is disabled", async () => {
    const flags = [true, false, false];
    const { getByText } = render(<TestGrid flags={flags} />);
    expect(getByText("Button One").tabIndex).toEqual(-1);
    expect(getByText("Button Two").tabIndex).toEqual(0);
    expect(getByText("Button Three").tabIndex).toEqual(-1);
  });

  it("updates correctly when a button changes to being disabled", async () => {
    let flags = [false, false, false];
    const { getByText, rerender } = render(<TestGrid flags={flags} />);
    flags = [true, false, false];
    rerender(<TestGrid flags={flags} />);
    expect(getByText("Button One").tabIndex).toEqual(-1);
    expect(getByText("Button Two").tabIndex).toEqual(0);
    expect(getByText("Button Three").tabIndex).toEqual(-1);
  });
});
