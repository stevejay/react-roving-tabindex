import React from "react";
import warning from "warning";

const DOCUMENT_POSITION_PRECEDING = 2;

type KeyDirection = "horizontal" | "vertical" | "both";

export type TabStop = Readonly<{
  id: string;
  domElementRef: React.RefObject<Element>;
  disabled: boolean;
  rowIndex: number | null;
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
  CHANGE_DIRECTION = "CHANGE_DIRECTION",
  TAB_STOP_OPTIONS_UPDATED = "TAB_STOP_OPTIONS_UPDATED"
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
    }
  | {
      type: ActionTypes.TAB_STOP_OPTIONS_UPDATED;
      payload: {
        id: TabStop["id"];
        rowIndex: TabStop["rowIndex"];
        disabled: TabStop["disabled"];
      };
    };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionTypes.REGISTER: {
      const newTabStop = action.payload;
      if (!newTabStop.domElementRef.current) {
        return state;
      }

      const index = state.tabStops.findIndex(
        (tabStop) => tabStop.id === newTabStop.id
      );
      if (index !== -1) {
        warning(false, `'${newTabStop.id}' tab stop already registered`);
        return state;
      }

      let indexToInsertAt = state.tabStops.findIndex((tabStop) => {
        // This mess is for TypeScript:
        if (
          !tabStop.domElementRef.current ||
          !newTabStop.domElementRef.current
        ) {
          return -1;
        }
        // Return true if newTabStop's element is located earlier in the DOM
        // than tabStop's element, else false:
        return !!(
          tabStop.domElementRef.current.compareDocumentPosition(
            newTabStop.domElementRef.current
          ) & DOCUMENT_POSITION_PRECEDING
        );
      });

      // findIndex returns -1 when newTabStop should be inserted
      // at the end of tabStops (the compareDocumentPosition test
      // always returns false in that case).
      if (indexToInsertAt === -1) {
        indexToInsertAt = state.tabStops.length;
      }

      const newTabStops = [
        ...state.tabStops.slice(0, indexToInsertAt),
        newTabStop,
        ...state.tabStops.slice(indexToInsertAt)
      ];

      return {
        ...state,
        selectedId: getUpdatedSelectedId(newTabStops, state.selectedId),
        tabStops: newTabStops
      };
    }
    case ActionTypes.UNREGISTER: {
      const id = action.payload.id;
      const newTabStops = state.tabStops.filter((tabStop) => tabStop.id !== id);
      if (newTabStops.length === state.tabStops.length) {
        warning(false, `'${id}' tab stop already unregistered`);
        return state;
      }
      return {
        ...state,
        selectedId: getUpdatedSelectedId(newTabStops, state.selectedId),
        tabStops: newTabStops
      };
    }
    case ActionTypes.TAB_STOP_OPTIONS_UPDATED: {
      const { id, rowIndex, disabled } = action.payload;
      const index = state.tabStops.findIndex((tabStop) => tabStop.id === id);
      if (index === -1) {
        warning(false, `'${id}' tab stop not registered`);
        return state;
      }

      const tabStop = state.tabStops[index];
      if (tabStop.disabled === disabled && tabStop.rowIndex === rowIndex) {
        return state;
      }

      const newTabStops = state.tabStops.slice();
      newTabStops.splice(index, 1, {
        ...tabStop,
        rowIndex,
        disabled
      });

      return {
        ...state,
        selectedId: getUpdatedSelectedId(newTabStops, state.selectedId),
        tabStops: newTabStops
      };
    }
    case ActionTypes.TAB_TO_PREVIOUS:
    case ActionTypes.TAB_TO_NEXT: {
      const id = action.payload.id;
      const index = state.tabStops.findIndex((tabStop) => tabStop.id === id);
      if (index === -1) {
        warning(false, `'${id}' tab stop not registered`);
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

function getUpdatedSelectedId(
  tabStops: State["tabStops"],
  currentSelectedId: State["selectedId"]
): State["selectedId"] {
  if (currentSelectedId === null) {
    // There is not currently selected tab stop, so find
    // the first tab stop that is not disabled and return
    // its id, otherwise return null.
    const index = tabStops.findIndex((tabStop) => !tabStop.disabled);
    return index === -1 ? null : tabStops[index].id;
  }

  let index = tabStops.findIndex((tabStop) => tabStop.id === currentSelectedId);
  if (index !== -1 && !tabStops[index].disabled) {
    // The current selected id is still valid, so return it.
    return currentSelectedId;
  }

  // Find the first tab stop that is not disabled and return
  // its id, otherwise return null.
  index = tabStops.findIndex((tabStop) => !tabStop.disabled);
  return index === -1 ? null : tabStops[index].id;
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
