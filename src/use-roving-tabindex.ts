import {
  useCallback,
  useRef,
  useContext,
  useEffect,
  RefObject,
  KeyboardEvent
} from "react";
import { RovingTabIndexContext } from "./Provider";
import { ActionType, EventKey, HookResponse } from "./types";
import { uniqueId } from "./unique-id";

/**
 * Includes the given DOM element in the current roving tabindex.
 * @param {RefObject<Element>} domElementRef The DOM element to include.
 * This must be the same DOM element for the lifetime of the containing
 * component.
 * @param {boolean} disabled Whether or not the DOM element is currently
 * enabled. This value can be updated as appropriate throughout the lifetime
 * of the containing component.
 * @param {number?} rowIndex An optional integer value that must be
 * populated if the roving tabindex is being used in a grid. In that case,
 * set it to the zero-based index of the row that the given DOM element
 * is currently part of. You can update this row index as appropriate
 * throughout the lifetime of the containing component, for example if
 * the shape of the grid can change dynamically.
 * @returns A tuple of values to be applied by the containing
 * component for the roving tabindex to work correctly.
 * First tuple value: The tabIndex value to apply to the tab stop
 * element.
 * Second tuple value: Whether or not focus() should be invoked on the
 * tab stop element.
 * Third tuple value: The onKeyDown callback to apply to the tab
 * stop element. If the key press is relevant to the hook then
 * event.preventDefault() will be invoked on the event.
 * Fourth tuple value: The onClick callback to apply to the tab
 * stop element.
 */
export function useRovingTabIndex(
  domElementRef: RefObject<Element>,
  disabled: boolean,
  rowIndex: number | null = null
): HookResponse {
  // Create a stable ID for the lifetime of the component:
  const idRef = useRef<string | null>(null);

  function getId() {
    if (!idRef.current) {
      idRef.current = uniqueId();
    }
    return idRef.current;
  }

  const isMounted = useRef(false);
  const context = useContext(RovingTabIndexContext);

  // Register the tab stop on mount and unregister it on unmount:
  useEffect(() => {
    const id = getId();
    context.dispatch({
      type: ActionType.REGISTER_TAB_STOP,
      payload: {
        id,
        domElementRef,
        rowIndex,
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

  // Update the tab stop data if rowIndex or disabled change.
  // The isMounted flag is used to prevent this effect running
  // on mount, which is benign but redundant (as the
  // REGISTER_TAB_STOP action would have just been dispatched).
  useEffect(() => {
    if (isMounted.current) {
      context.dispatch({
        type: ActionType.TAB_STOP_UPDATED,
        payload: {
          id: getId(),
          rowIndex,
          disabled
        }
      });
    } else {
      isMounted.current = true;
    }
  }, [rowIndex, disabled]);

  // Create a stable callback function for handling key down events:
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
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

  // Determine if the current tab stop is the currently active one:
  const selected = getId() === context.state.selectedId;

  const tabIndex = selected ? 0 : -1;
  const focused = selected && context.state.allowFocusing;

  return [tabIndex, focused, handleKeyDown, handleClick];
}
