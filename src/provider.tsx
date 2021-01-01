import React, {
  createContext,
  forwardRef,
  ReactElement,
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
} from 'react';
import warning from 'warning';

import {
  Action,
  ActionType,
  Context,
  EventKey,
  Navigation,
  ProviderAPI,
  ProviderProps,
  RowStartMap,
  State,
  TabStop,
} from './types';

const DOCUMENT_POSITION_FOLLOWING = 4;

// Note: The `focusAction` state property is required
// to allow imperative control over focus. It is initially `null`
// so that focus is not invoked on mount. The `focusAction`
// property is an object so that focus can be re-invoked on
// a tab element that was previously the most recent tab element
// to be focused.
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

      // Iterate backwards through state.tabStops since it is
      // most likely that the tab stop will need to be inserted
      // at the end of that array.
      let indexToInsertAt = -1;
      for (let i = state.tabStops.length - 1; i >= 0; --i) {
        const loopTabStop = state.tabStops[i];
        if (loopTabStop.id === newTabStop.id) {
          warning(false, `'${newTabStop.id}' tab stop already registered`);
          return state;
        }
        // The compareDocumentPosition condition is true
        // if newTabStop follows loopTabStop:
        if (
          indexToInsertAt === -1 &&
          loopTabStop.domElementRef.current &&
          !!(
            loopTabStop.domElementRef.current.compareDocumentPosition(
              newTabStop.domElementRef.current
            ) & DOCUMENT_POSITION_FOLLOWING
          )
        ) {
          indexToInsertAt = i + 1;
          break;
        }
      }

      // The indexToInsertAt is -1 when newTabStop should be inserted
      // at the start of tabStops (the compareDocumentPosition condition
      // always returns false in that case).
      if (indexToInsertAt === -1) {
        indexToInsertAt = 0;
      }

      const newTabStops = state.tabStops.slice();
      newTabStops.splice(indexToInsertAt, 0, newTabStop);

      return {
        ...state,
        selectedId: getUpdatedSelectedId(newTabStops, state.selectedId),
        tabStops: newTabStops,
        rowStartMap: null,
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
        rowStartMap: null,
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
        rowStartMap: null,
      };
    }
    case ActionType.KEY_DOWN: {
      const { id, key, ctrlKey } = action.payload;
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
      const navigation = getNavigationValue(key, ctrlKey, isGrid, state.direction);
      if (!navigation) {
        return state;
      }

      switch (navigation) {
        case Navigation.NEXT:
          {
            let i = index;
            do {
              ++i;
              if (i >= state.tabStops.length) {
                i = 0;
              }
              const tabStop = state.tabStops[i];
              if (isGrid && tabStop.rowIndex !== currentTabStop.rowIndex) {
                break;
              }
              if (!tabStop.disabled) {
                return currentTabStop === tabStop ? state : selectTabStop(state, tabStop);
              }
            } while (i !== index);
            // for (let i = index + 1; i < state.tabStops.length; ++i) {
            //   const tabStop = state.tabStops[i];
            //   if (isGrid && tabStop.rowIndex !== currentTabStop.rowIndex) {
            //     break;
            //   }
            //   if (!tabStop.disabled) {
            //     return selectTabStop(state, tabStop);
            //   }
            // }
          }
          break;
        case Navigation.PREVIOUS:
          {
            let i = index;
            do {
              --i;
              if (i < 0) {
                i = state.tabStops.length - 1;
              }
              const tabStop = state.tabStops[i];
              if (isGrid && tabStop.rowIndex !== currentTabStop.rowIndex) {
                break;
              }
              if (!tabStop.disabled) {
                return currentTabStop === tabStop ? state : selectTabStop(state, tabStop);
              }
            } while (i !== index);
            // for (let i = index - 1; i >= 0; --i) {
            //   const tabStop = state.tabStops[i];
            //   if (isGrid && tabStop.rowIndex !== currentTabStop.rowIndex) {
            //     break;
            //   }
            //   if (!tabStop.disabled) {
            //     return selectTabStop(state, tabStop);
            //   }
            // }
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
            if (currentTabStop.rowIndex === null || currentTabStop.rowIndex === 0) {
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
            // No previous row:
            return {
              ...state,
              focusAction: state.selectedId ? { id: state.selectedId } : null,
              rowStartMap,
            };
          }
          break;
        case Navigation.NEXT_ROW:
          {
            const maxRowIndex = state.tabStops[state.tabStops.length - 1].rowIndex;
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
            // No next row:
            return {
              ...state,
              focusAction: state.selectedId ? { id: state.selectedId } : null,
              rowStartMap,
            };
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
      return currentTabStop.disabled ? state : selectTabStop(state, currentTabStop);
    }
    case ActionType.DIRECTION_UPDATED: {
      const direction = action.payload.direction;
      return direction === state.direction ? state : { ...state, direction };
    }
    case ActionType.SET_INITIAL_TAB_ELEMENT: {
      const { selector } = action.payload;
      const tabStop = state.tabStops.find((tabStop) =>
        tabStop.domElementRef.current?.matches(selector)
      );
      return tabStop && !tabStop.disabled ? { ...state, selectedId: tabStop.id } : state;
    }
    case ActionType.SELECT_TAB_ELEMENT: {
      const id = action.payload.id;
      const index = state.tabStops.findIndex((tabStop) => tabStop.id === id);
      if (index === -1) {
        warning(false, `'${id}' tab stop not registered`);
        return state;
      }
      const tabStop = state.tabStops[index];
      return tabStop.disabled ? state : selectTabStop(state, state.tabStops[index]);
    }
    case ActionType.SELECT_TAB_ELEMENT_BY_POSITION: {
      const { position } = action.payload;
      if (position === 'first') {
        for (let i = 0; i < state.tabStops.length; ++i) {
          const tabStop = state.tabStops[i];
          if (!tabStop.disabled) {
            return selectTabStop(state, tabStop);
          }
        }
      } else {
        for (let i = state.tabStops.length - 1; i >= 0; --i) {
          const tabStop = state.tabStops[i];
          if (!tabStop.disabled) {
            return selectTabStop(state, tabStop);
          }
        }
      }
      return state;
    }
    default:
      return state;
  }
}

// Determine the updated value for selectedId:
function getUpdatedSelectedId(
  tabStops: State['tabStops'],
  currentSelectedId: State['selectedId']
): State['selectedId'] {
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
  key: EventKey,
  ctrlKey: boolean,
  isGrid: boolean,
  direction: string
): Navigation | null {
  switch (key) {
    case EventKey.ArrowLeft:
      return isGrid || direction === 'horizontal' || direction === 'both'
        ? Navigation.PREVIOUS
        : null;
    case EventKey.ArrowRight:
      return isGrid || direction === 'horizontal' || direction === 'both' ? Navigation.NEXT : null;
    case EventKey.ArrowUp:
      if (isGrid) {
        return Navigation.PREVIOUS_ROW;
      } else {
        return direction === 'vertical' || direction === 'both' ? Navigation.PREVIOUS : null;
      }
    case EventKey.ArrowDown:
      if (isGrid) {
        return Navigation.NEXT_ROW;
      } else {
        return direction === 'vertical' || direction === 'both' ? Navigation.NEXT : null;
      }
    case EventKey.Home:
      return !isGrid || ctrlKey ? Navigation.VERY_FIRST : Navigation.FIRST_IN_ROW;
    case EventKey.End:
      return !isGrid || ctrlKey ? Navigation.VERY_LAST : Navigation.LAST_IN_ROW;
    default:
      return null;
  }
}

// Creates the new state for a tab stop when it becomes the selected one.
function selectTabStop(state: State, tabStop: TabStop, rowStartMap?: RowStartMap): State {
  return {
    ...state,
    focusAction: { id: tabStop.id },
    selectedId: tabStop.id,
    lastSelectedElement: { domElementRef: tabStop.domElementRef },
    rowStartMap: rowStartMap || state.rowStartMap,
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
  lastSelectedElement: null,
  focusAction: null,
  tabStops: [],
  direction: 'horizontal',
  rowStartMap: null,
};

export const RovingTabIndexContext = createContext<Context>({
  state: INITIAL_STATE,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispatch: () => {},
});

/**
 * Creates a roving tabindex context.
 * @param {ReactNode} children The child content, which will
 * include the DOM elements to rove between using the tab key.
 * @param {KeyDirection} direction An optional direction value
 * that only applies when the roving tabindex is not being
 * used within a grid. This value specifies the arrow key behaviour.
 * When set to 'horizontal' then only the ArrowLeft and ArrowRight
 * keys move to the previous and next tab stop respectively.
 * When set to 'vertical' then only the ArrowUp and ArrowDown keys
 * move to the previous and next tab stop respectively. When set
 * to 'both' then both the ArrowLeft and ArrowUp keys can be used
 * to move to the previous tab stop, and both the ArrowRight
 * and ArrowDown keys can be used to move to the next tab stop.
 * If you do not pass an explicit value then the 'horizontal'
 * behaviour applies. You can change this direction value
 * at any time.
 * @param {string} initialTabElementSelector An optional selector for
 * selecting the element in the roving tab index that will be
 * the initially selected one. Normally the first registered
 * element will be the initially tabbable element in the index.
 * However, you might want to save the last tabbed-to element
 * so that you can restore it the next time the index is mounted.
 * The selector will be passed to the
 * [`Element.matches()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/matches)
 * method, so the likeliest value would be an ID (e.g., `'#bar'`)
 * or a data selector (e.g., `'[data-foo-id="bar"]'`).
 * The value of this prop should remain the same for the lifetime
 * of this component.
 * @param {(element: Element) => void} onTabElementSelected
 * An optional callback so you can be notified when the user
 * changes the selected element in the roving tab index. This is useful to
 * extract the information you would need to subsequently pass as the
 * `initialTabElementSelector` prop. The value of this prop should remain
 * the same for the lifetime of this component. This might require
 * use of `React.useCallback` to create a stable callback function.
 */
export const Provider = forwardRef<ProviderAPI, ProviderProps>(
  (
    { children, direction = 'horizontal', initialTabElementSelector, onTabElementSelected },
    ref
  ): ReactElement => {
    const [state, dispatch] = useReducer(reducer, {
      ...INITIAL_STATE,
      direction,
    });

    // Update the direction whenever it changes:
    useEffect(() => {
      dispatch({ type: ActionType.DIRECTION_UPDATED, payload: { direction } });
    }, [direction]);

    // If given, set the initial tab element:
    useEffect(() => {
      if (initialTabElementSelector) {
        dispatch({
          type: ActionType.SET_INITIAL_TAB_ELEMENT,
          payload: { selector: initialTabElementSelector },
        });
      }
    }, [initialTabElementSelector]);

    // Invoke the onTabElementSelected callback when the user
    // selects an element in the index:
    useEffect(() => {
      if (!onTabElementSelected || !state.lastSelectedElement?.domElementRef.current) {
        return;
      }
      onTabElementSelected(state.lastSelectedElement.domElementRef.current);
    }, [onTabElementSelected, state.lastSelectedElement]);

    // Create the API for parent roving tabindexes:
    useImperativeHandle(
      ref,
      () => ({
        selectTabElementByPosition: (element: 'first' | 'last') => {
          dispatch({
            type: ActionType.SELECT_TAB_ELEMENT_BY_POSITION,
            payload: { position: element },
          });
        },
      }),
      []
    );

    // Create a memoized object to use as the context's value.
    // This prevents unnecessary renders.
    const context = useMemo<Context>(() => ({ state, dispatch }), [state]);

    return (
      <RovingTabIndexContext.Provider value={context}>{children}</RovingTabIndexContext.Provider>
    );
  }
);
