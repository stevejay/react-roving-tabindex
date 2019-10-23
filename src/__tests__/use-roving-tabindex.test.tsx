import React from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import Provider from "../Provider";
import useRovingTabIndex from "../use-roving-tabindex";

afterEach(cleanup);

const TestButton = ({
  disabled,
  children,
  id
}: {
  disabled: boolean;
  children: React.ReactNode;
  id?: string;
}) => {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
    ref,
    disabled,
    id
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

const TestToolbar = ({
  flags = [false, false, false]
}: {
  flags?: Array<boolean>;
}) => (
  <Provider>
    <TestButton disabled={flags[0]}>Button One</TestButton>
    <div>
      <TestButton disabled={flags[1]}>Button Two</TestButton>
    </div>
    <TestButton disabled={flags[2]}>Button Three</TestButton>
  </Provider>
);

const TestToolbarWithIDs = ({
  flags = [false, false, false]
}: {
  flags?: Array<boolean>;
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

test("displays correctly initially when no buttons are disabled", async () => {
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

test("displays correctly initially when custom IDs are used", async () => {
  const flags = [false, false, false];
  const { getByText } = render(<TestToolbarWithIDs flags={flags} />);
  expect(getByText("Button One").id).toEqual("user-id-1");
  expect(getByText("Button Two").id).toEqual("user-id-2");
  expect(getByText("Button Three").id).toEqual("user-id-3");
});

test("displays correctly initially when first button is disabled", async () => {
  const flags = [true, false, false];
  const { getByText } = render(<TestToolbar flags={flags} />);
  expect(getByText("Button One").tabIndex).toEqual(-1);
  expect(getByText("Button Two").tabIndex).toEqual(0);
  expect(getByText("Button Three").tabIndex).toEqual(-1);
});

test("updates correctly when a button changes to being disabled", async () => {
  let flags = [false, false, false];
  const { getByText, rerender } = render(<TestToolbar flags={flags} />);
  flags = [true, false, false];
  rerender(<TestToolbar flags={flags} />);
  expect(getByText("Button One").tabIndex).toEqual(-1);
  expect(getByText("Button Two").tabIndex).toEqual(0);
  expect(getByText("Button Three").tabIndex).toEqual(-1);
});

test("pressing arrow right key", async () => {
  const { getByText } = render(<TestToolbar />);

  fireEvent.keyDown(getByText("Button One"), { key: "ArrowRight" });
  expect(getByText("Button One").tabIndex).toEqual(-1);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").tabIndex).toEqual(0);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("true");
  expect(getByText("Button Three").tabIndex).toEqual(-1);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );

  fireEvent.keyDown(getByText("Button Two"), { key: "ArrowRight" });
  expect(getByText("Button One").tabIndex).toEqual(-1);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").tabIndex).toEqual(-1);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").tabIndex).toEqual(0);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "true"
  );

  fireEvent.keyDown(getByText("Button Three"), { key: "ArrowRight" });
  expect(getByText("Button One").tabIndex).toEqual(0);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("true");
  expect(getByText("Button Two").tabIndex).toEqual(-1);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").tabIndex).toEqual(-1);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );
});

test("pressing arrow left key", async () => {
  const { getByText } = render(<TestToolbar />);

  fireEvent.keyDown(getByText("Button One"), { key: "ArrowLeft" });
  expect(getByText("Button One").tabIndex).toEqual(-1);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").tabIndex).toEqual(-1);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").tabIndex).toEqual(0);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "true"
  );

  fireEvent.keyDown(getByText("Button Three"), { key: "ArrowLeft" });
  expect(getByText("Button One").tabIndex).toEqual(-1);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").tabIndex).toEqual(0);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("true");
  expect(getByText("Button Three").tabIndex).toEqual(-1);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );

  fireEvent.keyDown(getByText("Button Two"), { key: "ArrowLeft" });
  expect(getByText("Button One").tabIndex).toEqual(0);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("true");
  expect(getByText("Button Two").tabIndex).toEqual(-1);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").tabIndex).toEqual(-1);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );
});

test("pressing home key", async () => {
  const { getByText } = render(<TestToolbar />);

  fireEvent.keyDown(getByText("Button One"), { key: "Home" });
  expect(getByText("Button One").tabIndex).toEqual(0);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("true");
  expect(getByText("Button Two").tabIndex).toEqual(-1);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").tabIndex).toEqual(-1);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );

  fireEvent.keyDown(getByText("Button Two"), { key: "Home" });
  expect(getByText("Button One").tabIndex).toEqual(0);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("true");
  expect(getByText("Button Two").tabIndex).toEqual(-1);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").tabIndex).toEqual(-1);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );

  fireEvent.keyDown(getByText("Button Three"), { key: "Home" });
  expect(getByText("Button One").tabIndex).toEqual(0);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("true");
  expect(getByText("Button Two").tabIndex).toEqual(-1);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").tabIndex).toEqual(-1);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );
});

test("pressing end key", async () => {
  const { getByText } = render(<TestToolbar />);

  fireEvent.keyDown(getByText("Button One"), { key: "End" });
  expect(getByText("Button One").tabIndex).toEqual(-1);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").tabIndex).toEqual(-1);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").tabIndex).toEqual(0);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "true"
  );

  fireEvent.keyDown(getByText("Button Two"), { key: "End" });
  expect(getByText("Button One").tabIndex).toEqual(-1);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").tabIndex).toEqual(-1);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").tabIndex).toEqual(0);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "true"
  );

  fireEvent.keyDown(getByText("Button Three"), { key: "End" });
  expect(getByText("Button One").tabIndex).toEqual(-1);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").tabIndex).toEqual(-1);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").tabIndex).toEqual(0);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "true"
  );
});

test("manages focus when switching between keyboard and mouse input", async () => {
  const flags = [false, false, false];
  const { getByText } = render(<TestToolbar flags={flags} />);

  fireEvent.mouseDown(getByText("Button One"));
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );

  fireEvent.keyDown(getByText("Button One"), { key: "ArrowRight" });
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("true");
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );

  fireEvent.click(getByText("Button One"));
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );
});
