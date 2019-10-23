import findIndex from "array-find-index";
import React from "react";
import warning from "warning";

const DOCUMENT_POSITION_PRECEDING = 2;

type KeyDirection = "horizontal" | "vertical" | "both";

type TabStop = {
  id: string;
  domElementRef: React.RefObject<any>;
};

type State = {
  selectedId: string | null;
  lastActionOrigin: "mouse" | "keyboard";
  tabStops: Array<TabStop>;
  firstId: string | null;
  lastId: string | null;
};

export enum ActionTypes {
  REGISTER = "REGISTER",
  UNREGISTER = "UNREGISTER",
  TAB_TO_FIRST = "TAB_TO_FIRST",
  TAB_TO_LAST = "TAB_TO_LAST",
  TAB_TO_PREVIOUS = "TAB_TO_PREVIOUS",
  TAB_TO_NEXT = "TAB_TO_NEXT",
  CLICKED = "CLICKED"
}

type Action =
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
      payload: { id: TabStop["id"] };
    }
  | {
      type: ActionTypes.TAB_TO_LAST;
      payload: { id: TabStop["id"] };
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
    };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionTypes.REGISTER: {
      const { tabStops } = state;
      const newTabStop = action.payload;
      if (tabStops.length === 0) {
        return {
          ...state,
          selectedId: newTabStop.id,
          tabStops: [newTabStop],
          firstId: newTabStop.id,
          lastId: newTabStop.id
        };
      }
      const index = findIndex(
        tabStops,
        tabStop => tabStop.id === newTabStop.id
      );
      if (index >= 0) {
        warning(false, `${newTabStop.id} tab stop already registered`);
        return state;
      }
      const indexAfter = findIndex(
        tabStops,
        tabStop =>
          !!(
            tabStop.domElementRef.current.compareDocumentPosition(
              newTabStop.domElementRef.current
            ) & DOCUMENT_POSITION_PRECEDING
          )
      );
      const firstIndex = findIndex(tabStops, tabStop => tabStop.id === state.firstId);
      const firstStop = tabStops[firstIndex];
      const newTabStopIsFirst = firstStop.domElementRef.current.compareDocumentPosition(newTabStop.domElementRef.current) & DOCUMENT_POSITION_PRECEDING;
      const firstId = newTabStopIsFirst ? newTabStop.id : state.firstId;
      const lastIndex = findIndex(tabStops, tabStop => tabStop.id === state.lastId);
      const lastStop = tabStops[lastIndex];
      const newTabStopIsLast = newTabStop.domElementRef.current.compareDocumentPosition(lastStop.domElementRef.current) & DOCUMENT_POSITION_PRECEDING;
      const lastId = newTabStopIsLast ? newTabStop.id : state.lastId;
      return {
        ...state,
        tabStops: [
          ...tabStops.slice(0, indexAfter),
          newTabStop,
          ...tabStops.slice(indexAfter)
        ],
        firstId,
        lastId
      };
    }
    case ActionTypes.UNREGISTER: {
      const id = action.payload.id;
      const tabStops = state.tabStops.filter(tabStop => tabStop.id !== id);
      if (tabStops.length === state.tabStops.length) {
        warning(false, `${id} tab stop already unregistered`);
        return state;
      }
      return {
        ...state,
        selectedId:
          state.selectedId === id
            ? tabStops.length === 0
              ? null
              : tabStops[0].id
            : state.selectedId,
        tabStops
      };
    }
    case ActionTypes.TAB_TO_FIRST:
    case ActionTypes.TAB_TO_LAST: {
      return {
        ...state,
        lastActionOrigin: "keyboard",
        selectedId: action.type === ActionTypes.TAB_TO_FIRST ? state.firstId : state.lastId
      };
    }
    case ActionTypes.TAB_TO_PREVIOUS:
    case ActionTypes.TAB_TO_NEXT: {
      const id = action.payload.id;
      const index = findIndex(state.tabStops, tabStop => tabStop.id === id);
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
    case ActionTypes.CLICKED: {
      return {
        ...state,
        lastActionOrigin: "mouse",
        selectedId: action.payload.id
      };
    }
    default:
      return state;
  }
}

type Context = {
  direction: KeyDirection,
  state: State;
  dispatch: React.Dispatch<Action>;
};

export const RovingTabIndexContext = React.createContext<Context>({
  direction: "horizontal",
  state: {
    selectedId: null,
    lastActionOrigin: "mouse",
    tabStops: [],
    firstId: null,
    lastId: null
  },
  dispatch: () => {}
});

type Props = {
  children: React.ReactNode;
  direction?: KeyDirection;
};

const Provider = ({ children, direction = "horizontal" }: Props) => {
  const [state, dispatch] = React.useReducer(reducer, {
    selectedId: null,
    lastActionOrigin: "mouse",
    tabStops: [],
    firstId: null,
    lastId: null
  });

  const context = React.useMemo<Context>(
    () => ({
      direction,
      state,
      dispatch
    }),
    [state]
  );

  return (
    <RovingTabIndexContext.Provider value={context}>
      {children}
    </RovingTabIndexContext.Provider>
  );
};

export default Provider;
