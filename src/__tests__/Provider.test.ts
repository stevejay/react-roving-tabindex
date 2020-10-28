import { RefObject } from "react";
import warning from "warning";
import { Action, ActionType, EventKey, State, TabStop } from "../types";
import { reducer } from "../Provider";

jest.mock("warning");

const DOCUMENT_POSITION_FOLLOWING = 4;

function createMockDomElementRef(index: number): RefObject<Element> {
  return {
    current: ({
      index,
      compareDocumentPosition: (other) =>
        other.index > index ? DOCUMENT_POSITION_FOLLOWING : 0
    } as unknown) as Element
  } as RefObject<Element>;
}

function createTabStop(id: string, index: number): TabStop {
  return {
    id,
    domElementRef: createMockDomElementRef(index),
    disabled: false,
    rowIndex: null
  };
}

const ELEMENT_ONE_ID = "element-1";
const ELEMENT_ONE_TAB_STOP = createTabStop(ELEMENT_ONE_ID, 1);

const ELEMENT_TWO_ID = "element-2";
const ELEMENT_TWO_TAB_STOP = createTabStop(ELEMENT_TWO_ID, 2);

const ELEMENT_THREE_ID = "element-3";
const ELEMENT_THREE_TAB_STOP = createTabStop(ELEMENT_THREE_ID, 3);

const ELEMENT_FOUR_ID = "element-4";
const ELEMENT_FOUR_TAB_STOP = createTabStop(ELEMENT_FOUR_ID, 4);

const ELEMENT_FIVE_ID = "element-5";
const ELEMENT_FIVE_TAB_STOP = createTabStop(ELEMENT_FIVE_ID, 5);

const ELEMENT_SIX_ID = "element-6";
const ELEMENT_SIX_TAB_STOP = createTabStop(ELEMENT_SIX_ID, 6);

