import { RefObject } from "react";
import { renderHook } from "@testing-library/react-hooks";
import { useFocusEffect } from "../use-focus-effect";

it("does not focus on mount when false", () => {
  const focusMock = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockRef = { current: { focus: focusMock } } as RefObject<any>;
  const { rerender } = renderHook(() => useFocusEffect(false, mockRef));
  expect(focusMock).toBeCalledTimes(0);
  rerender();
  expect(focusMock).toBeCalledTimes(0);
});

it("focuses on mount when true", () => {
  const focusMock = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockRef = { current: { focus: focusMock } } as RefObject<any>;
  const { rerender } = renderHook(() => useFocusEffect(true, mockRef));
  expect(focusMock).toBeCalledTimes(1);
  rerender();
  expect(focusMock).toBeCalledTimes(1);
});

it("focuses when focus value changes to true", () => {
  let focused = false;
  const focusMock = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockRef = { current: { focus: focusMock } } as RefObject<any>;
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
