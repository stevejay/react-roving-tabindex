import React, {
  useMemo,
  useEffect,
  createContext,
  useReducer,
  ReactElement,
  ReactNode
} from "react";
import warning from "warning";
import {
  Action,
  ActionType,
  Context,
  Key,
  KeyConfig,
  Navigation,
  RowStartMap,
  State,
  TabStop
} from "./types";

export const DEFAULT_KEY_CONFIG: KeyConfig = {
  [Key.ARROW_LEFT]: Navigation.PREVIOUS,
  [Key.ARROW_RIGHT]: Navigation.NEXT,
  [Key.ARROW_UP]: Navigation.PREVIOUS,
  [Key.ARROW_DOWN]: Navigation.NEXT,
  [Key.HOME]: Navigation.VERY_FIRST,
  [Key.HOME_WITH_CTRL]: Navigation.VERY_FIRST,
  [Key.END]: Navigation.VERY_LAST,
  [Key.END_WITH_CTRL]: Navigation.VERY_LAST
};

const DOCUMENT_POSITION_PRECEDING = 2;

// Note: The `allowFocusing` state property is required
// to delay focusing of the selected tab stop
// DOM element until the user has started interacting
// with the roving tabindex's controls. If this delay
// did not occur, the selected control would be focused
// as soon as it was mounted, which is unlikely to be
// the desired behaviour for the page.
//
// Note: The rowStartMap is only created if row-related
// navigation occurs (e.g., move to row start or end), so
// non-grid usage of this library does not pay the price
// (minimal as it is) of constructing this map. The map
// gets cleared if registering, unregistering, or updating.
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.REGISTER_TAB_STOP: {
      const newTabStop = action.payload;
      if (!newTabStop.domElementRef.current) {
        return state;
      }

      let indexToInsertAt = -1;
      for (let i = 0; i < state.tabStops.length; ++i) {
        const loopTabStop = state.tabStops[i];
        if (loopTabStop.id === newTabStop.id) {
          warning(false, `'${newTabStop.id}' tab stop already registered`);
          return state;
        }
        if (
          indexToInsertAt === -1 &&
          loopTabStop.domElementRef.current &&
          !!(
            loopTabStop.domElementRef.current.compareDocumentPosition(
              newTabStop.domElementRef.current
            ) & DOCUMENT_POSITION_PRECEDING
          )
        ) {
          indexToInsertAt = i;
        }
      }

      // Array.findIndex returns -1 when newTabStop should be inserted
      // at the end of tabStops (the compareDocumentPosition test
      // always returns false in that case).
      if (indexToInsertAt === -1) {
        indexToInsertAt = state.tabStops.length;
      }
      const newTabStops = state.tabStops.slice();
      newTabStops.splice(indexToInsertAt, 0, newTabStop);

      return {
        ...state,
        selectedId: getUpdatedSelectedId(newTabStops, state.selectedId),
        tabStops: newTabStops,
        rowStartMap: null
      };
    }
    case ActionType.UNREGISTER_TAB_STOP: {
      const id = action.payload.id;
      const newTabStops = state.tabStops.filter((tabStop) => tabStop.id !== id);
      if (newTabStops.length === state.tabStops.length) {
        warning(false, `'${id}' tab stop already unregistered`);
        return state;
      }
      return {
        ...state,
        selectedId: getUpdatedSelectedId(newTabStops, state.selectedId),
        tabStops: newTabStops,
        rowStartMap: null
      };
    }
    case ActionType.TAB_STOP_UPDATED: {
      const { id, rowIndex, disabled } = action.payload;
      const index = state.tabStops.findIndex((tabStop) => tabStop.id === id);
      if (index === -1) {
        warning(false, `'${id}' tab stop not registered`);
        return state;
      }

      const tabStop = state.tabStops[index];
      if (tabStop.disabled === disabled && tabStop.rowIndex === rowIndex) {
        // Nothing to do so short-circuit.
        return state;
      }

      const newTabStop = { ...tabStop, rowIndex, disabled };
      const newTabStops = state.tabStops.slice();
      newTabStops.splice(index, 1, newTabStop);

      return {
        ...state,
        selectedId: getUpdatedSelectedId(newTabStops, state.selectedId),
        tabStops: newTabStops,
        rowStartMap: null
      };
    }
    case ActionType.KEY_DOWN: {
      const { id, key, ctrlKey } = action.payload;
      const navigation = getNavigationValue(key, ctrlKey, state.keyConfig);
      if (!navigation) {
        return state;
      }
      const index = state.tabStops.findIndex((tabStop) => tabStop.id === id);
      if (index === -1) {
        warning(false, `'${id}' tab stop not registered`);
        return state;
      }
      const currentTabStop = state.tabStops[index];
      if (currentTabStop.disabled) {
        return state;
      }
      const isGrid = currentTabStop.rowIndex !== null;

      switch (navigation) {
        case Navigation.NEXT:
          {
            for (let i = index + 1; i < state.tabStops.length; ++i) {
              const tabStop = state.tabStops[i];
              if (isGrid && tabStop.rowIndex !== currentTabStop.rowIndex) {
                break;
              }
              if (!tabStop.disabled) {
                return selectTabStop(state, tabStop);
              }
            }
          }
          break;
        case Navigation.PREVIOUS:
          {
            for (let i = index - 1; i >= 0; --i) {
              const tabStop = state.tabStops[i];
              if (isGrid && tabStop.rowIndex !== currentTabStop.rowIndex) {
                break;
              }
              if (!tabStop.disabled) {
                return selectTabStop(state, tabStop);
              }
            }
          }
          break;
        case Navigation.VERY_FIRST:
          {
            for (let i = 0; i < state.tabStops.length; ++i) {
              const tabStop = state.tabStops[i];
              if (!tabStop.disabled) {
                return selectTabStop(state, tabStop);
              }
            }
          }
          break;
        case Navigation.VERY_LAST:
          {
            for (let i = state.tabStops.length - 1; i >= 0; --i) {
              const tabStop = state.tabStops[i];
              if (!tabStop.disabled) {
                return selectTabStop(state, tabStop);
              }
            }
          }
          break;
        case Navigation.PREVIOUS_ROW:
          {
            if (
              currentTabStop.rowIndex === null ||
              currentTabStop.rowIndex === 0
            ) {
              return state;
            }
            const rowStartMap = state.rowStartMap || createRowStartMap(state);
            const rowStartIndex = rowStartMap.get(currentTabStop.rowIndex);
            if (rowStartIndex === undefined) {
              return state;
            }
            const columnOffset = index - rowStartIndex;
            for (let i = currentTabStop.rowIndex - 1; i >= 0; --i) {
              const rowStartIndex = rowStartMap.get(i);
              if (rowStartIndex === undefined) {
                return state;
              }
              const rowTabStop = state.tabStops[rowStartIndex + columnOffset];
              if (!rowTabStop.disabled) {
                return selectTabStop(state, rowTabStop, rowStartMap);
              }
            }
            return { ...state, allowFocusing: true, rowStartMap };
          }
          break;
        case Navigation.NEXT_ROW:
          {
            const maxRowIndex =
              state.tabStops[state.tabStops.length - 1].rowIndex;
            if (
              currentTabStop.rowIndex === null ||
              maxRowIndex === null ||
              currentTabStop.rowIndex === maxRowIndex
            ) {
              return state;
            }
            const rowStartMap = state.rowStartMap || createRowStartMap(state);
            const rowStartIndex = rowStartMap.get(currentTabStop.rowIndex);
            if (rowStartIndex === undefined) {
              return state;
            }
            const columnOffset = index - rowStartIndex;
            for (let i = currentTabStop.rowIndex + 1; i <= maxRowIndex; ++i) {
              const rowStartIndex = rowStartMap.get(i);
              if (rowStartIndex === undefined) {
                return state;
              }
              const rowTabStop = state.tabStops[rowStartIndex + columnOffset];
              if (!rowTabStop.disabled) {
                return selectTabStop(state, rowTabStop, rowStartMap);
              }
            }
            return { ...state, allowFocusing: true, rowStartMap };
          }
          break;
        case Navigation.FIRST_IN_ROW:
          {
            if (currentTabStop.rowIndex === null) {
              return state;
            }
            const rowStartMap = state.rowStartMap || createRowStartMap(state);
            const rowStartIndex = rowStartMap.get(currentTabStop.rowIndex);
            if (rowStartIndex === undefined) {
              return state;
            }
            for (let i = rowStartIndex; i < state.tabStops.length; ++i) {
              const tabStop = state.tabStops[i];
              if (tabStop.rowIndex !== currentTabStop.rowIndex) {
                break;
              } else if (!tabStop.disabled) {
                return selectTabStop(state, state.tabStops[i], rowStartMap);
              }
            }
          }
          break;
        case Navigation.LAST_IN_ROW:
          {
            if (currentTabStop.rowIndex === null) {
              return state;
            }
            const rowStartMap = state.rowStartMap || createRowStartMap(state);
            const rowEndIndex = rowStartMap.has(currentTabStop.rowIndex + 1)
              ? (rowStartMap.get(currentTabStop.rowIndex + 1) || 0) - 1
              : state.tabStops.length - 1;
            for (let i = rowEndIndex; i >= 0; --i) {
              const tabStop = state.tabStops[i];
              if (tabStop.rowIndex !== currentTabStop.rowIndex) {
                break;
              } else if (!tabStop.disabled) {
                return selectTabStop(state, state.tabStops[i], rowStartMap);
              }
            }
          }
          break;
      }
      return state;
    }
    case ActionType.CLICKED: {
      const id = action.payload.id;
      const index = state.tabStops.findIndex((tabStop) => tabStop.id === id);
      if (index === -1) {
        warning(false, `'${id}' tab stop not registered`);
        return state;
      }
      const currentTabStop = state.tabStops[index];
      return currentTabStop.disabled
        ? state
        : selectTabStop(state, currentTabStop);
    }
    case ActionType.KEY_CONFIG_UPDATED: {
      const keyConfig = action.payload.keyConfig;
      return keyConfig === state.keyConfig ? state : { ...state, keyConfig };
    }
    default:
      return state;
  }
}

