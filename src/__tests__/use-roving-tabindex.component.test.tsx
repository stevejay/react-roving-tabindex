import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "../Provider";
import { useRovingTabIndex } from "../use-roving-tabindex";

const TestButton: React.FC<{
  disabled: boolean;
  id?: string;
}> = ({ disabled, children, id }) => {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
    ref,
    disabled,
    { id }
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

const TestToolbar: React.FC<{ flags?: Array<boolean> }> = ({
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

const TestToolbarWithIDs: React.FC<{ flags?: Array<boolean> }> = ({
  flags = [false, false, false]
}) => (
  <Provider>
    <TestButton disabled={flags[0]} id="user-id-1">
      Button One
    </TestButton>
    <div>
      <TestButton disabled={flags[1]} id="user-id-2">
        Button Two
      </TestButton>
    </div>
    <TestButton disabled={flags[2]} id="user-id-3">
      Button Three
    </TestButton>
  </Provider>
);

it("displays correctly initially when no buttons are disabled", async () => {
  const flags = [false, false, false];
  const { getByText } = render(<TestToolbar flags={flags} />);
  expect(getByText("Button One").tabIndex).toEqual(0);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").tabIndex).toEqual(-1);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").tabIndex).toEqual(-1);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );
});

it("displays correctly initially when custom IDs are used", async () => {
  const flags = [false, false, false];
  const { getByText } = render(<TestToolbarWithIDs flags={flags} />);
  expect(getByText("Button One").id).toEqual("user-id-1");
  expect(getByText("Button Two").id).toEqual("user-id-2");
  expect(getByText("Button Three").id).toEqual("user-id-3");
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
