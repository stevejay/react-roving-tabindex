import findIndex from "array-find-index";
import React from "react";
import warning from "warning";

const DOCUMENT_POSITION_PRECEDING = 2;

type TabStop = {
  id: string;
  domElementRef: React.RefObject<any>;
};

type State = {
  selectedId: string | null;
  lastActionOrigin: "mouse" | "keyboard";
  tabStops: Array<TabStop>;
};

export enum ActionTypes {
  REGISTER = "REGISTER",
  UNREGISTER = "UNREGISTER",
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
      const newTabStop = action.payload;
      if (state.tabStops.length === 0) {
        return {
          ...state,
          selectedId: newTabStop.id,
          tabStops: [newTabStop]
        };
      }
      const index = findIndex(
        state.tabStops,
        tabStop => tabStop.id === newTabStop.id
      );
      if (index >= 0) {
        warning(false, `${newTabStop.id} tab stop already registered`);
        return state;
      }
      const indexAfter = findIndex(
        state.tabStops,
        tabStop =>
          !!(
            tabStop.domElementRef.current.compareDocumentPosition(
              newTabStop.domElementRef.current
            ) & DOCUMENT_POSITION_PRECEDING
          )
      );
      return {
        ...state,
        tabStops: [
          ...state.tabStops.slice(0, indexAfter),
          newTabStop,
          ...state.tabStops.slice(indexAfter)
        ]
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
  state: State;
  dispatch: React.Dispatch<Action>;
};

export const RovingTabIndexContext = React.createContext<Context>({
  state: {
    selectedId: null,
    lastActionOrigin: "mouse",
    tabStops: []
  },
  dispatch: () => {}
});

type Props = {
  children: React.ReactNode;
};

const Provider = ({ children }: Props) => {
  const [state, dispatch] = React.useReducer(reducer, {
    selectedId: null,
    lastActionOrigin: "mouse",
    tabStops: []
  });

  const context = React.useMemo<Context>(
    () => ({
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
