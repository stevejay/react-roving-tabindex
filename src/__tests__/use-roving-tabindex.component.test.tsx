import React, { FC, useRef } from "react";
import { fireEvent, render } from "@testing-library/react";
import { Provider } from "../Provider";
import { useRovingTabIndex } from "../use-roving-tabindex";
import { ProviderProps } from "../types";

type TestButtonProps = { disabled: boolean; rowIndex?: number; id?: string };

const TestButton: FC<TestButtonProps> = ({
  disabled,
  rowIndex = null,
  id,
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
      id={id}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      tabIndex={tabIndex}
      data-focused={focused}
    >
      {children}
    </button>
  );
};

type TestToolbarProps = {
  flags?: Array<boolean>;
} & Pick<ProviderProps, "initialTabElementSelector" | "onTabElementSelected">;

const TestToolbar: FC<TestToolbarProps> = ({
  flags = [false, false, false],
  initialTabElementSelector,
  onTabElementSelected
}) => (
  <Provider
    initialTabElementSelector={initialTabElementSelector}
    onTabElementSelected={onTabElementSelected}
  >
    <TestButton id="button-one" disabled={flags[0]}>
      Button One
    </TestButton>
    <div>
      <TestButton id="button-two" disabled={flags[1]}>
        Button Two
      </TestButton>
    </div>
    <TestButton id="button-three" disabled={flags[2]}>
      Button Three
    </TestButton>
  </Provider>
);

type TestGridProps = { flags?: Array<boolean> };

const TestGrid: FC<TestGridProps> = ({ flags = [false, false, false] }) => (
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

  it("displays correctly initially when there is a known initial tab element", async () => {
    const flags = [false, false, false];
    const { getByText } = render(
      <TestToolbar initialTabElementSelector="#button-two" flags={flags} />
    );
    expect(getByText("Button One").tabIndex).toEqual(-1);
    expect(getByText("Button One").getAttribute("data-focused")).toEqual(
      "false"
    );
    expect(getByText("Button Two").tabIndex).toEqual(0);
    expect(getByText("Button Two").getAttribute("data-focused")).toEqual(
      "false"
    );
    expect(getByText("Button Three").tabIndex).toEqual(-1);
    expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
      "false"
    );
  });

  it("ignores an initial tab element when it is for a currently disabled element", async () => {
    const flags = [false, true, false];
    const { getByText } = render(
      <TestToolbar initialTabElementSelector="#button-two" flags={flags} />
    );
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

  it("displays correctly initially when there is an unknown initial tab element", async () => {
    const flags = [false, false, false];
    const { getByText } = render(
      <TestToolbar initialTabElementSelector="#does-not-exist" flags={flags} />
    );
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

  describe("when there is an onTabElementSelected callback", () => {
    it("should correctly invoke the callback", () => {
      const mockOnTabElementUpdated = jest.fn();
      const flags = [false, false, false];
      const { getByText } = render(
        <TestToolbar
          onTabElementSelected={mockOnTabElementUpdated}
          flags={flags}
        />
      );
      expect(mockOnTabElementUpdated).not.toHaveBeenCalled();

      const buttonOne = getByText("Button One");
      fireEvent.click(buttonOne);
      expect(mockOnTabElementUpdated).toHaveBeenCalledTimes(1);
      expect(mockOnTabElementUpdated).toHaveBeenLastCalledWith(buttonOne);

      const buttonThree = getByText("Button Three");
      fireEvent.click(buttonThree);
      expect(mockOnTabElementUpdated).toHaveBeenCalledTimes(2);
      expect(mockOnTabElementUpdated).toHaveBeenLastCalledWith(buttonThree);
    });
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
