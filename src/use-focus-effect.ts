import { useLayoutEffect } from "react";

/**
 * Focuses on the given DOM element as required.
 * @param {boolean | null | undefined} focused Whether or not
 * the specified DOM element should have focus() invoked on it.
 * @param {React.RefObject<SVGElement | HTMLElement>} ref The DOM
 * element to control the focus of.
 */
export function useFocusEffect(
  focused: boolean | null | undefined,
  ref: React.RefObject<SVGElement | HTMLElement>
): void {
  useLayoutEffect(() => {
    if (focused && ref.current) {
      ref.current.focus();
      console.log("focussed", ref.current.id);
    }
  }, [focused]);
}