describe("reducer", () => {
  beforeEach(() => {
    (warning as jest.Mock).mockReset();
  });

  describe("when registering a tab stop", () => {
    describe("when no tab stops have been registered", () => {
      const givenState: State = Object.freeze({
        selectedId: null,
        allowFocusing: false,
        tabStops: [],
        direction: "horizontal",
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.REGISTER_TAB_STOP,
        payload: ELEMENT_ONE_TAB_STOP
      };

      it("should add the tab stop as the only tab stop", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_ONE_ID,
          tabStops: [ELEMENT_ONE_TAB_STOP]
        });
      });
    });

    describe("when one earlier tab stop has already been registered", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_ONE_ID,
        allowFocusing: false,
        tabStops: [ELEMENT_ONE_TAB_STOP],
        direction: "horizontal",
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.REGISTER_TAB_STOP,
        payload: ELEMENT_TWO_TAB_STOP
      };

      it("should add the new tab stop after the existing tab stop", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP]
        });
      });
    });

    describe("when one later tab stop has already been registered", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_TWO_ID,
        allowFocusing: false,
        tabStops: [ELEMENT_TWO_TAB_STOP],
        direction: "horizontal",
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.REGISTER_TAB_STOP,
        payload: ELEMENT_ONE_TAB_STOP
      };

      it("should add the new tab stop before the existing tab stop", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP]
        });
      });
    });

    describe("when the same tab stop has already been registered", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_ONE_ID,
        allowFocusing: false,
        tabStops: [ELEMENT_ONE_TAB_STOP],
        direction: "horizontal",
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.REGISTER_TAB_STOP,
        payload: ELEMENT_ONE_TAB_STOP
      };

      it("should not add the tab stop again", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>(givenState);
      });

      it("should log a warning", () => {
        reducer(givenState, action);
        expect(warning).toHaveBeenNthCalledWith(
          1,
          false,
          `'${ELEMENT_ONE_ID}' tab stop already registered`
        );
      });
    });

    describe("when the tab stop being registered has no DOM element ref", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_ONE_ID,
        allowFocusing: false,
        tabStops: [ELEMENT_ONE_TAB_STOP],
        direction: "horizontal",
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.REGISTER_TAB_STOP,
        payload: {
          ...ELEMENT_TWO_TAB_STOP,
          domElementRef: { current: null } as RefObject<Element>
        }
      };

      it("should not change the reducer state", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>(givenState);
      });
    });
  });

  describe("when unregistering a tab stop", () => {
    describe("when the tab stop to remove is not registered", () => {
      const givenState: State = Object.freeze({
        selectedId: null,
        allowFocusing: false,
        tabStops: [],
        direction: "horizontal",
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.UNREGISTER_TAB_STOP,
        payload: { id: ELEMENT_ONE_ID }
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
          `'${ELEMENT_ONE_ID}' tab stop already unregistered`
        );
      });
    });

    describe("when the tab stop to remove is registered", () => {
      describe("when it is the currently selected tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_ID,
          allowFocusing: false,
          tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.UNREGISTER_TAB_STOP,
          payload: { id: ELEMENT_ONE_ID }
        };

        it("should unregister the tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_TWO_ID,
            tabStops: [ELEMENT_TWO_TAB_STOP]
          });
        });
      });

      describe("when it is not the currently selected tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_ID,
          allowFocusing: false,
          tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.UNREGISTER_TAB_STOP,
          payload: { id: ELEMENT_TWO_ID }
        };

        it("should unregister the tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            tabStops: [ELEMENT_ONE_TAB_STOP]
          });
        });
      });
    });
  });

  describe("when updating a tab stop", () => {
    describe("when the updated data is the same as the current data", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_ONE_ID,
        allowFocusing: false,
        tabStops: [
          ELEMENT_ONE_TAB_STOP,
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1, disabled: true }
        ],
        direction: "horizontal",
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.TAB_STOP_UPDATED,
        payload: { id: ELEMENT_TWO_ID, rowIndex: 1, disabled: true }
      };

      it("should not change the reducer state", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>(givenState);
      });
    });

    describe("when the updated data is different to the current data", () => {
      describe("when the updated tab stop is not selected", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_ID,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1, disabled: true }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.TAB_STOP_UPDATED,
          payload: { id: ELEMENT_TWO_ID, rowIndex: 2, disabled: false }
        };

        it("should change the tab stop data", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              { ...ELEMENT_TWO_TAB_STOP, rowIndex: 2, disabled: false }
            ]
          });
        });
      });

      describe("when the updated tab stop is selected and becomes disabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_TWO_ID,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            { ...ELEMENT_TWO_TAB_STOP, disabled: false }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.TAB_STOP_UPDATED,
          payload: { id: ELEMENT_TWO_ID, rowIndex: null, disabled: true }
        };

        it("should change the tab stop data and the selectedId", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_ID,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              { ...ELEMENT_TWO_TAB_STOP, disabled: true }
            ]
          });
        });
      });
    });

    describe("when the updated data has an unregistered id", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_ONE_ID,
        allowFocusing: false,
        tabStops: [
          ELEMENT_ONE_TAB_STOP,
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1, disabled: true }
        ],
        direction: "horizontal",
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.TAB_STOP_UPDATED,
        payload: { id: "unregistered-id", rowIndex: 1, disabled: true }
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
          "'unregistered-id' tab stop not registered"
        );
      });
    });
  });

  describe("when clicking on a tab stop", () => {
    describe("when the tab stop is not disabled", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_ONE_ID,
        allowFocusing: false,
        tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
        direction: "horizontal",
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.CLICKED,
        payload: { id: ELEMENT_TWO_ID }
      };

      it("should set the clicked tab stop as the selected tab stop", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_TWO_ID,
          allowFocusing: true
        });
      });
    });

    describe("when the tab stop is disabled", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_ONE_ID,
        allowFocusing: false,
        tabStops: [
          ELEMENT_ONE_TAB_STOP,
          { ...ELEMENT_TWO_TAB_STOP, disabled: true }
        ],
        direction: "horizontal",
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.CLICKED,
        payload: { id: ELEMENT_TWO_ID }
      };

      it("should not change the reducer state", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>(givenState);
      });
    });

    describe("when the click action has an unregistered id", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_ONE_ID,
        allowFocusing: false,
        tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
        direction: "horizontal",
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.CLICKED,
        payload: { id: "unregistered-id" }
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
          "'unregistered-id' tab stop not registered"
        );
      });
    });
  });

  describe("when the roving tabindex is for a toolbar", () => {
    describe("when using the 'horizontal' direction setting", () => {
      describe("when the ArrowRight key is pressed", () => {
        describe("when the next tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "horizontal",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.ArrowRight,
              ctrlKey: false
            }
          };

          it("should tab to the next tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_TWO_ID,
              allowFocusing: true
            });
          });
        });

        describe("when there is no next tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "horizontal",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_ID,
              key: EventKey.ArrowRight,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when the next tab stop is disabled and it is the last tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              { ...ELEMENT_TWO_TAB_STOP, disabled: true }
            ],
            direction: "horizontal",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.ArrowRight,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when the next tab stop is disabled and it is not the last tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              { ...ELEMENT_TWO_TAB_STOP, disabled: true },
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "horizontal",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.ArrowRight,
              ctrlKey: false
            }
          };

          it("should tab to the next enabled tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_THREE_ID,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the ArrowLeft key is pressed", () => {
        describe("when the previous tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "horizontal",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_ID,
              key: EventKey.ArrowLeft,
              ctrlKey: false
            }
          };

          it("should tab to the previous tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_ID,
              allowFocusing: true
            });
          });
        });

        describe("when there is no previous tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "horizontal",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.ArrowLeft,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when the previous tab stop is disabled and it is the first tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: false,
            tabStops: [
              { ...ELEMENT_ONE_TAB_STOP, disabled: true },
              ELEMENT_TWO_TAB_STOP
            ],
            direction: "horizontal",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_ID,
              key: EventKey.ArrowLeft,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when the previous tab stop is disabled and it is not the first tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              { ...ELEMENT_TWO_TAB_STOP, disabled: true },
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "horizontal",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_THREE_ID,
              key: EventKey.ArrowLeft,
              ctrlKey: false
            }
          };

          it("should tab to the previous enabled tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_ID,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the ArrowUp key is pressed", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_ID,
          allowFocusing: false,
          tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_ID,
            key: EventKey.ArrowUp,
            ctrlKey: false
          }
        };

        it("should not change the reducer state", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>(givenState);
        });
      });

      describe("when the ArrowDown key is pressed", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_ID,
          allowFocusing: false,
          tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_ID,
            key: EventKey.ArrowDown,
            ctrlKey: false
          }
        };

        it("should not change the reducer state", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>(givenState);
        });
      });

      describe("when the Home key is pressed", () => {
        describe("when the first tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "horizontal",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_THREE_ID,
              key: EventKey.Home,
              ctrlKey: false
            }
          };

          it("should tab to the first tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_ID,
              allowFocusing: true
            });
          });
        });

        describe("when the first tab stop is not enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: false,
            tabStops: [
              { ...ELEMENT_ONE_TAB_STOP, disabled: true },
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "horizontal",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_THREE_ID,
              key: EventKey.Home,
              ctrlKey: false
            }
          };

          it("should tab to the earliest enabled tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_TWO_ID,
              allowFocusing: true
            });
          });
        });

        describe("when the first tab stop is already the selected tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "horizontal",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.Home,
              ctrlKey: false
            }
          };

          it("should only update allowFocusing", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the Home+Ctrl key is pressed", () => {
        describe("when the first tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "horizontal",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_THREE_ID,
              key: EventKey.Home,
              ctrlKey: true
            }
          };

          it("should tab to the first tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_ID,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the End key is pressed", () => {
        describe("when the last tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "horizontal",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.End,
              ctrlKey: false
            }
          };

          it("should tab to the last tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_THREE_ID,
              allowFocusing: true
            });
          });
        });

        describe("when the last tab stop is not enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              { ...ELEMENT_THREE_TAB_STOP, disabled: true }
            ],
            direction: "horizontal",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.End,
              ctrlKey: false
            }
          };

          it("should tab to the furthest enabled tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_TWO_ID,
              allowFocusing: true
            });
          });
        });

        describe("when the last tab stop is already the selected tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "horizontal",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_THREE_ID,
              key: EventKey.End,
              ctrlKey: false
            }
          };

          it("should only update allowFocusing", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the End+Ctrl key is pressed", () => {
        describe("when the last tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "horizontal",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.End,
              ctrlKey: true
            }
          };

          it("should tab to the last tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_THREE_ID,
              allowFocusing: true
            });
          });
        });
      });
    });

    describe("when using the 'vertical' direction setting", () => {
      describe("when the ArrowDown key is pressed", () => {
        describe("when the next tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "vertical",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.ArrowDown,
              ctrlKey: false
            }
          };

          it("should tab to the next tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_TWO_ID,
              allowFocusing: true
            });
          });
        });

        describe("when there is no next tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "vertical",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_ID,
              key: EventKey.ArrowDown,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when the next tab stop is disabled and it is the last tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              { ...ELEMENT_TWO_TAB_STOP, disabled: true }
            ],
            direction: "vertical",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.ArrowDown,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when the next tab stop is disabled and it is not the last tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              { ...ELEMENT_TWO_TAB_STOP, disabled: true },
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "vertical",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.ArrowDown,
              ctrlKey: false
            }
          };

          it("should tab to the next enabled tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_THREE_ID,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the ArrowUp key is pressed", () => {
        describe("when the previous tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "vertical",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_ID,
              key: EventKey.ArrowUp,
              ctrlKey: false
            }
          };

          it("should tab to the previous tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_ID,
              allowFocusing: true
            });
          });
        });

        describe("when there is no previous tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "vertical",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.ArrowUp,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when the previous tab stop is disabled and it is the first tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: false,
            tabStops: [
              { ...ELEMENT_ONE_TAB_STOP, disabled: true },
              ELEMENT_TWO_TAB_STOP
            ],
            direction: "vertical",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_ID,
              key: EventKey.ArrowUp,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when the previous tab stop is disabled and it is not the first tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              { ...ELEMENT_TWO_TAB_STOP, disabled: true },
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "vertical",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_THREE_ID,
              key: EventKey.ArrowUp,
              ctrlKey: false
            }
          };

          it("should tab to the previous enabled tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_ID,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the ArrowLeft key is pressed", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_ID,
          allowFocusing: false,
          tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
          direction: "vertical",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_ID,
            key: EventKey.ArrowLeft,
            ctrlKey: false
          }
        };

        it("should not change the reducer state", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>(givenState);
        });
      });

      describe("when the ArrowRight key is pressed", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_ID,
          allowFocusing: false,
          tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
          direction: "vertical",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_ID,
            key: EventKey.ArrowRight,
            ctrlKey: false
          }
        };

        it("should not change the reducer state", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>(givenState);
        });
      });

      describe("when the Home key is pressed", () => {
        describe("when the first tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "vertical",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_THREE_ID,
              key: EventKey.Home,
              ctrlKey: false
            }
          };

          it("should tab to the first tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_ID,
              allowFocusing: true
            });
          });
        });

        describe("when the first tab stop is not enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: false,
            tabStops: [
              { ...ELEMENT_ONE_TAB_STOP, disabled: true },
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "vertical",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_THREE_ID,
              key: EventKey.Home,
              ctrlKey: false
            }
          };

          it("should tab to the earliest enabled tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_TWO_ID,
              allowFocusing: true
            });
          });
        });

        describe("when the first tab stop is already the selected tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "vertical",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.Home,
              ctrlKey: false
            }
          };

          it("should only update allowFocusing", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the Home+Ctrl key is pressed", () => {
        describe("when the first tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "vertical",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_THREE_ID,
              key: EventKey.Home,
              ctrlKey: true
            }
          };

          it("should tab to the first tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_ID,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the End key is pressed", () => {
        describe("when the last tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "vertical",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.End,
              ctrlKey: false
            }
          };

          it("should tab to the last tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_THREE_ID,
              allowFocusing: true
            });
          });
        });

        describe("when the last tab stop is not enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              { ...ELEMENT_THREE_TAB_STOP, disabled: true }
            ],
            direction: "vertical",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.End,
              ctrlKey: false
            }
          };

          it("should tab to the furthest enabled tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_TWO_ID,
              allowFocusing: true
            });
          });
        });

        describe("when the last tab stop is already the selected tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "vertical",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_THREE_ID,
              key: EventKey.End,
              ctrlKey: false
            }
          };

          it("should only update allowFocusing", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the End+Ctrl key is pressed", () => {
        describe("when the last tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "vertical",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.End,
              ctrlKey: true
            }
          };

          it("should tab to the last tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_THREE_ID,
              allowFocusing: true
            });
          });
        });
      });
    });

    describe("when using the 'both' direction setting", () => {
      describe("when the ArrowRight key is pressed", () => {
        describe("when the next tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.ArrowRight,
              ctrlKey: false
            }
          };

          it("should tab to the next tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_TWO_ID,
              allowFocusing: true
            });
          });
        });

        describe("when there is no next tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_ID,
              key: EventKey.ArrowRight,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when the next tab stop is disabled and it is the last tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              { ...ELEMENT_TWO_TAB_STOP, disabled: true }
            ],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.ArrowRight,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when the next tab stop is disabled and it is not the last tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              { ...ELEMENT_TWO_TAB_STOP, disabled: true },
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.ArrowRight,
              ctrlKey: false
            }
          };

          it("should tab to the next enabled tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_THREE_ID,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the ArrowLeft key is pressed", () => {
        describe("when the previous tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_ID,
              key: EventKey.ArrowLeft,
              ctrlKey: false
            }
          };

          it("should tab to the previous tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_ID,
              allowFocusing: true
            });
          });
        });

        describe("when there is no previous tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.ArrowLeft,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when the previous tab stop is disabled and it is the first tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: false,
            tabStops: [
              { ...ELEMENT_ONE_TAB_STOP, disabled: true },
              ELEMENT_TWO_TAB_STOP
            ],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_ID,
              key: EventKey.ArrowLeft,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when the previous tab stop is disabled and it is not the first tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              { ...ELEMENT_TWO_TAB_STOP, disabled: true },
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_THREE_ID,
              key: EventKey.ArrowLeft,
              ctrlKey: false
            }
          };

          it("should tab to the previous enabled tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_ID,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the ArrowDown key is pressed", () => {
        describe("when the next tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.ArrowDown,
              ctrlKey: false
            }
          };

          it("should tab to the next tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_TWO_ID,
              allowFocusing: true
            });
          });
        });

        describe("when there is no next tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_ID,
              key: EventKey.ArrowDown,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when the next tab stop is disabled and it is the last tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              { ...ELEMENT_TWO_TAB_STOP, disabled: true }
            ],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.ArrowDown,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when the next tab stop is disabled and it is not the last tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              { ...ELEMENT_TWO_TAB_STOP, disabled: true },
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.ArrowDown,
              ctrlKey: false
            }
          };

          it("should tab to the next enabled tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_THREE_ID,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the ArrowUp key is pressed", () => {
        describe("when the previous tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_ID,
              key: EventKey.ArrowUp,
              ctrlKey: false
            }
          };

          it("should tab to the previous tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_ID,
              allowFocusing: true
            });
          });
        });

        describe("when there is no previous tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.ArrowUp,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when the previous tab stop is disabled and it is the first tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: false,
            tabStops: [
              { ...ELEMENT_ONE_TAB_STOP, disabled: true },
              ELEMENT_TWO_TAB_STOP
            ],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_ID,
              key: EventKey.ArrowUp,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when the previous tab stop is disabled and it is not the first tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              { ...ELEMENT_TWO_TAB_STOP, disabled: true },
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_THREE_ID,
              key: EventKey.ArrowUp,
              ctrlKey: false
            }
          };

          it("should tab to the previous enabled tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_ID,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the Home key is pressed", () => {
        describe("when the first tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_THREE_ID,
              key: EventKey.Home,
              ctrlKey: false
            }
          };

          it("should tab to the first tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_ID,
              allowFocusing: true
            });
          });
        });

        describe("when the first tab stop is not enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: false,
            tabStops: [
              { ...ELEMENT_ONE_TAB_STOP, disabled: true },
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_THREE_ID,
              key: EventKey.Home,
              ctrlKey: false
            }
          };

          it("should tab to the earliest enabled tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_TWO_ID,
              allowFocusing: true
            });
          });
        });

        describe("when the first tab stop is already the selected tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.Home,
              ctrlKey: false
            }
          };

          it("should only update allowFocusing", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the Home+Ctrl key is pressed", () => {
        describe("when the first tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_THREE_ID,
              key: EventKey.Home,
              ctrlKey: true
            }
          };

          it("should tab to the first tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_ID,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the End key is pressed", () => {
        describe("when the last tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.End,
              ctrlKey: false
            }
          };

          it("should tab to the last tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_THREE_ID,
              allowFocusing: true
            });
          });
        });

        describe("when the last tab stop is not enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              { ...ELEMENT_THREE_TAB_STOP, disabled: true }
            ],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.End,
              ctrlKey: false
            }
          };

          it("should tab to the furthest enabled tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_TWO_ID,
              allowFocusing: true
            });
          });
        });

        describe("when the last tab stop is already the selected tab stop", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_THREE_ID,
              key: EventKey.End,
              ctrlKey: false
            }
          };

          it("should only update allowFocusing", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the End+Ctrl key is pressed", () => {
        describe("when the last tab stop is enabled", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "both",
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_ID,
              key: EventKey.End,
              ctrlKey: true
            }
          };

          it("should tab to the last tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_THREE_ID,
              allowFocusing: true
            });
          });
        });
      });
    });

    describe("when the action is for an unregistered id", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_ONE_ID,
        allowFocusing: false,
        tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
        direction: "horizontal",
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: "unregistered-id",
          key: EventKey.ArrowRight,
          ctrlKey: false
        }
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
          "'unregistered-id' tab stop not registered"
        );
      });
    });

    describe("when the tab stop of the action is disabled", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_ONE_ID,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, disabled: true },
          ELEMENT_TWO_TAB_STOP
        ],
        direction: "horizontal",
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_ONE_ID,
          key: EventKey.ArrowRight,
          ctrlKey: false
        }
      };

      it("should not change the reducer state", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>(givenState);
      });
    });
  });

  describe("when the roving tabindex is for a grid", () => {
    describe("when tabbing to the next tab stop in the current row", () => {
      describe("when the next tab stop is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_ID,
            key: EventKey.ArrowRight,
            ctrlKey: false
          }
        };

        it("should tab to the next tab stop in the current row", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: true
          });
        });
      });

      describe("when there is no next tab stop in the current row", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_ID,
            key: EventKey.ArrowRight,
            ctrlKey: false
          }
        };

        it("should not change the reducer state", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>(givenState);
        });
      });

      describe("when there is no next tab stop in the entire grid", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_TWO_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_TWO_ID,
            key: EventKey.ArrowRight,
            ctrlKey: false
          }
        };

        it("should not change the reducer state", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>(givenState);
        });
      });

      describe("when the next tab stop is disabled and it is the last tab stop in the current row", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0, disabled: true },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_ID,
            key: EventKey.ArrowRight,
            ctrlKey: false
          }
        };

        it("should not change the reducer state", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>(givenState);
        });
      });

      describe("when the next tab stop is disabled and it is not the last tab stop in the current row", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0, disabled: true },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 0 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_ID,
            key: EventKey.ArrowRight,
            ctrlKey: false
          }
        };

        it("should tab to the next enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: true
          });
        });
      });
    });

    describe("when tabbing to the previous tab stop in the current row", () => {
      describe("when the previous tab stop is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_THREE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_ID,
            key: EventKey.ArrowLeft,
            ctrlKey: false
          }
        };

        it("should tab to the previous tab stop in the current row", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: true
          });
        });
      });

      describe("when there is no previous tab stop in the current row", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_TWO_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_TWO_ID,
            key: EventKey.ArrowLeft,
            ctrlKey: false
          }
        };

        it("should not change the reducer state", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>(givenState);
        });
      });

      describe("when there is no previous tab stop in the entire grid", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_ID,
            key: EventKey.ArrowLeft,
            ctrlKey: false
          }
        };

        it("should not change the reducer state", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>(givenState);
        });
      });

      describe("when the previous tab stop is disabled and it is the first tab stop in the current row", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_FOUR_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1, disabled: true },
            { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_FOUR_ID,
            key: EventKey.ArrowLeft,
            ctrlKey: false
          }
        };

        it("should not change the reducer state", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>(givenState);
        });
      });

      describe("when the previous tab stop is disabled and it is not the last first stop in the current row", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_THREE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0, disabled: true },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 0 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_ID,
            key: EventKey.ArrowLeft,
            ctrlKey: false
          }
        };

        it("should tab to the previous enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: true
          });
        });
      });
    });

    describe("when tabbing to the first tab stop", () => {
      describe("when the first tab stop is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_THREE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 2 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_ID,
            key: EventKey.Home,
            ctrlKey: true
          }
        };

        it("should tab to the first tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: true
          });
        });
      });

      describe("when the first tab stop is not enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_THREE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0, disabled: true },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 2 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_ID,
            key: EventKey.Home,
            ctrlKey: true
          }
        };

        it("should tab to the earliest enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: true
          });
        });
      });

      describe("when the first tab stop is already the selected tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 2 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_ID,
            key: EventKey.Home,
            ctrlKey: true
          }
        };

        it("should only update allowFocusing", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({ ...givenState, allowFocusing: true });
        });
      });
    });

    describe("when tabbing to the last tab stop", () => {
      describe("when the last tab stop is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 2 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_ID,
            key: EventKey.End,
            ctrlKey: true
          }
        };

        it("should tab to the last tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: true
          });
        });
      });

      describe("when the last tab stop is not enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 2, disabled: true }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_ID,
            key: EventKey.End,
            ctrlKey: true
          }
        };

        it("should tab to the furthest enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: true
          });
        });
      });

      describe("when the last tab stop is already the selected tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_THREE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 2 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_ID,
            key: EventKey.End,
            ctrlKey: true
          }
        };

        it("should only update allowFocusing", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({ ...givenState, allowFocusing: true });
        });
      });
    });

    describe("when tabbing to the last tab stop in the current row", () => {
      describe("when the last tab stop in the current row is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_ID,
            key: EventKey.End,
            ctrlKey: false
          }
        };

        it("should tab to the last tab stop in the current row", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: true,
            rowStartMap: new Map([
              [0, 0],
              [1, 3]
            ])
          });
        });
      });

      describe("when the last tab stop in the current row is disabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 0, disabled: true },
            { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_ID,
            key: EventKey.End,
            ctrlKey: false
          }
        };

        it("should tab to the last enabled tab stop in the current row", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: true,
            rowStartMap: new Map([
              [0, 0],
              [1, 3]
            ])
          });
        });
      });

      describe("when the last tab stop in the current row is currently selected", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_THREE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_ID,
            key: EventKey.End,
            ctrlKey: false
          }
        };

        it("should only update allowFocusing and rowStartMap", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            allowFocusing: true,
            rowStartMap: new Map([
              [0, 0],
              [1, 3]
            ])
          });
        });
      });

      describe("when the last tab stop in the current row is currently selected and there is no next row", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_THREE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 0 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_ID,
            key: EventKey.End,
            ctrlKey: false
          }
        };

        it("should only update allowFocusing and rowStartMap", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            allowFocusing: true,
            rowStartMap: new Map([[0, 0]])
          });
        });
      });
    });

    describe("when tabbing to the first tab stop in the current row", () => {
      describe("when the first tab stop in the current row is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_FOUR_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_FOUR_ID,
            key: EventKey.Home,
            ctrlKey: false
          }
        };

        it("should tab to the first tab stop in the current row", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_TWO_ID,
            allowFocusing: true,
            rowStartMap: new Map([
              [0, 0],
              [1, 1]
            ])
          });
        });
      });

      describe("when the first tab stop in the current row is disabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_FOUR_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1, disabled: true },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_FOUR_ID,
            key: EventKey.Home,
            ctrlKey: false
          }
        };

        it("should tab to the first enabled tab stop in the current row", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: true,
            rowStartMap: new Map([
              [0, 0],
              [1, 1]
            ])
          });
        });
      });

      describe("when the first tab stop in the current row is currently selected", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_TWO_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_TWO_ID,
            key: EventKey.Home,
            ctrlKey: false
          }
        };

        it("should only update allowFocusing and rowStartMap", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            allowFocusing: true,
            rowStartMap: new Map([
              [0, 0],
              [1, 1]
            ])
          });
        });
      });
    });

    describe("when tabbing to the next row", () => {
      describe("when the tab stop in the next row is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_TWO_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_FIVE_TAB_STOP, rowIndex: 2 },
            { ...ELEMENT_SIX_TAB_STOP, rowIndex: 2 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_TWO_ID,
            key: EventKey.ArrowDown,
            ctrlKey: false
          }
        };

        it("should tab to the next row", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_FOUR_ID,
            allowFocusing: true,
            rowStartMap: new Map([
              [0, 0],
              [1, 2],
              [2, 4]
            ])
          });
        });
      });

      describe("when there is no next row", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_FIVE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_FIVE_TAB_STOP, rowIndex: 2 },
            { ...ELEMENT_SIX_TAB_STOP, rowIndex: 2 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_FIVE_ID,
            key: EventKey.ArrowDown,
            ctrlKey: false
          }
        };

        it("should not change the reducer state", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>(givenState);
        });
      });

      describe("when the tab stop in the next row is disabled and there is another row", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_TWO_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1, disabled: true },
            { ...ELEMENT_FIVE_TAB_STOP, rowIndex: 2 },
            { ...ELEMENT_SIX_TAB_STOP, rowIndex: 2 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_TWO_ID,
            key: EventKey.ArrowDown,
            ctrlKey: false
          }
        };

        it("should tab two rows down", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_SIX_ID,
            allowFocusing: true,
            rowStartMap: new Map([
              [0, 0],
              [1, 2],
              [2, 4]
            ])
          });
        });
      });

      describe("when the tab stop in the next row is disabled and it is the last row", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_TWO_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1, disabled: true }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_TWO_ID,
            key: EventKey.ArrowDown,
            ctrlKey: false
          }
        };

        it("should only update allowFocusing and rowStartMap", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            allowFocusing: true,
            rowStartMap: new Map([
              [0, 0],
              [1, 2]
            ])
          });
        });
      });

      describe("when the tab stop in all subsequent rows are disabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_TWO_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1, disabled: true },
            { ...ELEMENT_FIVE_TAB_STOP, rowIndex: 2 },
            { ...ELEMENT_SIX_TAB_STOP, rowIndex: 2, disabled: true }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_TWO_ID,
            key: EventKey.ArrowDown,
            ctrlKey: false
          }
        };

        it("should only update allowFocusing and rowStartMap", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            allowFocusing: true,
            rowStartMap: new Map([
              [0, 0],
              [1, 2],
              [2, 4]
            ])
          });
        });
      });
    });

    describe("when tabbing to the previous row", () => {
      describe("when the tab stop in the previous row is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_FIVE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_FIVE_TAB_STOP, rowIndex: 2 },
            { ...ELEMENT_SIX_TAB_STOP, rowIndex: 2 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_FIVE_ID,
            key: EventKey.ArrowUp,
            ctrlKey: false
          }
        };

        it("should tab to the previous row", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_THREE_ID,
            allowFocusing: true,
            rowStartMap: new Map([
              [0, 0],
              [1, 2],
              [2, 4]
            ])
          });
        });
      });

      describe("when there is no previous row", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_TWO_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_FIVE_TAB_STOP, rowIndex: 2 },
            { ...ELEMENT_SIX_TAB_STOP, rowIndex: 2 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_TWO_ID,
            key: EventKey.ArrowUp,
            ctrlKey: false
          }
        };

        it("should not change the reducer state", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>(givenState);
        });
      });

      describe("when the tab stop in the previous row is disabled and there is another row before", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_FIVE_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1, disabled: true },
            { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_FIVE_TAB_STOP, rowIndex: 2 },
            { ...ELEMENT_SIX_TAB_STOP, rowIndex: 2 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_FIVE_ID,
            key: EventKey.ArrowUp,
            ctrlKey: false
          }
        };

        it("should tab two rows up", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_ID,
            allowFocusing: true,
            rowStartMap: new Map([
              [0, 0],
              [1, 2],
              [2, 4]
            ])
          });
        });
      });

      describe("when the tab stop in the previous row is disabled and it is the only row before", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_FOUR_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0, disabled: true },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_FOUR_ID,
            key: EventKey.ArrowUp,
            ctrlKey: false
          }
        };

        it("should only update allowFocusing and rowStartMap", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            allowFocusing: true,
            rowStartMap: new Map([
              [0, 0],
              [1, 2]
            ])
          });
        });
      });

      describe("when the tab stop in all previous rows are disabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_SIX_ID,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
            { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0, disabled: true },
            { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
            { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1, disabled: true },
            { ...ELEMENT_FIVE_TAB_STOP, rowIndex: 2 },
            { ...ELEMENT_SIX_TAB_STOP, rowIndex: 2 }
          ],
          direction: "horizontal",
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_SIX_ID,
            key: EventKey.ArrowUp,
            ctrlKey: false
          }
        };

        it("should only update allowFocusing and rowStartMap", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            allowFocusing: true,
            rowStartMap: new Map([
              [0, 0],
              [1, 2],
              [2, 4]
            ])
          });
        });
      });
    });
  });

  describe("when changing the direction", () => {
    const givenState: State = Object.freeze({
      selectedId: ELEMENT_ONE_ID,
      allowFocusing: false,
      tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
      direction: "horizontal",
      rowStartMap: null
    });

    const action: Action = {
      type: ActionType.DIRECTION_UPDATED,
      payload: { direction: "both" }
    };

    it("should update the key config", () => {
      const result = reducer(givenState, action);
      expect(result).toEqual<State>({ ...givenState, direction: "both" });
    });
  });
});
