import {
  useCallback,
  useRef,
  useContext,
  useEffect,
  RefObject,
  KeyboardEvent
} from "react";
import { RovingTabIndexContext } from "./Provider";
import {
  ActionType,
  EventKey,
  HookOptions,
  HookResponse,
  TabStop
} from "./types";
import { uniqueId } from "./unique-id";

/**
 * Includes the given DOM element in the current roving tabindex.
 * @param {RefObject<Element>} domElementRef The DOM element to include.
 * This must be the same DOM element for the lifetime of the containing
 * component.
 * @param {boolean} disabled Whether or not the DOM element is currently
 * enabled. This value can be updated as appropriate throughout the lifetime
 * of the containing component.
 * @param {HookOptions?} options An optional object of options.
 * @param {string?} options.id An optional ID that is a globally unique ID
 * for identifying the DOM element. This is required if you need to support
 * server-side rendering (SSR). If you do not need to support SSR
 * then you can ignore this option; an id will be autogenerated.
 * If you use this option then the ID you pass must be the same for
 * the lifetime of the containing component.
 * @param {number} options.rowIndex An optional value that must be used
 * if the roving tabindex is being used in a grid. In that case, set it
 * to the zero-based index of the row that the given DOM element is
 * currently part of. You can update this row index as appropriate
 * throughout the lifetime of the containing component, for example if
 * the shape of the grid can change dynamically.
 * @returns {HookResponse} A tuple of values to be applied by the containing
 * component for the roving tabindex to work correctly.
 */
export function useRovingTabIndex(
  domElementRef: RefObject<Element>,
  disabled: boolean,
  options?: HookOptions
): HookResponse {
  // Create a stable ID for the lifetime of the component:
  const idRef = useRef(options?.id || null);

  function getId() {
    if (!idRef.current) {
      idRef.current = uniqueId();
    }
    return idRef.current;
  }

  const context = useContext(RovingTabIndexContext);

  // Register the tab stop on mount and unregister it on unmount:
  useEffect(() => {
    const id = getId();
    context.dispatch({
      type: ActionType.REGISTER_TAB_STOP,
      payload: {
        id,
        domElementRef,
        rowIndex: getRowIndexFromOptions(options),
        disabled
      }
    });
    return (): void => {
      context.dispatch({
        type: ActionType.UNREGISTER_TAB_STOP,
        payload: { id }
      });
    };
  }, []);

  // Update the tab stop data if rowIndex or disabled change:
  // Note: A TAB_STOP_UPDATED event is dispatched directly
  // after the REGISTER_TAB_STOP event on mount. This is okay
  // because the values of rowIndex and disabled will not
  // have changed, and in that case the reducer treats
  // the TAB_STOP_UPDATED event as a no-op.
  useEffect(() => {
    context.dispatch({
      type: ActionType.TAB_STOP_UPDATED,
      payload: {
        id: getId(),
        rowIndex: getRowIndexFromOptions(options),
        disabled
      }
    });
  }, [options?.rowIndex, disabled]);

  // Create a stable callback function for handling key down events:
  const handleKeyDown = useCallback((event: KeyboardEvent<Element>) => {
    const key = EventKey[event.key];
    if (!key) {
      return;
    }
    context.dispatch({
      type: ActionType.KEY_DOWN,
      payload: { id: getId(), key, ctrlKey: event.ctrlKey }
    });
    event.preventDefault();
  }, []);

  // Create a stable callback function for handling click events:
  const handleClick = useCallback(() => {
    context.dispatch({ type: ActionType.CLICKED, payload: { id: getId() } });
  }, []);

  // Determine if the current tab stop is the selected one:
  const selected = getId() === context.state.selectedId;

  const tabIndex = selected ? 0 : -1;
  const focused = selected && context.state.lastActionOrigin !== null;
  return [tabIndex, focused, handleKeyDown, handleClick];
}

function getRowIndexFromOptions(options?: HookOptions): TabStop["rowIndex"] {
  const rowIndex = options?.rowIndex;
  return rowIndex === null || rowIndex === undefined ? null : rowIndex;
}
