import { KeyboardEvent, RefObject, useCallback, useContext, useEffect, useRef } from 'react';

import { RovingTabIndexContext } from './rename-provider';
import { ActionType, EventKey, HookResponse } from './types';
import { uniqueId } from './unique-id';

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
 * Second tuple value: The onKeyDown callback to apply to the tab
 * stop element. If the key press is relevant to the hook then
 * event.preventDefault() will be invoked on the event.
 * Third tuple value: The onClick callback to apply to the tab
 * stop element.
 * Fourth tuple value: A function that when invoked will select this tab stop.
 */
export function useRovingTabIndex(
  domElementRef: RefObject<SVGElement | HTMLElement>,
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

  // dispatch is stable for the lifetime of the hook.
  const dispatch = context.dispatch;

  // Register the tab stop on mount and unregister it on unmount:
  useEffect(() => {
    const id = getId();
    dispatch({
      type: ActionType.REGISTER_TAB_STOP,
      payload: { id, domElementRef, rowIndex, disabled },
    });
    return (): void => {
      dispatch({ type: ActionType.UNREGISTER_TAB_STOP, payload: { id } });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update the tab stop data if rowIndex or disabled change.
  // The isMounted flag is used to prevent this effect running
  // on mount, which is benign but redundant (as the
  // REGISTER_TAB_STOP action would have just been dispatched).
  useEffect(() => {
    if (isMounted.current) {
      dispatch({
        type: ActionType.TAB_STOP_UPDATED,
        payload: { id: getId(), rowIndex, disabled },
      });
    } else {
      isMounted.current = true;
    }
  }, [rowIndex, disabled, dispatch]);

  // Focus on this tab element if it is the element specified in the focus action:
  useEffect(() => {
    const id = context.state.focusAction?.id;
    if (id && id === getId() && domElementRef.current) {
      domElementRef.current.focus();
    }
  }, [context.state.focusAction, domElementRef]);

  // Create a stable callback function for handling key down events:
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const key = EventKey[event.key];
      if (!key) {
        return;
      }
      dispatch({
        type: ActionType.KEY_DOWN,
        payload: { id: getId(), key, ctrlKey: event.ctrlKey },
      });
      event.preventDefault();
    },
    [dispatch]
  );

  // Create a stable callback function for handling click events:
  const handleClick = useCallback(() => {
    dispatch({ type: ActionType.CLICKED, payload: { id: getId() } });
  }, [dispatch]);

  // Create a stable callback function for imperatively selecting this tab stop:
  const select = useCallback(() => {
    dispatch({ type: ActionType.SELECT_TAB_ELEMENT, payload: { id: getId() } });
  }, [dispatch]);

  return [getId() === context.state.selectedId ? 0 : -1, handleKeyDown, handleClick, select];
}
