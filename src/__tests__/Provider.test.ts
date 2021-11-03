import { RefObject } from "react";
import warning from "warning";
import { Action, ActionType, EventKey, State } from "../types";
import { reducer } from "../Provider";

jest.mock("warning");

function createMockDomElementRef(index: number): RefObject<Element> {
  const DOCUMENT_POSITION_FOLLOWING = 4;
  return {
    current: {
      index,
      compareDocumentPosition: (other) =>
        other.index > index ? DOCUMENT_POSITION_FOLLOWING : 0
    } as unknown as Element
  } as RefObject<Element>;
}

const ELEMENT_ONE_TAB_STOP = {
  id: "element-1",
  domElementRef: createMockDomElementRef(1),
  disabled: false,
  rowIndex: null
};

const ELEMENT_TWO_TAB_STOP = {
  id: "element-2",
  domElementRef: createMockDomElementRef(2),
  disabled: false,
  rowIndex: null
};

const ELEMENT_THREE_TAB_STOP = {
  id: "element-3",
  domElementRef: createMockDomElementRef(3),
  disabled: false,
  rowIndex: null
};

const ELEMENT_FOUR_TAB_STOP = {
  id: "element-4",
  domElementRef: createMockDomElementRef(4),
  disabled: false,
  rowIndex: null
};

const ELEMENT_FIVE_TAB_STOP = {
  id: "element-5",
  domElementRef: createMockDomElementRef(5),
  disabled: false,
  rowIndex: null
};

const ELEMENT_SIX_TAB_STOP = {
  id: "element-6",
  domElementRef: createMockDomElementRef(6),
  disabled: false,
  rowIndex: null
};

beforeEach(() => {
  (warning as jest.Mock).mockReset();
});

// Registration

it("registers a tab stop when no tab stops have been registered", () => {
  const givenState: State = Object.freeze({
    selectedId: null,
    allowFocusing: false,
    tabStops: [],
    direction: "horizontal",
    focusOnClick: false,
    loopAround: false,
    rowStartMap: null
  });

  const action: Action = {
    type: ActionType.REGISTER_TAB_STOP,
    payload: ELEMENT_ONE_TAB_STOP
  };

  const result = reducer(givenState, action);

  expect(result).toEqual<State>({
    ...givenState,
    selectedId: ELEMENT_ONE_TAB_STOP.id,
    tabStops: [ELEMENT_ONE_TAB_STOP]
  });
});

it("registers a tab stop when a tab stop earlier in the DOM is already registered", () => {
  const givenState: State = Object.freeze({
    allowFocusing: false,
    direction: "horizontal",
    focusOnClick: false,
    loopAround: false,
    rowStartMap: null,
    selectedId: ELEMENT_ONE_TAB_STOP.id,
    tabStops: [ELEMENT_ONE_TAB_STOP]
  });

  const action: Action = {
    type: ActionType.REGISTER_TAB_STOP,
    payload: ELEMENT_TWO_TAB_STOP
  };

  const result = reducer(givenState, action);

  expect(result).toEqual<State>({
    ...givenState,
    tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP]
  });
});

it("registers a tab stop when a tab stop later in the DOM is already registered", () => {
  const givenState: State = Object.freeze({
    allowFocusing: false,
    direction: "horizontal",
    focusOnClick: false,
    loopAround: false,
    rowStartMap: null,
    selectedId: ELEMENT_TWO_TAB_STOP.id,
    tabStops: [ELEMENT_TWO_TAB_STOP]
  });

  const action: Action = {
    type: ActionType.REGISTER_TAB_STOP,
    payload: ELEMENT_ONE_TAB_STOP
  };

  const result = reducer(givenState, action);

  expect(result).toEqual<State>({
    ...givenState,
    tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP]
  });
});

it("does not register a tab stop when it has already been registered", () => {
  const givenState: State = Object.freeze({
    allowFocusing: false,
    direction: "horizontal",
    focusOnClick: false,
    loopAround: false,
    rowStartMap: null,
    selectedId: ELEMENT_ONE_TAB_STOP.id,
    tabStops: [ELEMENT_ONE_TAB_STOP]
  });

  const action: Action = {
    type: ActionType.REGISTER_TAB_STOP,
    payload: ELEMENT_ONE_TAB_STOP
  };

  const result = reducer(givenState, action);

  expect(result).toEqual<State>(givenState);
});

it("does not register a tab stop that does not have a DOM element ref", () => {
  const givenState: State = Object.freeze({
    selectedId: null,
    allowFocusing: false,
    tabStops: [],
    direction: "horizontal",
    focusOnClick: false,
    loopAround: false,
    rowStartMap: null
  });

  const action: Action = {
    type: ActionType.REGISTER_TAB_STOP,
    payload: {
      ...ELEMENT_TWO_TAB_STOP,
      domElementRef: { current: null } as RefObject<Element>
    }
  };

  const result = reducer(givenState, action);

  expect(result).toEqual<State>(givenState);
});