// Determine the updated value for selectedId:
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

  // Finds the first tab stop that is not disabled and return
  // its id, otherwise return null.
  index = tabStops.findIndex((tabStop) => !tabStop.disabled);
  return index === -1 ? null : tabStops[index].id;
}

// Translates the user key down event info into a navigation instruction.
function getNavigationValue(
  key: string,
  ctrlKey: boolean,
  keyConfig: KeyConfig
): Navigation | null {
  let translatedKey: Key | null = null;
  switch (key) {
    case Key.ARROW_LEFT:
    case Key.ARROW_RIGHT:
    case Key.ARROW_UP:
    case Key.ARROW_DOWN:
      translatedKey = key;
      break;
    case Key.HOME:
      translatedKey = ctrlKey ? Key.HOME_WITH_CTRL : Key.HOME;
      break;
    case Key.END:
      translatedKey = ctrlKey ? Key.END_WITH_CTRL : Key.END;
      break;
  }
  return translatedKey === null ? null : keyConfig[translatedKey] || null;
}

// Creates the new state for a tab stop when it becomes the selected one.
function selectTabStop(
  state: State,
  tabStop: TabStop,
  rowStartMap?: RowStartMap
) {
  return {
    ...state,
    allowFocusing: true,
    selectedId: tabStop.id,
    rowStartMap: rowStartMap || state.rowStartMap
  };
}

