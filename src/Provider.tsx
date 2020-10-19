import React from "react";
import warning from "warning";

const DOCUMENT_POSITION_PRECEDING = 2;

type KeyDirection = "horizontal" | "vertical" | "both";

export type TabStop = Readonly<{
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  domElementRef: React.RefObject<any>;
}>;

export type State = Readonly<{
  direction: KeyDirection;
  selectedId: string | null;
  lastActionOrigin: "mouse" | "keyboard" | null;
  tabStops: readonly TabStop[];
}>;

export enum ActionTypes {
  REGISTER = "REGISTER",
  UNREGISTER = "UNREGISTER",
  TAB_TO_FIRST = "TAB_TO_FIRST",
  TAB_TO_LAST = "TAB_TO_LAST",
  TAB_TO_PREVIOUS = "TAB_TO_PREVIOUS",
  TAB_TO_NEXT = "TAB_TO_NEXT",
  CLICKED = "CLICKED",
  CHANGE_DIRECTION = "CHANGE_DIRECTION"
}

export type Action =
  | {
      type: ActionTypes.REGISTER;
      payload: TabStop;
    }
  | {
      type: ActionTypes.UNREGISTER;
      payload: { id: TabStop["id"] };
    }
  | {
      type: ActionTypes.TAB_TO_FIRST;
    }
  | {
      type: ActionTypes.TAB_TO_LAST;
    }
  | {
      type: ActionTypes.TAB_TO_PREVIOUS;
      payload: { id: TabStop["id"] };
    }
  | {
      type: ActionTypes.TAB_TO_NEXT;
      payload: { id: TabStop["id"] };
    }
  | {
      type: ActionTypes.CLICKED;
      payload: { id: TabStop["id"] };
    }
  | {
      type: ActionTypes.CHANGE_DIRECTION;
      payload: { direction: KeyDirection };
    };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionTypes.REGISTER: {
      const { tabStops } = state;
      const newTabStop = action.payload;
      if (tabStops.length === 0) {
        return {
          ...state,
          selectedId: newTabStop.id,
          tabStops: [newTabStop]
        };
      }

      const index = tabStops.findIndex(
        (tabStop) => tabStop.id === newTabStop.id
      );

      if (index >= 0) {
        warning(false, `${newTabStop.id} tab stop already registered`);
        return state;
      }

      let indexToInsertAt = tabStops.findIndex(
        (tabStop) =>
          // Return true if newTabStop's element is located earlier in the DOM
          // than tabStop's element, else false:
          !!(
            tabStop.domElementRef.current.compareDocumentPosition(
              newTabStop.domElementRef.current
            ) & DOCUMENT_POSITION_PRECEDING
          )
      );

      // findIndex returns -1 when newTabStop should be inserted
      // at the end of tabStops (the compareDocumentPosition test
      // always returns false in that case).
      if (indexToInsertAt === -1) {
        indexToInsertAt = tabStops.length;
      }

      return {
        ...state,
        tabStops: [
          ...tabStops.slice(0, indexToInsertAt),
          newTabStop,
          ...tabStops.slice(indexToInsertAt)
        ]
      };
    }
    case ActionTypes.UNREGISTER: {
      const id = action.payload.id;

      const filteredTabStops = state.tabStops.filter(
        (tabStop) => tabStop.id !== id
      );

      if (filteredTabStops.length === state.tabStops.length) {
        warning(false, `${id} tab stop already unregistered`);
        return state;
      }

      return {
        ...state,
        selectedId:
          state.selectedId === id
            ? filteredTabStops.length === 0
              ? null
              : filteredTabStops[0].id
            : state.selectedId,
        tabStops: filteredTabStops
      };
    }
    case ActionTypes.TAB_TO_PREVIOUS:
    case ActionTypes.TAB_TO_NEXT: {
      const id = action.payload.id;
      const index = state.tabStops.findIndex((tabStop) => tabStop.id === id);

      if (index === -1) {
        warning(false, `${id} tab stop not registered`);
        return state;
      }

      const newIndex =
        action.type === ActionTypes.TAB_TO_PREVIOUS
          ? index <= 0
            ? state.tabStops.length - 1
            : index - 1
          : index >= state.tabStops.length - 1
          ? 0
          : index + 1;

      return {
        ...state,
        lastActionOrigin: "keyboard",
        selectedId: state.tabStops[newIndex].id
      };
    }
    case ActionTypes.TAB_TO_FIRST:
    case ActionTypes.TAB_TO_LAST: {
      if (!state.tabStops.length) {
        return state;
      }

      const newIndex =
        action.type === ActionTypes.TAB_TO_FIRST
          ? 0
          : state.tabStops.length - 1;

      return {
        ...state,
        lastActionOrigin: "keyboard",
        selectedId: state.tabStops[newIndex].id
      };
    }
    case ActionTypes.CLICKED: {
      return {
        ...state,
        lastActionOrigin: "mouse",
        selectedId: action.payload.id
      };
    }
    case ActionTypes.CHANGE_DIRECTION: {
      return {
        ...state,
        direction: action.payload.direction
      };
    }
    default:
      return state;
  }
}

type Context = Readonly<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>;

export const RovingTabIndexContext = React.createContext<Context>({
  state: {
    direction: "horizontal",
    selectedId: null,
    lastActionOrigin: null,
    tabStops: []
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispatch: () => {}
});

type Props = {
  children: React.ReactNode;
  direction?: KeyDirection;
};

const Provider = ({
  children,
  direction = "horizontal"
}: Props): React.ReactElement => {
  const [state, dispatch] = React.useReducer(reducer, {
    direction: "horizontal",
    selectedId: null,
    lastActionOrigin: null,
    tabStops: []
  });

  const context = React.useMemo<Context>(
    () => ({
      state,
      dispatch
    }),
    [state]
  );

  React.useEffect(() => {
    dispatch({
      type: ActionTypes.CHANGE_DIRECTION,
      payload: { direction }
    });
  }, [direction, dispatch]);

  return (
    <RovingTabIndexContext.Provider value={context}>
      {children}
    </RovingTabIndexContext.Provider>
  );
};

export default Provider;
