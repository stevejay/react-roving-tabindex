import { cleanup } from "react-testing-library";
import { renderHook } from "react-hooks-testing-library";
import useFocusEffect from "../use-focus-effect";

afterEach(cleanup);

test("does not focus on mount when false", () => {
  const focusMock = jest.fn();
  const mockRef = { current: { focus: focusMock } } as React.RefObject<any>;
  const { rerender } = renderHook(() => useFocusEffect(false, mockRef));
  expect(focusMock).toBeCalledTimes(0);
  rerender();
  expect(focusMock).toBeCalledTimes(0);
});

test("focuses on mount when true", () => {
  const focusMock = jest.fn();
  const mockRef = { current: { focus: focusMock } } as React.RefObject<any>;
  const { rerender } = renderHook(() => useFocusEffect(true, mockRef));
  expect(focusMock).toBeCalledTimes(1);
  rerender();
  expect(focusMock).toBeCalledTimes(1);
});

test("focuses when focus value changes to true", () => {
  let focused = false;
  const focusMock = jest.fn();
  const mockRef = { current: { focus: focusMock } } as React.RefObject<any>;
  const { rerender } = renderHook(() => useFocusEffect(focused, mockRef));

  focused = true;
  rerender();
  expect(focusMock).toBeCalledTimes(1);
  rerender();
  expect(focusMock).toBeCalledTimes(1);

  focused = false;
  rerender();
  expect(focusMock).toBeCalledTimes(1);
});
