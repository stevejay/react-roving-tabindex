import { renderHook, act } from "@testing-library/react-hooks";
import React, { RefObject, KeyboardEvent } from "react";
import { RovingTabIndexContext } from "../Provider";
import { ActionType, State } from "../types";
import { useRovingTabIndex } from "../use-roving-tabindex";
import { uniqueId } from "../unique-id";

const MOCK_ID = "test-id";
jest.mock("../unique-id");
(uniqueId as jest.Mock).mockReturnValue(MOCK_ID);

const INITIAL_STATE: State = {
  selectedId: null,
  allowFocusing: false,
  tabStops: [],
  direction: "horizontal",
  focusOnClick: false,
  loopAround: false,
  rowStartMap: null
};

const KEY_DOWN_HANDLER_INDEX = 2;
const CLICK_HANDLER_INDEX = 3;

const MockRovingTabIndexProvider = ({ value, children }) => (
  <RovingTabIndexContext.Provider value={value}>
    {children}
  </RovingTabIndexContext.Provider>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MOCK_REF: RefObject<Element> = { current: jest.fn() as any };

it("should register and unregister the tab stop", () => {
  const contextValue = { state: INITIAL_STATE, dispatch: jest.fn() };
  const wrapper = ({ children }) => (
    <MockRovingTabIndexProvider value={contextValue}>
      {children}
    </MockRovingTabIndexProvider>
  );

  const { unmount } = renderHook(() => useRovingTabIndex(MOCK_REF, false), {
    wrapper
  });

  expect(contextValue.dispatch).toHaveBeenCalledTimes(1);
  expect(contextValue.dispatch).toHaveBeenNthCalledWith(1, {
    type: ActionType.REGISTER_TAB_STOP,
    payload: {
      id: MOCK_ID,
      domElementRef: MOCK_REF,
      rowIndex: null,
      disabled: false
    }
  });

  contextValue.dispatch.mockClear();
  act(() => {
    unmount();
  });

  expect(contextValue.dispatch).toHaveBeenCalledTimes(1);
  expect(contextValue.dispatch).toHaveBeenNthCalledWith(1, {
    type: ActionType.UNREGISTER_TAB_STOP,
    payload: { id: MOCK_ID }
  });
});

it("should update the tab stop if the hook args change on a re-render", () => {
  const contextValue = { state: INITIAL_STATE, dispatch: jest.fn() };
  const wrapper = ({ children }) => (
    <MockRovingTabIndexProvider value={contextValue}>
      {children}
    </MockRovingTabIndexProvider>
  );
  let disabled = false;
  let rowIndex = null;

  const { rerender } = renderHook(
    () => useRovingTabIndex(MOCK_REF, disabled, rowIndex),
    { wrapper }
  );

  contextValue.dispatch.mockClear();
  disabled = true;
  rowIndex = 999;
  rerender();

  expect(contextValue.dispatch).toHaveBeenCalledTimes(1);
  expect(contextValue.dispatch).toHaveBeenNthCalledWith(1, {
    type: ActionType.TAB_STOP_UPDATED,
    payload: {
      id: MOCK_ID,
      disabled: true,
      rowIndex: 999
    }
  });
});

it("should not update the tab stop if the hook args do not change on a re-render", () => {
  const contextValue = { state: INITIAL_STATE, dispatch: jest.fn() };
  const wrapper = ({ children }) => (
    <MockRovingTabIndexProvider value={contextValue}>
      {children}
    </MockRovingTabIndexProvider>
  );
  const disabled = true;
  const rowIndex = 999;

  const { rerender } = renderHook(
    () => useRovingTabIndex(MOCK_REF, disabled, rowIndex),
    { wrapper }
  );

  contextValue.dispatch.mockClear();
  rerender();

  expect(contextValue.dispatch).not.toHaveBeenCalled();
});

it("should return the correct values when the tab stop is not selected", () => {
  const contextValue = { state: INITIAL_STATE, dispatch: jest.fn() };
  const wrapper = ({ children }) => (
    <MockRovingTabIndexProvider value={contextValue}>
      {children}
    </MockRovingTabIndexProvider>
  );

  const { result } = renderHook(() => useRovingTabIndex(MOCK_REF, false), {
    wrapper
  });

  expect(result.current).toEqual([
    -1,
    false,
    expect.any(Function),
    expect.any(Function)
  ]);
});

describe("when the tab stop is selected", () => {
  describe("when focusing is allowed", () => {
    it("should return the correct values", () => {
      const contextValue = {
        state: { ...INITIAL_STATE, selectedId: MOCK_ID, allowFocusing: true },
        dispatch: jest.fn()
      };
      const wrapper = ({ children }) => (
        <MockRovingTabIndexProvider value={contextValue}>
          {children}
        </MockRovingTabIndexProvider>
      );

      const { result } = renderHook(() => useRovingTabIndex(MOCK_REF, false), {
        wrapper
      });

      expect(result.current).toEqual([
        0,
        true,
        expect.any(Function),
        expect.any(Function)
      ]);
    });
  });

  describe("when focusing is not allowed", () => {
    it("should return the correct values", () => {
      const contextValue = {
        state: {
          ...INITIAL_STATE,
          selectedId: MOCK_ID,
          allowFocusing: false
        },
        dispatch: jest.fn()
      };
      const wrapper = ({ children }) => (
        <MockRovingTabIndexProvider value={contextValue}>
          {children}
        </MockRovingTabIndexProvider>
      );

      const { result } = renderHook(() => useRovingTabIndex(MOCK_REF, false), {
        wrapper
      });

      expect(result.current).toEqual([
        0,
        false,
        expect.any(Function),
        expect.any(Function)
      ]);
    });
  });
});

describe("when the tab stop is not selected", () => {
  describe("when focusing is allowed", () => {
    it("should return the correct values", () => {
      const contextValue = {
        state: {
          ...INITIAL_STATE,
          selectedId: "different-id",
          allowFocusing: true
        },
        dispatch: jest.fn()
      };
      const wrapper = ({ children }) => (
        <MockRovingTabIndexProvider value={contextValue}>
          {children}
        </MockRovingTabIndexProvider>
      );

      const { result } = renderHook(() => useRovingTabIndex(MOCK_REF, false), {
        wrapper
      });

      expect(result.current).toEqual([
        -1,
        false,
        expect.any(Function),
        expect.any(Function)
      ]);
    });
  });

  describe("when focusing is not allowed", () => {
    it("should return the correct values", () => {
      const contextValue = {
        state: {
          ...INITIAL_STATE,
          selectedId: "different-id",
          allowFocusing: false
        },
        dispatch: jest.fn()
      };
      const wrapper = ({ children }) => (
        <MockRovingTabIndexProvider value={contextValue}>
          {children}
        </MockRovingTabIndexProvider>
      );

      const { result } = renderHook(() => useRovingTabIndex(MOCK_REF, false), {
        wrapper
      });

      expect(result.current).toEqual([
        -1,
        false,
        expect.any(Function),
        expect.any(Function)
      ]);
    });
  });
});

it("should dispatch the correct event when the tab stop is clicked", () => {
  const contextValue = { state: INITIAL_STATE, dispatch: jest.fn() };
  const wrapper = ({ children }) => (
    <MockRovingTabIndexProvider value={contextValue}>
      {children}
    </MockRovingTabIndexProvider>
  );

  const { result } = renderHook(() => useRovingTabIndex(MOCK_REF, false), {
    wrapper
  });

  contextValue.dispatch.mockClear();
  act(() => {
    result.current[CLICK_HANDLER_INDEX]();
  });

  expect(contextValue.dispatch).toHaveBeenCalledTimes(1);
  expect(contextValue.dispatch).toHaveBeenNthCalledWith(1, {
    type: ActionType.CLICKED,
    payload: { id: MOCK_ID }
  });
});

it("should dispatch the correct event when the user presses a related key on the tab stop", () => {
  const mockPreventDefault = jest.fn();
  const contextValue = { state: INITIAL_STATE, dispatch: jest.fn() };
  const wrapper = ({ children }) => (
    <MockRovingTabIndexProvider value={contextValue}>
      {children}
    </MockRovingTabIndexProvider>
  );

  const { result } = renderHook(() => useRovingTabIndex(MOCK_REF, false), {
    wrapper
  });

  contextValue.dispatch.mockClear();
  act(() => {
    result.current[KEY_DOWN_HANDLER_INDEX]({
      key: "Home",
      ctrlKey: true,
      preventDefault: mockPreventDefault
    } as unknown as KeyboardEvent);
  });

  expect(contextValue.dispatch).toHaveBeenCalledTimes(1);
  expect(contextValue.dispatch).toHaveBeenNthCalledWith(1, {
    type: ActionType.KEY_DOWN,
    payload: {
      id: MOCK_ID,
      key: "Home",
      ctrlKey: true
    }
  });
  expect(mockPreventDefault).toHaveBeenCalled();
});

it("should not dispatch anything when the user presses an unrelated key on the tab stop", () => {
  const mockPreventDefault = jest.fn();
  const contextValue = { state: INITIAL_STATE, dispatch: jest.fn() };
  const wrapper = ({ children }) => (
    <MockRovingTabIndexProvider value={contextValue}>
      {children}
    </MockRovingTabIndexProvider>
  );

  const { result } = renderHook(() => useRovingTabIndex(MOCK_REF, false), {
    wrapper
  });

  contextValue.dispatch.mockClear();
  act(() => {
    result.current[KEY_DOWN_HANDLER_INDEX]({
      key: "a",
      ctrlKey: true,
      preventDefault: mockPreventDefault
    } as unknown as KeyboardEvent);
  });

  expect(contextValue.dispatch).not.toHaveBeenCalled();
  expect(mockPreventDefault).not.toHaveBeenCalled();
});