it("ignores unregistering a tab stop that has not been registered", () => {
  const givenState: State = Object.freeze({
    selectedId: null,
    allowFocusing: false,
    tabStops: [],
    direction: "horizontal",
    focusOnClick: false,
    loopAround: false,
    rowStartMap: null
  });

  const action: Action = {
    type: ActionType.UNREGISTER_TAB_STOP,
    payload: { id: ELEMENT_ONE_TAB_STOP.id }
  };

  const result = reducer(givenState, action);

  expect(result).toEqual<State>(givenState);
});

it("can unregister a registered tab stop that is the currently focused tab stop", () => {
  const givenState: State = Object.freeze({
    allowFocusing: false,
    direction: "horizontal",
    focusOnClick: false,
    loopAround: false,
    rowStartMap: null,
    selectedId: ELEMENT_ONE_TAB_STOP.id,
    tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP]
  });

  const action: Action = {
    type: ActionType.UNREGISTER_TAB_STOP,
    payload: { id: ELEMENT_ONE_TAB_STOP.id }
  };

  const result = reducer(givenState, action);

  expect(result).toEqual<State>({
    ...givenState,
    selectedId: ELEMENT_TWO_TAB_STOP.id,
    tabStops: [ELEMENT_TWO_TAB_STOP]
  });
});

it("can unregister a registered tab stop that is not the currently focused tab stop", () => {
  const givenState: State = Object.freeze({
    allowFocusing: false,
    direction: "horizontal",
    focusOnClick: false,
    loopAround: false,
    rowStartMap: null,
    selectedId: ELEMENT_ONE_TAB_STOP.id,
    tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP]
  });

  const action: Action = {
    type: ActionType.UNREGISTER_TAB_STOP,
    payload: { id: ELEMENT_TWO_TAB_STOP.id }
  };

  const result = reducer(givenState, action);

  expect(result).toEqual<State>({
    ...givenState,
    tabStops: [ELEMENT_ONE_TAB_STOP]
  });
});

// Updating tab stop parameters

it("ignores an update to a tab stop that does not change the focused tab stop", () => {
  const givenState: State = Object.freeze({
    allowFocusing: false,
    direction: "horizontal",
    focusOnClick: false,
    loopAround: false,
    rowStartMap: null,
    selectedId: ELEMENT_ONE_TAB_STOP.id,
    tabStops: [
      ELEMENT_ONE_TAB_STOP,
      { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1, disabled: true }
    ]
  });

  const action: Action = {
    type: ActionType.TAB_STOP_UPDATED,
    payload: { id: ELEMENT_TWO_TAB_STOP.id, rowIndex: 1, disabled: true }
  };

  const result = reducer(givenState, action);

  expect(result).toEqual<State>(givenState);
});

it("can enable a tab stop that is not the currently focused tab stop", () => {
  const givenState: State = Object.freeze({
    allowFocusing: false,
    direction: "horizontal",
    focusOnClick: false,
    loopAround: false,
    rowStartMap: null,
    selectedId: ELEMENT_ONE_TAB_STOP.id,
    tabStops: [
      ELEMENT_ONE_TAB_STOP,
      { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1, disabled: true }
    ]
  });

  const action: Action = {
    type: ActionType.TAB_STOP_UPDATED,
    payload: { id: ELEMENT_TWO_TAB_STOP.id, rowIndex: 2, disabled: false }
  };

  const result = reducer(givenState, action);

  expect(result).toEqual<State>({
    ...givenState,
    tabStops: [
      ELEMENT_ONE_TAB_STOP,
      { ...ELEMENT_TWO_TAB_STOP, rowIndex: 2, disabled: false }
    ]
  });
});

it("can update a tab stop that is the currently focused tab stop", () => {
  const givenState: State = Object.freeze({
    allowFocusing: false,
    direction: "horizontal",
    focusOnClick: false,
    loopAround: false,
    rowStartMap: null,
    selectedId: ELEMENT_TWO_TAB_STOP.id,
    tabStops: [
      ELEMENT_ONE_TAB_STOP,
      { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1, disabled: false }
    ]
  });

  const action: Action = {
    type: ActionType.TAB_STOP_UPDATED,
    payload: { id: ELEMENT_TWO_TAB_STOP.id, rowIndex: 2, disabled: false }
  };

  const result = reducer(givenState, action);

  expect(result).toEqual<State>({
    ...givenState,
    tabStops: [
      ELEMENT_ONE_TAB_STOP,
      { ...ELEMENT_TWO_TAB_STOP, rowIndex: 2, disabled: false }
    ]
  });
});

