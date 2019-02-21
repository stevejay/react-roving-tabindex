# react-roving-tabindex

> React implementation of a roving tabindex

[![NPM](https://img.shields.io/npm/v/react-roving-tabindex.svg)](https://www.npmjs.com/package/react-roving-tabindex) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-roving-tabindex
```

## Usage

```tsx
import React from "react";
import {
  RovingTabIndexProvider,
  useRovingTabIndex,
  useFocusEffect
} from "react-roving-tabindex";

const ToolbarButton = ({ disabled = false, children }: Props) => {
  const ref = React.useRef<HTMLButtonElement>(null);
  // onKeyDown and onClick are stable for the lifetime of the component
  // they are used in:
  const [tabIndex, focused, onKeyDown, onClick] = useRovingTabIndex(
    ref,
    disabled
  );
  // Use some mechanism to set focus on the focused button,
  // in this case the included useFocusEffect hook:
  useFocusEffect(focused, ref);
  return (
    <button
      ref={ref}
      tabIndex={tabIndex}
      disabled={disabled}
      onKeyDown={onKeyDown}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const App = () => (
  <RovingTabIndexProvider>
    <ToolbarButton>First Button</ToolbarButton>
    <ToolbarButton>Second Button</ToolbarButton>
  </RovingTabIndexProvider>
);
```

## License

MIT © [stevejay](https://github.com/stevejay)
