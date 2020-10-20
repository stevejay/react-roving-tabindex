import React from "react";

// Invokes focus() on ref as a layout effect whenever focused
// changes from false to true.
export default function useFocusEffect(
  focused: boolean | null | undefined,
  ref: React.RefObject<SVGElement | HTMLElement>
): void {
  React.useLayoutEffect(() => {
    if (focused && ref.current) {
      ref.current.focus();
    }
  }, [focused]);
}