it("can disable a tab stop that is the currently focused tab stop", () => {
  const givenState: State = Object.freeze({
    allowFocusing: false,
    direction: "horizontal",
    focusOnClick: false,
    loopAround: false,
    rowStartMap: null,
    selectedId: ELEMENT_TWO_TAB_STOP.id,
    tabStops: [
      ELEMENT_ONE_TAB_STOP,
      { ...ELEMENT_TWO_TAB_STOP, rowIndex: null, disabled: false }
    ]
  });

  const action: Action = {
    type: ActionType.TAB_STOP_UPDATED,
    payload: { id: ELEMENT_TWO_TAB_STOP.id, rowIndex: null, disabled: true }
  };

  const result = reducer(givenState, action);

  expect(result).toEqual<State>({
    ...givenState,
    selectedId: ELEMENT_ONE_TAB_STOP.id,
    tabStops: [
      ELEMENT_ONE_TAB_STOP,
      { ...ELEMENT_TWO_TAB_STOP, rowIndex: null, disabled: true }
    ]
  });
});

it("ignores an update for an unregistered tab stop", () => {
  const givenState: State = Object.freeze({
    allowFocusing: false,
    direction: "horizontal",
    focusOnClick: false,
    loopAround: false,
    rowStartMap: null,
    selectedId: ELEMENT_ONE_TAB_STOP.id,
    tabStops: [
      ELEMENT_ONE_TAB_STOP,
      { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1, disabled: true }
    ]
  });

  const action: Action = {
    type: ActionType.TAB_STOP_UPDATED,
    payload: { id: "unregistered-tab-stop-id", rowIndex: 1, disabled: true }
  };

  const result = reducer(givenState, action);

  expect(result).toEqual<State>(givenState);
});

// Tab stop click handling

it("does not allow focusing when focusOnClick is false and a tab stop is clicked", () => {
  const givenState: State = Object.freeze({
    direction: "horizontal",
    loopAround: false,
    rowStartMap: null,
    selectedId: ELEMENT_ONE_TAB_STOP.id,
    focusOnClick: false,
    allowFocusing: true,
    tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP]
  });

  const action: Action = {
    type: ActionType.CLICKED,
    payload: { id: ELEMENT_TWO_TAB_STOP.id }
  };

  const result = reducer(givenState, action);

  expect(result).toEqual<State>({
    ...givenState,
    selectedId: ELEMENT_TWO_TAB_STOP.id,
    allowFocusing: false
  });
});

it("allows focusing when focusOnClick is true and a tab stop is clicked", () => {
  const givenState: State = Object.freeze({
    direction: "horizontal",
    loopAround: false,
    rowStartMap: null,
    selectedId: ELEMENT_ONE_TAB_STOP.id,
    focusOnClick: true,
    allowFocusing: false,
    tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP]
  });

  const action: Action = {
    type: ActionType.CLICKED,
    payload: { id: ELEMENT_TWO_TAB_STOP.id }
  };

  const result = reducer(givenState, action);

  expect(result).toEqual<State>({
    ...givenState,
    selectedId: ELEMENT_TWO_TAB_STOP.id,
    allowFocusing: true
  });
});

it("should ignore a click on a disabled tab stop", () => {
  const givenState: State = Object.freeze({
    allowFocusing: false,
    direction: "horizontal",
    focusOnClick: false,
    loopAround: false,
    rowStartMap: null,
    selectedId: ELEMENT_ONE_TAB_STOP.id,
    tabStops: [
      ELEMENT_ONE_TAB_STOP,
      { ...ELEMENT_TWO_TAB_STOP, disabled: true }
    ]
  });

  const action: Action = {
    type: ActionType.CLICKED,
    payload: { id: ELEMENT_TWO_TAB_STOP.id }
  };

  const result = reducer(givenState, action);

  expect(result).toEqual<State>(givenState);
});

it("should ignore a click on an unregistered tab stop", () => {
  const givenState: State = Object.freeze({
    allowFocusing: false,
    direction: "horizontal",
    focusOnClick: false,
    loopAround: false,
    rowStartMap: null,
    selectedId: ELEMENT_ONE_TAB_STOP.id,
    tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP]
  });

  const action: Action = {
    type: ActionType.CLICKED,
    payload: { id: "unregistered-tab-stop-id" }
  };

  const result = reducer(givenState, action);

  expect(result).toEqual<State>(givenState);
});

