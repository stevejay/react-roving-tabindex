import React from "react";
import warning from "warning";
import {
  Action,
  ActionType,
  Context,
  Key,
  KeyConfig,
  Navigation,
  State
} from "./types";

export const DEFAULT_KEY_CONFIG: KeyConfig = {
  [Key.ARROW_LEFT]: Navigation.PREVIOUS,
  [Key.ARROW_RIGHT]: Navigation.NEXT,
  [Key.ARROW_UP]: Navigation.PREVIOUS,
  [Key.ARROW_DOWN]: Navigation.NEXT,
  [Key.HOME]: Navigation.FIRST,
  [Key.HOME_WITH_CTRL]: Navigation.FIRST,
  [Key.END]: Navigation.LAST,
  [Key.END_WITH_CTRL]: Navigation.LAST
};

const DOCUMENT_POSITION_PRECEDING = 2;

// Note: The `allowFocusing` state property is required
// to delay focusing of the selected tab stop
// DOM element until the user has started interacting
// with the roving tabindex's controls. If this delay
// did not occur, the selected control would be focused
// as soon as it was mounted, which is unlikely to be
// the desired behaviour for the page.
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.REGISTER_TAB_STOP: {
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
        // Returns true if newTabStop's element is located earlier
        // in the DOM than tabStop's element, else returns false:
        return !!(
          tabStop.domElementRef.current.compareDocumentPosition(
            newTabStop.domElementRef.current
          ) & DOCUMENT_POSITION_PRECEDING
        );
      });

      // Array.findIndex returns -1 when newTabStop should be inserted
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
        tabStops: newTabStops
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

      const newTabStops = state.tabStops.slice();
      const newTabStop = { ...tabStop, rowIndex, disabled };
      newTabStops.splice(index, 1, newTabStop);

      return {
        ...state,
        selectedId: getUpdatedSelectedId(newTabStops, state.selectedId),
        tabStops: newTabStops
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
                return {
                  ...state,
                  allowFocusing: true,
                  selectedId: tabStop.id
                };
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
                return {
                  ...state,
                  allowFocusing: true,
                  selectedId: tabStop.id
                };
              }
            }
          }
          break;
        case Navigation.FIRST:
          {
            for (let i = 0; i < state.tabStops.length; ++i) {
              const tabStop = state.tabStops[i];
              if (!tabStop.disabled) {
                return {
                  ...state,
                  allowFocusing: true,
                  selectedId: tabStop.id
                };
              }
            }
          }
          break;
        case Navigation.LAST:
          {
            for (let i = state.tabStops.length - 1; i >= 0; --i) {
              const tabStop = state.tabStops[i];
              if (!tabStop.disabled) {
                return {
                  ...state,
                  allowFocusing: true,
                  selectedId: tabStop.id
                };
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
            const rowStartIndexes = {};
            state.tabStops.forEach(({ rowIndex }, index) => {
              if (
                rowIndex !== null &&
                rowStartIndexes[rowIndex] === undefined
              ) {
                rowStartIndexes[rowIndex] = index;
              }
            });
            const columnOffset =
              index - rowStartIndexes[currentTabStop.rowIndex];
            for (let i = currentTabStop.rowIndex - 1; i >= 0; --i) {
              const rowTabStop =
                state.tabStops[rowStartIndexes[i] + columnOffset];
              if (!rowTabStop.disabled) {
                return {
                  ...state,
                  allowFocusing: true,
                  selectedId: rowTabStop.id
                };
              }
            }
          }
          break;
        case Navigation.NEXT_ROW:
          {
            if (
              currentTabStop.rowIndex === null ||
              currentTabStop.rowIndex ===
                state.tabStops[state.tabStops.length - 1].rowIndex
            ) {
              return state;
            }
            const rowStartIndexes = {};
            state.tabStops.forEach(({ rowIndex }, index) => {
              if (
                rowIndex !== null &&
                rowStartIndexes[rowIndex] === undefined
              ) {
                rowStartIndexes[rowIndex] = index;
              }
            });
            const columnOffset =
              index - rowStartIndexes[currentTabStop.rowIndex];
            const maxRowIndex =
              state.tabStops[state.tabStops.length - 1].rowIndex || 0;
            for (let i = currentTabStop.rowIndex + 1; i <= maxRowIndex; ++i) {
              const rowTabStop =
                state.tabStops[rowStartIndexes[i] + columnOffset];
              if (!rowTabStop.disabled) {
                return {
                  ...state,
                  allowFocusing: true,
                  selectedId: rowTabStop.id
                };
              }
            }
          }
          break;
        case Navigation.FIRST_IN_ROW:
          {
            if (currentTabStop.rowIndex === null) {
              return state;
            }
            let newIndex: number | null = null;
            for (let i = index - 1; i >= 0; --i) {
              const tabStop = state.tabStops[i];
              if (tabStop.rowIndex !== currentTabStop.rowIndex) {
                break;
              } else if (!tabStop.disabled) {
                newIndex = i;
              }
            }
            if (newIndex !== null) {
              return {
                ...state,
                allowFocusing: true,
                selectedId: state.tabStops[newIndex].id
              };
            }
          }
          break;
        case Navigation.LAST_IN_ROW:
          {
            if (currentTabStop.rowIndex === null) {
              return state;
            }
            let newIndex: number | null = null;
            for (let i = index + 1; i < state.tabStops.length; ++i) {
              const tabStop = state.tabStops[i];
              if (tabStop.rowIndex !== currentTabStop.rowIndex) {
                break;
              } else if (!tabStop.disabled) {
                newIndex = i;
              }
            }
            if (newIndex !== null) {
              return {
                ...state,
                allowFocusing: true,
                selectedId: state.tabStops[newIndex].id
              };
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
        : { ...state, allowFocusing: true, selectedId: id };
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

  // Find the first tab stop that is not disabled and return
  // its id, otherwise return null.
  index = tabStops.findIndex((tabStop) => !tabStop.disabled);
  return index === -1 ? null : tabStops[index].id;
}

// Translate the user key down event info into a navigation instruction.
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

export const RovingTabIndexContext = React.createContext<Context>({
  state: {
    selectedId: null,
    allowFocusing: false,
    tabStops: [],
    keyConfig: DEFAULT_KEY_CONFIG
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispatch: () => {}
});

/**
 * Creates a roving tabindex context.
 * @param {React.ReactNode} children The child content, which will
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
  children: React.ReactNode;
  keyConfig?: KeyConfig;
}): React.ReactElement => {
  const [state, dispatch] = React.useReducer(reducer, {
    selectedId: null,
    allowFocusing: false,
    tabStops: [],
    keyConfig
  });

  // Update the keyConfig whenever it is changed:
  React.useEffect(() => {
    dispatch({ type: ActionType.KEY_CONFIG_UPDATED, payload: { keyConfig } });
  }, [keyConfig]);

  // Create a cached object to use as the context value:
  const context = React.useMemo<Context>(() => ({ state, dispatch }), [state]);

  return (
    <RovingTabIndexContext.Provider value={context}>
      {children}
    </RovingTabIndexContext.Provider>
  );
};