// Creates the row start index lookup map
// for the currently registered tab stops.
function createRowStartMap(state: State) {
  const map: RowStartMap = new Map();
  for (let i = 0; i < state.tabStops.length; ++i) {
    const { rowIndex } = state.tabStops[i];
    if (rowIndex !== null && !map.has(rowIndex)) {
      map.set(rowIndex, i);
    }
  }
  return map;
}

const INITIAL_STATE: State = {
  selectedId: null,
  allowFocusing: false,
  tabStops: [],
  keyConfig: DEFAULT_KEY_CONFIG,
  rowStartMap: null
};

export const RovingTabIndexContext = createContext<Context>({
  state: INITIAL_STATE,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispatch: () => {}
});

/**
 * Creates a roving tabindex context.
 * @param {ReactNode} children The child content, which will
 * include the DOM elements to rove between using the tab key.
 * @param {keyConfig} keyConfig An optional key navigation configuration
 * object that specifies exactly how the roving tabindex should move
 * when particular keys are pressed by the user. A default config
 * is used when none is supplied. If you pass a config object then
 * it can be changed throughout the lifetime of the containing component.
 * But it is best if its identity changes only if the configuration
 * values themselves change.
 */
export const Provider = ({
  children,
  keyConfig = DEFAULT_KEY_CONFIG
}: {
  children: ReactNode;
  keyConfig?: KeyConfig;
}): ReactElement => {
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
    keyConfig
  });

  // Update the keyConfig whenever it changes:
  useEffect(() => {
    dispatch({ type: ActionType.KEY_CONFIG_UPDATED, payload: { keyConfig } });
  }, [keyConfig]);

  // Create a cached object to use as the context value:
  const context = useMemo<Context>(() => ({ state, dispatch }), [state]);

  return (
    <RovingTabIndexContext.Provider value={context}>
      {children}
    </RovingTabIndexContext.Provider>
  );
};