describe("when the roving tabindex is for a toolbar", () => {
  describe("when using the 'horizontal' direction setting", () => {
    describe("when the ArrowRight key is pressed", () => {
      describe("when the next tab stop is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
          direction: "horizontal",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
            key: EventKey.ArrowRight,
            ctrlKey: false
          }
        };

        it("should tab to the next tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when there is no next tab stop", () => {
        describe("when loopAround is false", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "horizontal",
            focusOnClick: false,
            loopAround: false,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_TAB_STOP.id,
              key: EventKey.ArrowRight,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when loopAround is true", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "horizontal",
            focusOnClick: false,
            loopAround: true,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_TAB_STOP.id,
              key: EventKey.ArrowRight,
              ctrlKey: false
            }
          };

          it("should loop around to the first tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_TAB_STOP.id,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the next tab stop is disabled and it is the last tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            { ...ELEMENT_TWO_TAB_STOP, disabled: true }
          ],
          direction: "horizontal",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
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
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            { ...ELEMENT_TWO_TAB_STOP, disabled: true },
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "horizontal",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
            key: EventKey.ArrowRight,
            ctrlKey: false
          }
        };

        it("should tab to the next enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_THREE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });
    });

    describe("when the ArrowLeft key is pressed", () => {
      describe("when the previous tab stop is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_TWO_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
          direction: "horizontal",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_TWO_TAB_STOP.id,
            key: EventKey.ArrowLeft,
            ctrlKey: false
          }
        };

        it("should tab to the previous tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when there is no previous tab stop", () => {
        describe("when loopAround is false", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "horizontal",
            focusOnClick: false,
            loopAround: false,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_TAB_STOP.id,
              key: EventKey.ArrowLeft,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when loopAround is true", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "horizontal",
            focusOnClick: false,
            loopAround: true,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_TAB_STOP.id,
              key: EventKey.ArrowLeft,
              ctrlKey: false
            }
          };

          it("should loop around to the last tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_TWO_TAB_STOP.id,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the previous tab stop is disabled and it is the first tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_TWO_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, disabled: true },
            ELEMENT_TWO_TAB_STOP
          ],
          direction: "horizontal",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_TWO_TAB_STOP.id,
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
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            { ...ELEMENT_TWO_TAB_STOP, disabled: true },
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "horizontal",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_TAB_STOP.id,
            key: EventKey.ArrowLeft,
            ctrlKey: false
          }
        };

        it("should tab to the previous enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });
    });

    describe("when the ArrowUp key is pressed", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_ONE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_ONE_TAB_STOP.id,
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
        selectedId: ELEMENT_ONE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_ONE_TAB_STOP.id,
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
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "horizontal",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_TAB_STOP.id,
            key: EventKey.Home,
            ctrlKey: false
          }
        };

        it("should tab to the first tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when the first tab stop is not enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, disabled: true },
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "horizontal",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_TAB_STOP.id,
            key: EventKey.Home,
            ctrlKey: false
          }
        };

        it("should tab to the earliest enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when the first tab stop is already the selected tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "horizontal",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
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
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "horizontal",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_TAB_STOP.id,
            key: EventKey.Home,
            ctrlKey: true
          }
        };

        it("should tab to the first tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });
    });

    describe("when the End key is pressed", () => {
      describe("when the last tab stop is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "horizontal",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
            key: EventKey.End,
            ctrlKey: false
          }
        };

        it("should tab to the last tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_THREE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when the last tab stop is not enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            { ...ELEMENT_THREE_TAB_STOP, disabled: true }
          ],
          direction: "horizontal",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
            key: EventKey.End,
            ctrlKey: false
          }
        };

        it("should tab to the furthest enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when the last tab stop is already the selected tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "horizontal",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_TAB_STOP.id,
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
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "horizontal",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
            key: EventKey.End,
            ctrlKey: true
          }
        };

        it("should tab to the last tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_THREE_TAB_STOP.id,
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
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
          direction: "vertical",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
            key: EventKey.ArrowDown,
            ctrlKey: false
          }
        };

        it("should tab to the next tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when there is no next tab stop", () => {
        describe("when loopAround is false", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "vertical",
            focusOnClick: false,
            loopAround: false,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_TAB_STOP.id,
              key: EventKey.ArrowDown,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when loopAround is true", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "vertical",
            focusOnClick: false,
            loopAround: true,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_TAB_STOP.id,
              key: EventKey.ArrowDown,
              ctrlKey: false
            }
          };

          it("should loop around to the first tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_TAB_STOP.id,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the next tab stop is disabled and it is the last tab stop", () => {
        describe("when loopAround is false", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              { ...ELEMENT_THREE_TAB_STOP, disabled: true }
            ],
            direction: "vertical",
            focusOnClick: false,
            loopAround: false,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_TAB_STOP.id,
              key: EventKey.ArrowDown,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when loopAround is true", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [
              ELEMENT_ONE_TAB_STOP,
              ELEMENT_TWO_TAB_STOP,
              { ...ELEMENT_THREE_TAB_STOP, disabled: true }
            ],
            direction: "vertical",
            focusOnClick: false,
            loopAround: true,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_TAB_STOP.id,
              key: EventKey.ArrowDown,
              ctrlKey: false
            }
          };

          it("should loop around to the first tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_TAB_STOP.id,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the next tab stop is disabled and it is not the last tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            { ...ELEMENT_TWO_TAB_STOP, disabled: true },
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "vertical",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
            key: EventKey.ArrowDown,
            ctrlKey: false
          }
        };

        it("should tab to the next enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_THREE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });
    });

    describe("when the ArrowUp key is pressed", () => {
      describe("when the previous tab stop is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_TWO_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
          direction: "vertical",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_TWO_TAB_STOP.id,
            key: EventKey.ArrowUp,
            ctrlKey: false
          }
        };

        it("should tab to the previous tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when there is no previous tab stop", () => {
        describe("when loopAround is false", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "vertical",
            focusOnClick: false,
            loopAround: false,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_TAB_STOP.id,
              key: EventKey.ArrowUp,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when loopAround is true", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "vertical",
            focusOnClick: false,
            loopAround: true,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_TAB_STOP.id,
              key: EventKey.ArrowUp,
              ctrlKey: false
            }
          };

          it("should loop around to the last tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_TWO_TAB_STOP.id,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the previous tab stop is disabled and it is the first tab stop", () => {
        describe("when loopAround is false", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [
              { ...ELEMENT_ONE_TAB_STOP, disabled: true },
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "vertical",
            focusOnClick: false,
            loopAround: false,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_TAB_STOP.id,
              key: EventKey.ArrowUp,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when loopAround is true", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [
              { ...ELEMENT_ONE_TAB_STOP, disabled: true },
              ELEMENT_TWO_TAB_STOP,
              ELEMENT_THREE_TAB_STOP
            ],
            direction: "vertical",
            focusOnClick: false,
            loopAround: true,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_TAB_STOP.id,
              key: EventKey.ArrowUp,
              ctrlKey: false
            }
          };

          it("should loop around to the last tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_THREE_TAB_STOP.id,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the previous tab stop is disabled and it is not the first tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            { ...ELEMENT_TWO_TAB_STOP, disabled: true },
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "vertical",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_TAB_STOP.id,
            key: EventKey.ArrowUp,
            ctrlKey: false
          }
        };

        it("should tab to the previous enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });
    });

    describe("when the ArrowLeft key is pressed", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_ONE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
        direction: "vertical",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_ONE_TAB_STOP.id,
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
        selectedId: ELEMENT_ONE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
        direction: "vertical",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_ONE_TAB_STOP.id,
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
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "vertical",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_TAB_STOP.id,
            key: EventKey.Home,
            ctrlKey: false
          }
        };

        it("should tab to the first tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when the first tab stop is not enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, disabled: true },
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "vertical",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_TAB_STOP.id,
            key: EventKey.Home,
            ctrlKey: false
          }
        };

        it("should tab to the earliest enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when the first tab stop is already the selected tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "vertical",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
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
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "vertical",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_TAB_STOP.id,
            key: EventKey.Home,
            ctrlKey: true
          }
        };

        it("should tab to the first tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });
    });

    describe("when the End key is pressed", () => {
      describe("when the last tab stop is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "vertical",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
            key: EventKey.End,
            ctrlKey: false
          }
        };

        it("should tab to the last tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_THREE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when the last tab stop is not enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            { ...ELEMENT_THREE_TAB_STOP, disabled: true }
          ],
          direction: "vertical",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
            key: EventKey.End,
            ctrlKey: false
          }
        };

        it("should tab to the furthest enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when the last tab stop is already the selected tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "vertical",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_TAB_STOP.id,
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
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "vertical",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
            key: EventKey.End,
            ctrlKey: true
          }
        };

        it("should tab to the last tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_THREE_TAB_STOP.id,
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
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
            key: EventKey.ArrowRight,
            ctrlKey: false
          }
        };

        it("should tab to the next tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when there is no next tab stop", () => {
        describe("when loopAround is false", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "both",
            focusOnClick: false,
            loopAround: false,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_TAB_STOP.id,
              key: EventKey.ArrowRight,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when loopAround is true", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "both",
            focusOnClick: false,
            loopAround: true,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_TAB_STOP.id,
              key: EventKey.ArrowRight,
              ctrlKey: false
            }
          };

          it("should loop around to the first tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_TAB_STOP.id,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the next tab stop is disabled and it is the last tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            { ...ELEMENT_TWO_TAB_STOP, disabled: true }
          ],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
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
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            { ...ELEMENT_TWO_TAB_STOP, disabled: true },
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
            key: EventKey.ArrowRight,
            ctrlKey: false
          }
        };

        it("should tab to the next enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_THREE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });
    });

    describe("when the ArrowLeft key is pressed", () => {
      describe("when the previous tab stop is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_TWO_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_TWO_TAB_STOP.id,
            key: EventKey.ArrowLeft,
            ctrlKey: false
          }
        };

        it("should tab to the previous tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when there is no previous tab stop", () => {
        describe("when loopAround is false", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "both",
            focusOnClick: false,
            loopAround: false,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_TAB_STOP.id,
              key: EventKey.ArrowLeft,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when loopAround is true", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "both",
            focusOnClick: false,
            loopAround: true,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_TAB_STOP.id,
              key: EventKey.ArrowLeft,
              ctrlKey: false
            }
          };

          it("should loop around to the last tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_TWO_TAB_STOP.id,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the previous tab stop is disabled and it is the first tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_TWO_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, disabled: true },
            ELEMENT_TWO_TAB_STOP
          ],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_TWO_TAB_STOP.id,
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
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            { ...ELEMENT_TWO_TAB_STOP, disabled: true },
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_TAB_STOP.id,
            key: EventKey.ArrowLeft,
            ctrlKey: false
          }
        };

        it("should tab to the previous enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });
    });

    describe("when the ArrowDown key is pressed", () => {
      describe("when the next tab stop is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
            key: EventKey.ArrowDown,
            ctrlKey: false
          }
        };

        it("should tab to the next tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when there is no next tab stop", () => {
        describe("when loopAround is false", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "both",
            focusOnClick: false,
            loopAround: false,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_TAB_STOP.id,
              key: EventKey.ArrowDown,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when loopAround is true", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "both",
            focusOnClick: false,
            loopAround: true,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_TWO_TAB_STOP.id,
              key: EventKey.ArrowDown,
              ctrlKey: false
            }
          };

          it("should loop around to the first tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_ONE_TAB_STOP.id,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the next tab stop is disabled and it is the last tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            { ...ELEMENT_TWO_TAB_STOP, disabled: true }
          ],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
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
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            { ...ELEMENT_TWO_TAB_STOP, disabled: true },
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
            key: EventKey.ArrowDown,
            ctrlKey: false
          }
        };

        it("should tab to the next enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_THREE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });
    });

    describe("when the ArrowUp key is pressed", () => {
      describe("when the previous tab stop is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_TWO_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_TWO_TAB_STOP.id,
            key: EventKey.ArrowUp,
            ctrlKey: false
          }
        };

        it("should tab to the previous tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when there is no previous tab stop", () => {
        describe("when loopAround is false", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "both",
            focusOnClick: false,
            loopAround: false,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_TAB_STOP.id,
              key: EventKey.ArrowUp,
              ctrlKey: false
            }
          };

          it("should not change the reducer state", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>(givenState);
          });
        });

        describe("when loopAround is true", () => {
          const givenState: State = Object.freeze({
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: false,
            tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
            direction: "both",
            focusOnClick: false,
            loopAround: true,
            rowStartMap: null
          });

          const action: Action = {
            type: ActionType.KEY_DOWN,
            payload: {
              id: ELEMENT_ONE_TAB_STOP.id,
              key: EventKey.ArrowUp,
              ctrlKey: false
            }
          };

          it("should loop around to the last tab stop", () => {
            const result = reducer(givenState, action);
            expect(result).toEqual<State>({
              ...givenState,
              selectedId: ELEMENT_TWO_TAB_STOP.id,
              allowFocusing: true
            });
          });
        });
      });

      describe("when the previous tab stop is disabled and it is the first tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_TWO_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, disabled: true },
            ELEMENT_TWO_TAB_STOP
          ],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_TWO_TAB_STOP.id,
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
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            { ...ELEMENT_TWO_TAB_STOP, disabled: true },
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_TAB_STOP.id,
            key: EventKey.ArrowUp,
            ctrlKey: false
          }
        };

        it("should tab to the previous enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });
    });

    describe("when the Home key is pressed", () => {
      describe("when the first tab stop is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_TAB_STOP.id,
            key: EventKey.Home,
            ctrlKey: false
          }
        };

        it("should tab to the first tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when the first tab stop is not enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            { ...ELEMENT_ONE_TAB_STOP, disabled: true },
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_TAB_STOP.id,
            key: EventKey.Home,
            ctrlKey: false
          }
        };

        it("should tab to the earliest enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when the first tab stop is already the selected tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
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
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_TAB_STOP.id,
            key: EventKey.Home,
            ctrlKey: true
          }
        };

        it("should tab to the first tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_ONE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });
    });

    describe("when the End key is pressed", () => {
      describe("when the last tab stop is enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
            key: EventKey.End,
            ctrlKey: false
          }
        };

        it("should tab to the last tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_THREE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when the last tab stop is not enabled", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            { ...ELEMENT_THREE_TAB_STOP, disabled: true }
          ],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
            key: EventKey.End,
            ctrlKey: false
          }
        };

        it("should tab to the furthest enabled tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_TWO_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });

      describe("when the last tab stop is already the selected tab stop", () => {
        const givenState: State = Object.freeze({
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_THREE_TAB_STOP.id,
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
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: false,
          tabStops: [
            ELEMENT_ONE_TAB_STOP,
            ELEMENT_TWO_TAB_STOP,
            ELEMENT_THREE_TAB_STOP
          ],
          direction: "both",
          focusOnClick: false,
          loopAround: false,
          rowStartMap: null
        });

        const action: Action = {
          type: ActionType.KEY_DOWN,
          payload: {
            id: ELEMENT_ONE_TAB_STOP.id,
            key: EventKey.End,
            ctrlKey: true
          }
        };

        it("should tab to the last tab stop", () => {
          const result = reducer(givenState, action);
          expect(result).toEqual<State>({
            ...givenState,
            selectedId: ELEMENT_THREE_TAB_STOP.id,
            allowFocusing: true
          });
        });
      });
    });
  });

  describe("when the action is for an unregistered id", () => {
    const givenState: State = Object.freeze({
      selectedId: ELEMENT_ONE_TAB_STOP.id,
      allowFocusing: false,
      tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
      direction: "horizontal",
      focusOnClick: false,
      loopAround: false,
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
      selectedId: ELEMENT_ONE_TAB_STOP.id,
      allowFocusing: false,
      tabStops: [
        { ...ELEMENT_ONE_TAB_STOP, disabled: true },
        ELEMENT_TWO_TAB_STOP
      ],
      direction: "horizontal",
      focusOnClick: false,
      loopAround: false,
      rowStartMap: null
    });

    const action: Action = {
      type: ActionType.KEY_DOWN,
      payload: {
        id: ELEMENT_ONE_TAB_STOP.id,
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
        selectedId: ELEMENT_ONE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_ONE_TAB_STOP.id,
          key: EventKey.ArrowRight,
          ctrlKey: false
        }
      };

      it("should tab to the next tab stop in the current row", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_TWO_TAB_STOP.id,
          allowFocusing: true
        });
      });
    });

    describe("when there is no next tab stop in the current row", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_ONE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_ONE_TAB_STOP.id,
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
        selectedId: ELEMENT_TWO_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_TWO_TAB_STOP.id,
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
        selectedId: ELEMENT_ONE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0, disabled: true },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_ONE_TAB_STOP.id,
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
        selectedId: ELEMENT_ONE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0, disabled: true },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 0 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_ONE_TAB_STOP.id,
          key: EventKey.ArrowRight,
          ctrlKey: false
        }
      };

      it("should tab to the next enabled tab stop", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: true
        });
      });
    });
  });

  describe("when tabbing to the previous tab stop in the current row", () => {
    describe("when the previous tab stop is enabled", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_THREE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_THREE_TAB_STOP.id,
          key: EventKey.ArrowLeft,
          ctrlKey: false
        }
      };

      it("should tab to the previous tab stop in the current row", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_TWO_TAB_STOP.id,
          allowFocusing: true
        });
      });
    });

    describe("when there is no previous tab stop in the current row", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_TWO_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_TWO_TAB_STOP.id,
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
        selectedId: ELEMENT_ONE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_ONE_TAB_STOP.id,
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
        selectedId: ELEMENT_FOUR_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1, disabled: true },
          { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_FOUR_TAB_STOP.id,
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
        selectedId: ELEMENT_THREE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0, disabled: true },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 0 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_THREE_TAB_STOP.id,
          key: EventKey.ArrowLeft,
          ctrlKey: false
        }
      };

      it("should tab to the previous enabled tab stop", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: true
        });
      });
    });
  });

  describe("when tabbing to the first tab stop", () => {
    describe("when the first tab stop is enabled", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_THREE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 2 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_THREE_TAB_STOP.id,
          key: EventKey.Home,
          ctrlKey: true
        }
      };

      it("should tab to the first tab stop", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_ONE_TAB_STOP.id,
          allowFocusing: true
        });
      });
    });

    describe("when the first tab stop is not enabled", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_THREE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0, disabled: true },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 2 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_THREE_TAB_STOP.id,
          key: EventKey.Home,
          ctrlKey: true
        }
      };

      it("should tab to the earliest enabled tab stop", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_TWO_TAB_STOP.id,
          allowFocusing: true
        });
      });
    });

    describe("when the first tab stop is already the selected tab stop", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_ONE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 2 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_ONE_TAB_STOP.id,
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
        selectedId: ELEMENT_ONE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 2 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_ONE_TAB_STOP.id,
          key: EventKey.End,
          ctrlKey: true
        }
      };

      it("should tab to the last tab stop", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_THREE_TAB_STOP.id,
          allowFocusing: true
        });
      });
    });

    describe("when the last tab stop is not enabled", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_ONE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 2, disabled: true }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_ONE_TAB_STOP.id,
          key: EventKey.End,
          ctrlKey: true
        }
      };

      it("should tab to the furthest enabled tab stop", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_TWO_TAB_STOP.id,
          allowFocusing: true
        });
      });
    });

    describe("when the last tab stop is already the selected tab stop", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_THREE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 2 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_THREE_TAB_STOP.id,
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
        selectedId: ELEMENT_ONE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_ONE_TAB_STOP.id,
          key: EventKey.End,
          ctrlKey: false
        }
      };

      it("should tab to the last tab stop in the current row", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_THREE_TAB_STOP.id,
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
        selectedId: ELEMENT_ONE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 0, disabled: true },
          { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_ONE_TAB_STOP.id,
          key: EventKey.End,
          ctrlKey: false
        }
      };

      it("should tab to the last enabled tab stop in the current row", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_TWO_TAB_STOP.id,
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
        selectedId: ELEMENT_THREE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_THREE_TAB_STOP.id,
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
        selectedId: ELEMENT_THREE_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 0 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_THREE_TAB_STOP.id,
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
        selectedId: ELEMENT_FOUR_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
          { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_FOUR_TAB_STOP.id,
          key: EventKey.Home,
          ctrlKey: false
        }
      };

      it("should tab to the first tab stop in the current row", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_TWO_TAB_STOP.id,
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
        selectedId: ELEMENT_FOUR_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1, disabled: true },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
          { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_FOUR_TAB_STOP.id,
          key: EventKey.Home,
          ctrlKey: false
        }
      };

      it("should tab to the first enabled tab stop in the current row", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_THREE_TAB_STOP.id,
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
        selectedId: ELEMENT_TWO_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 1 },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
          { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_TWO_TAB_STOP.id,
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
    describe("when there is no tab stop in the relative position in the next row", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_FOUR_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
          { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 },
          { ...ELEMENT_FIVE_TAB_STOP, rowIndex: 2 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_FOUR_TAB_STOP.id,
          key: EventKey.ArrowDown,
          ctrlKey: false
        }
      };

      it("should not tab to the next row", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_FOUR_TAB_STOP.id,
          allowFocusing: true,
          rowStartMap: new Map([
            [0, 0],
            [1, 2],
            [2, 4]
          ])
        });
      });
    });

    describe("when the tab stop in the next row is enabled", () => {
      const givenState: State = Object.freeze({
        selectedId: ELEMENT_TWO_TAB_STOP.id,
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
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_TWO_TAB_STOP.id,
          key: EventKey.ArrowDown,
          ctrlKey: false
        }
      };

      it("should tab to the next row", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_FOUR_TAB_STOP.id,
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
        selectedId: ELEMENT_FIVE_TAB_STOP.id,
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
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_FIVE_TAB_STOP.id,
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
        selectedId: ELEMENT_TWO_TAB_STOP.id,
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
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_TWO_TAB_STOP.id,
          key: EventKey.ArrowDown,
          ctrlKey: false
        }
      };

      it("should tab two rows down", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_SIX_TAB_STOP.id,
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
        selectedId: ELEMENT_TWO_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
          { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1, disabled: true }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_TWO_TAB_STOP.id,
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
        selectedId: ELEMENT_TWO_TAB_STOP.id,
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
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_TWO_TAB_STOP.id,
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
        selectedId: ELEMENT_FIVE_TAB_STOP.id,
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
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_FIVE_TAB_STOP.id,
          key: EventKey.ArrowUp,
          ctrlKey: false
        }
      };

      it("should tab to the previous row", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_THREE_TAB_STOP.id,
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
        selectedId: ELEMENT_TWO_TAB_STOP.id,
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
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_TWO_TAB_STOP.id,
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
        selectedId: ELEMENT_FIVE_TAB_STOP.id,
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
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_FIVE_TAB_STOP.id,
          key: EventKey.ArrowUp,
          ctrlKey: false
        }
      };

      it("should tab two rows up", () => {
        const result = reducer(givenState, action);
        expect(result).toEqual<State>({
          ...givenState,
          selectedId: ELEMENT_ONE_TAB_STOP.id,
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
        selectedId: ELEMENT_FOUR_TAB_STOP.id,
        allowFocusing: false,
        tabStops: [
          { ...ELEMENT_ONE_TAB_STOP, rowIndex: 0 },
          { ...ELEMENT_TWO_TAB_STOP, rowIndex: 0, disabled: true },
          { ...ELEMENT_THREE_TAB_STOP, rowIndex: 1 },
          { ...ELEMENT_FOUR_TAB_STOP, rowIndex: 1 }
        ],
        direction: "horizontal",
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_FOUR_TAB_STOP.id,
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
        selectedId: ELEMENT_SIX_TAB_STOP.id,
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
        focusOnClick: false,
        loopAround: false,
        rowStartMap: null
      });

      const action: Action = {
        type: ActionType.KEY_DOWN,
        payload: {
          id: ELEMENT_SIX_TAB_STOP.id,
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

describe("when changing all of the options", () => {
  const givenState: State = Object.freeze({
    selectedId: ELEMENT_ONE_TAB_STOP.id,
    allowFocusing: false,
    tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
    direction: "horizontal",
    focusOnClick: false,
    loopAround: false,
    rowStartMap: null
  });

  const action: Action = {
    type: ActionType.OPTIONS_UPDATED,
    payload: { direction: "both", focusOnClick: true, loopAround: true }
  };

  it("should update the key config", () => {
    const result = reducer(givenState, action);
    expect(result).toEqual<State>({
      ...givenState,
      direction: "both",
      focusOnClick: true,
      loopAround: true
    });
  });
});

describe("when changing some of the options", () => {
  const givenState: State = Object.freeze({
    selectedId: ELEMENT_ONE_TAB_STOP.id,
    allowFocusing: false,
    tabStops: [ELEMENT_ONE_TAB_STOP, ELEMENT_TWO_TAB_STOP],
    direction: "horizontal",
    focusOnClick: false,
    loopAround: false,
    rowStartMap: null
  });

  const action: Action = {
    type: ActionType.OPTIONS_UPDATED,
    payload: { direction: "both" }
  };

  it("should update the key config", () => {
    const result = reducer(givenState, action);
    expect(result).toEqual<State>({
      ...givenState,
      direction: "both",
      focusOnClick: false,
      loopAround: false
    });
  });
});
