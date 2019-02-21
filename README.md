# react-roving-tabindex

> React Hooks implementation of a roving tabindex

[![NPM](https://img.shields.io/npm/v/react-roving-tabindex.svg)](https://www.npmjs.com/package/react-roving-tabindex) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![CircleCI](https://img.shields.io/circleci/project/github/stevejay/react-roving-tabindex/master.svg)](https://circleci.com/gh/stevejay/react-roving-tabindex/tree/master)

## Requirements

This package has been written using the React Hooks API, so it is only usable with React version 16.8 or greater.

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

type Props = {
  disabled?: boolean;
  children: React.ReactNode;
};

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
