import { useEffect, RefObject } from "react";

/**
 * Focuses on the given DOM element as required.
 * @param {boolean | null | undefined} focused Whether or not
 * the specified DOM element should have focus() invoked on it.
 * @param {RefObject<SVGElement | HTMLElement>} ref The DOM
 * element to control the focus of.
 */
export function useFocusEffect(
  focused: boolean | null | undefined,
  ref: RefObject<SVGElement | HTMLElement>
): void {
  // useLayoutEffect is not required as a focus outline is normally
  // the browser's default rendering or a custom box shadow. Both
  // do not affect layout or appearance beyond this outline so
  // will not cause a jank-like change in appearance when added.
  useEffect(() => {
    if (focused && ref.current) {
      ref.current.focus();
    }
  }, [focused]);
}
