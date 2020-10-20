import React from "react";
import { JSDOM } from "jsdom";
import warning from "warning";
import { Action, ActionType, Key, State, TabStop } from "../types";
import { DEFAULT_KEY_CONFIG, reducer } from "../Provider";

jest.mock("warning");

const toolbarTestDOM = new JSDOM(`
  <body>
    <button id="button-1">
    <button id="button-2">
    <button id="button-3">
  </body>
`);

const getToolbarTestDOMElementRef = (
  id: string
): React.RefObject<HTMLElement> => ({
  current: toolbarTestDOM.window.document.getElementById(id)
});

describe("reducer", () => {
  const buttonOneId = "button-1";

  const buttonOneTabStop: TabStop = {
    id: buttonOneId,
    domElementRef: getToolbarTestDOMElementRef(buttonOneId),
    disabled: false,
    rowIndex: null
  };

  const buttonTwoId = "button-2";

  const buttonTwoTabStop: TabStop = {
    id: buttonTwoId,
    domElementRef: getToolbarTestDOMElementRef(buttonTwoId),
    disabled: false,
    rowIndex: null
  };

  // const buttonThreeId = "button-3";

  beforeEach(() => {
    (warning as jest.Mock).mockReset();
  });

  describe("when registering a tab stop", () => {
    describe("when no tab stops have been registered", () => {
      const givenState: State = Object.freeze({
        selectedId: null,
        allowFocusing: false,
        tabStops: [],
        keyConfig: DEFAULT_KEY_CONFIG
      });

      it("should add the tab stop as the only tab stop", () => {
        const action: Action = {
          type: ActionType.REGISTER_TAB_STOP,
          payload: buttonOneTabStop
        };
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          selectedId: buttonOneId,
          allowFocusing: false,
          tabStops: [buttonOneTabStop],
          keyConfig: DEFAULT_KEY_CONFIG
        });
      });
    });

    describe("when one earlier tab stop has already been registered", () => {
      const givenState: State = Object.freeze({
        selectedId: buttonOneId,
        allowFocusing: false,
        tabStops: [buttonOneTabStop],
        keyConfig: DEFAULT_KEY_CONFIG
      });

      it("should add the new tab stop after the existing tab stop", () => {
        const action: Action = {
          type: ActionType.REGISTER_TAB_STOP,
          payload: buttonTwoTabStop
        };
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          selectedId: buttonOneId,
          allowFocusing: false,
          tabStops: [buttonOneTabStop, buttonTwoTabStop],
          keyConfig: DEFAULT_KEY_CONFIG
        });
      });
    });

    describe("when one later tab stop has already been registered", () => {
      const givenState: State = Object.freeze({
        selectedId: buttonTwoId,
        allowFocusing: false,
        tabStops: [buttonTwoTabStop],
        keyConfig: DEFAULT_KEY_CONFIG
      });

      it("should add the new tab stop before the existing tab stop", () => {
        const action: Action = {
          type: ActionType.REGISTER_TAB_STOP,
          payload: buttonOneTabStop
        };
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          selectedId: buttonTwoId,
          allowFocusing: false,
          tabStops: [buttonOneTabStop, buttonTwoTabStop],
          keyConfig: DEFAULT_KEY_CONFIG
        });
      });
    });

    describe("when the same tab stop has already been registered", () => {
      const givenState: State = Object.freeze({
        selectedId: buttonOneId,
        allowFocusing: false,
        tabStops: [buttonOneTabStop],
        keyConfig: DEFAULT_KEY_CONFIG
      });

      it("should not add the tab stop again", () => {
        const action: Action = {
          type: ActionType.REGISTER_TAB_STOP,
          payload: buttonOneTabStop
        };
        const result = reducer(givenState, action);
        expect(result).toEqual<State>(givenState);
      });

      it("should log a warning", () => {
        const action: Action = {
          type: ActionType.REGISTER_TAB_STOP,
          payload: buttonOneTabStop
        };
        reducer(givenState, action);
        expect(warning).toHaveBeenNthCalledWith(
          1,
          false,
          `'${buttonOneId}' tab stop already registered`
        );
      });
    });
  });

  describe("when unregistering a tab stop", () => {
    describe("when the tab stop to remove is not registered", () => {
      const givenState: State = Object.freeze({
        selectedId: null,
        allowFocusing: false,
        tabStops: [],
        keyConfig: DEFAULT_KEY_CONFIG
      });

      it("should not change the reducer state", () => {
        const action: Action = {
          type: ActionType.UNREGISTER_TAB_STOP,
          payload: { id: buttonOneId }
        };
        const result = reducer(givenState, action);
        expect(result).toEqual<State>(givenState);
      });

      it("should log a warning", () => {
        const action: Action = {
          type: ActionType.UNREGISTER_TAB_STOP,
          payload: { id: buttonOneId }
        };
        reducer(givenState, action);
        expect(warning).toHaveBeenNthCalledWith(
          1,
          false,
          `'${buttonOneId}' tab stop already unregistered`
        );
      });
    });

    describe("when the tab stop to remove is registered", () => {
      describe("when it is the currently selected tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: buttonOneId,
          allowFocusing: false,
          tabStops: [buttonOneTabStop, buttonTwoTabStop],
          keyConfig: DEFAULT_KEY_CONFIG
        });

        it("should unregister the tab stop", () => {
          const action: Action = {
            type: ActionType.UNREGISTER_TAB_STOP,
            payload: { id: buttonOneId }
          };
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            selectedId: buttonTwoId,
            allowFocusing: false,
            tabStops: [buttonTwoTabStop],
            keyConfig: DEFAULT_KEY_CONFIG
          });
        });
      });

      describe("when it is not the currently selected tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: buttonOneId,
          allowFocusing: false,
          tabStops: [buttonOneTabStop, buttonTwoTabStop],
          keyConfig: DEFAULT_KEY_CONFIG
        });

        it("should unregister the tab stop", () => {
          const action: Action = {
            type: ActionType.UNREGISTER_TAB_STOP,
            payload: { id: buttonTwoId }
          };
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            selectedId: buttonOneId,
            allowFocusing: false,
            tabStops: [buttonOneTabStop],
            keyConfig: DEFAULT_KEY_CONFIG
          });
        });
      });
    });
  });

  describe("when updating a tab stop", () => {
    describe("when the updated data is the same as the current data", () => {
      const givenState: State = Object.freeze({
        selectedId: buttonOneId,
        allowFocusing: false,
        tabStops: [
          buttonOneTabStop,
          { ...buttonTwoTabStop, rowIndex: 1, disabled: true }
        ],
        keyConfig: DEFAULT_KEY_CONFIG
      });

      it("should not change the reducer state", () => {
        const action: Action = {
          type: ActionType.TAB_STOP_UPDATED,
          payload: { id: buttonTwoId, rowIndex: 1, disabled: true }
        };
        const result = reducer(givenState, action);
        expect(result).toEqual<State>(givenState);
      });
    });

    describe("when the updated data is different to the current data", () => {
      describe("when the updated tab stop is not selected", () => {
        const givenState: State = Object.freeze({
          selectedId: buttonOneId,
          allowFocusing: false,
          tabStops: [
            buttonOneTabStop,
            { ...buttonTwoTabStop, rowIndex: 1, disabled: true }
          ],
          keyConfig: DEFAULT_KEY_CONFIG
        });

        it("should change the tab stop data", () => {
          const action: Action = {
            type: ActionType.TAB_STOP_UPDATED,
            payload: { id: buttonTwoId, rowIndex: 2, disabled: false }
          };
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            tabStops: [
              buttonOneTabStop,
              { ...buttonTwoTabStop, rowIndex: 2, disabled: false }
            ]
          });
        });
      });

      describe("when the updated tab stop is selected and becomes disabled", () => {
        const givenState: State = Object.freeze({
          selectedId: buttonTwoId,
          allowFocusing: false,
          tabStops: [
            buttonOneTabStop,
            { ...buttonTwoTabStop, disabled: false }
          ],
          keyConfig: DEFAULT_KEY_CONFIG
        });

        it("should change the tab stop data and the selectedId", () => {
          const action: Action = {
            type: ActionType.TAB_STOP_UPDATED,
            payload: { id: buttonTwoId, rowIndex: null, disabled: true }
          };
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: buttonOneId,
            tabStops: [
              buttonOneTabStop,
              { ...buttonTwoTabStop, disabled: true }
            ]
          });
        });
      });
    });
  });

  describe("when clicking on a tab stop", () => {
    describe("when the tab stop is not disabled", () => {
      const givenState: State = Object.freeze({
        selectedId: buttonOneId,
        allowFocusing: false,
        tabStops: [buttonOneTabStop, buttonTwoTabStop],
        keyConfig: DEFAULT_KEY_CONFIG
      });

      it("should set the clicked tab stop as the selected tab stop", () => {
        const action: Action = {
          type: ActionType.CLICKED,
          payload: { id: buttonTwoId }
        };
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          selectedId: buttonTwoId,
          allowFocusing: true,
          tabStops: [buttonOneTabStop, buttonTwoTabStop],
          keyConfig: DEFAULT_KEY_CONFIG
        });
      });
    });

    describe("when the tab stop is disabled", () => {
      const givenState: State = Object.freeze({
        selectedId: buttonOneId,
        allowFocusing: false,
        tabStops: [buttonOneTabStop, { ...buttonTwoTabStop, disabled: true }],
        keyConfig: DEFAULT_KEY_CONFIG
      });

      it("should not change the reducer state", () => {
        const action: Action = {
          type: ActionType.CLICKED,
          payload: { id: buttonTwoId }
        };
        const result = reducer(givenState, action);
        expect(result).toEqual<State>(givenState);
      });
    });
  });

  /*
  describe("when tabbing to the next tab stop", () => {
    describe("when the current tab stop is not registered", () => {
      const givenState: State = Object.freeze({
        direction: "horizontal",
        selectedId: buttonOneId,
        lastActionOrigin: "mouse",
        tabStops: [buttonOneTabStop, buttonTwoTabStop]
      });

      const action: Action = {
        type: ActionType.TAB_TO_NEXT,
        payload: { id: buttonThreeId }
      };

      it("should not change the reducer state", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>(givenState);
      });

      it("should log a warning", () => {
        reducer(givenState, action);
        expect(warning).toHaveBeenNthCalledWith(
          1,
          false,
          `${buttonThreeId} tab stop not registered`
        );
      });
    });

    describe("when the current tab stop is not the last tab stop", () => {
      const givenState: State = Object.freeze({
        direction: "horizontal",
        selectedId: buttonOneId,
        lastActionOrigin: "mouse",
        tabStops: [buttonOneTabStop, buttonTwoTabStop]
      });

      it("should set the next tab stop as the current tab stop", () => {
        const action: Action = {
          type: ActionType.TAB_TO_NEXT,
          payload: { id: buttonOneId }
        };

        const result = reducer(givenState, action);

        expect(result).toEqual<State>({
          direction: "horizontal",
          selectedId: buttonTwoId,
          lastActionOrigin: "keyboard",
          tabStops: [buttonOneTabStop, buttonTwoTabStop]
        });
      });
    });

    describe("when the current tab stop is the last tab stop", () => {
      const givenState: State = Object.freeze({
        direction: "horizontal",
        selectedId: buttonTwoId,
        lastActionOrigin: "mouse",
        tabStops: [buttonOneTabStop, buttonTwoTabStop]
      });

      it("should wrap around to set the first tab stop as the current tab stop", () => {
        const action: Action = {
          type: ActionType.TAB_TO_NEXT,
          payload: { id: buttonTwoId }
        };

        const result = reducer(givenState, action);

        expect(result).toEqual<State>({
          direction: "horizontal",
          selectedId: buttonOneId,
          lastActionOrigin: "keyboard",
          tabStops: [buttonOneTabStop, buttonTwoTabStop]
        });
      });
    });
  });

  describe("when tabbing to the previous tab stop", () => {
    describe("when the current tab stop is not registered", () => {
      const givenState: State = Object.freeze({
        direction: "horizontal",
        selectedId: buttonOneId,
        lastActionOrigin: "mouse",
        tabStops: [buttonOneTabStop, buttonTwoTabStop]
      });

      const action: Action = {
        type: ActionType.TAB_TO_PREVIOUS,
        payload: { id: buttonThreeId }
      };

      it("should not change the reducer state", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>(givenState);
      });

      it("should log a warning", () => {
        reducer(givenState, action);
        expect(warning).toHaveBeenNthCalledWith(
          1,
          false,
          `${buttonThreeId} tab stop not registered`
        );
      });
    });

    describe("when the current tab stop is not the first tab stop", () => {
      const givenState: State = Object.freeze({
        direction: "horizontal",
        selectedId: buttonTwoId,
        lastActionOrigin: "mouse",
        tabStops: [buttonOneTabStop, buttonTwoTabStop]
      });

      it("should set the previous tab stop as the current tab stop", () => {
        const action: Action = {
          type: ActionType.TAB_TO_NEXT,
          payload: { id: buttonTwoId }
        };

        const result = reducer(givenState, action);

        expect(result).toEqual<State>({
          direction: "horizontal",
          selectedId: buttonOneId,
          lastActionOrigin: "keyboard",
          tabStops: [buttonOneTabStop, buttonTwoTabStop]
        });
      });
    });

    describe("when the current tab stop is the first tab stop", () => {
      const givenState: State = Object.freeze({
        direction: "horizontal",
        selectedId: buttonOneId,
        lastActionOrigin: "mouse",
        tabStops: [buttonOneTabStop, buttonTwoTabStop]
      });

      it("should wrap around to set the last tab stop as the current tab stop", () => {
        const action: Action = {
          type: ActionType.TAB_TO_NEXT,
          payload: { id: buttonOneId }
        };

        const result = reducer(givenState, action);

        expect(result).toEqual<State>({
          direction: "horizontal",
          selectedId: buttonTwoId,
          lastActionOrigin: "keyboard",
          tabStops: [buttonOneTabStop, buttonTwoTabStop]
        });
      });
    });
  });

  describe("when tabbing to the first tab stop", () => {
    describe("when no tab stops have been registered", () => {
      const givenState: State = Object.freeze({
        direction: "horizontal",
        selectedId: null,
        lastActionOrigin: "mouse",
        tabStops: []
      });

      it("should not change the reducer state", () => {
        const action: Action = { type: ActionType.TAB_TO_FIRST };
        const result = reducer(givenState, action);
        expect(result).toEqual<State>(givenState);
      });
    });

    describe("when the current tab stop is the first tab stop", () => {
      const givenState: State = Object.freeze({
        direction: "horizontal",
        selectedId: buttonOneId,
        lastActionOrigin: "mouse",
        tabStops: [buttonOneTabStop, buttonTwoTabStop]
      });

      it("should only alter the action origin", () => {
        const action: Action = { type: ActionType.TAB_TO_FIRST };

        const result = reducer(givenState, action);

        expect(result).toEqual<State>({
          direction: "horizontal",
          selectedId: buttonOneId,
          lastActionOrigin: "keyboard",
          tabStops: [buttonOneTabStop, buttonTwoTabStop]
        });
      });
    });

    describe("when the current tab stop is not the first tab stop", () => {
      const givenState: State = Object.freeze({
        direction: "horizontal",
        selectedId: buttonTwoId,
        lastActionOrigin: "mouse",
        tabStops: [buttonOneTabStop, buttonTwoTabStop]
      });

      it("should set the first tab stop as the current tab stop", () => {
        const action: Action = { type: ActionType.TAB_TO_FIRST };

        const result = reducer(givenState, action);

        expect(result).toEqual<State>({
          direction: "horizontal",
          selectedId: buttonOneId,
          lastActionOrigin: "keyboard",
          tabStops: [buttonOneTabStop, buttonTwoTabStop]
        });
      });
    });
  });

  describe("when tabbing to the last tab stop", () => {
    describe("when no tab stops have been registered", () => {
      const givenState: State = Object.freeze({
        direction: "horizontal",
        selectedId: null,
        lastActionOrigin: "mouse",
        tabStops: []
      });

      it("should not change the reducer state", () => {
        const action: Action = { type: ActionType.TAB_TO_LAST };
        const result = reducer(givenState, action);
        expect(result).toEqual<State>(givenState);
      });
    });

    describe("when the current tab stop is the last tab stop", () => {
      const givenState: State = Object.freeze({
        direction: "horizontal",
        selectedId: buttonTwoId,
        lastActionOrigin: "mouse",
        tabStops: [buttonOneTabStop, buttonTwoTabStop]
      });

      it("should only alter the action origin", () => {
        const action: Action = { type: ActionType.TAB_TO_LAST };

        const result = reducer(givenState, action);

        expect(result).toEqual<State>({
          direction: "horizontal",
          selectedId: buttonTwoId,
          lastActionOrigin: "keyboard",
          tabStops: [buttonOneTabStop, buttonTwoTabStop]
        });
      });
    });

    describe("when the current tab stop is not the last tab stop", () => {
      const givenState: State = Object.freeze({
        direction: "horizontal",
        selectedId: buttonOneId,
        lastActionOrigin: "mouse",
        tabStops: [buttonOneTabStop, buttonTwoTabStop]
      });

      it("should set the last tab stop as the current tab stop", () => {
        const action: Action = { type: ActionType.TAB_TO_LAST };

        const result = reducer(givenState, action);

        expect(result).toEqual<State>({
          direction: "horizontal",
          selectedId: buttonTwoId,
          lastActionOrigin: "keyboard",
          tabStops: [buttonOneTabStop, buttonTwoTabStop]
        });
      });
    });
  });
  */

  describe("changing the key config", () => {
    const givenState: State = Object.freeze({
      selectedId: buttonOneId,
      allowFocusing: false,
      tabStops: [buttonOneTabStop, buttonTwoTabStop],
      keyConfig: DEFAULT_KEY_CONFIG
    });
    const newKeyConfig = {
      ...DEFAULT_KEY_CONFIG,
      [Key.ARROW_UP]: undefined,
      [Key.ARROW_DOWN]: undefined
    };
    const action: Action = {
      type: ActionType.KEY_CONFIG_UPDATED,
      payload: { keyConfig: newKeyConfig }
    };
    const result = reducer(givenState, action);
    expect(result).toEqual<State>({
      selectedId: buttonOneId,
      allowFocusing: false,
      tabStops: [buttonOneTabStop, buttonTwoTabStop],
      keyConfig: newKeyConfig
    });
  });
});
