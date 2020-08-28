# react-roving-tabindex

> React Hooks implementation of a roving tabindex. See the storybook [here](https://stevejay.github.io/react-roving-tabindex/) to try it out.

[![NPM](https://img.shields.io/npm/v/react-roving-tabindex.svg)](https://www.npmjs.com/package/react-roving-tabindex) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![CircleCI](https://img.shields.io/circleci/project/github/stevejay/react-roving-tabindex/master.svg)](https://circleci.com/gh/stevejay/react-roving-tabindex/tree/master)

## Background

The roving tabindex is a useful accessibility refinement for a grouped set of inputs, such as a buttons toolbar. It is a mechanism for controlling tabbing within that group, such that:

- the group as a whole is treated as a single tab stop, allowing the Web page as a whole to be navigated more quickly using the keyboard
- the last selected input in the group is remembered, so when tabbing back to the group, that last selected input is the one that receives focus

The left and right (or up and down) arrow keys are used to select inputs within the group, while the Home and End keys (Fn+LeftArrow and Fn+RightArrow on macOS) are used to navigate respectively to the group's first and last inputs.

More information about implementing a roving tabindex is available [here](https://www.stefanjudis.com/today-i-learned/roving-tabindex/) and [here](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#Managing_focus_inside_groups).

### Implementation Considerations

There are two main architectural choices:

- whether dynamic enabling and unenabling of the inputs in the group should be supported
- how the inputs are identified, including if they need to be direct children of the group container

This particular implementation of a roving tabindex opts to support dynamic enabling and unenabling, and allows inputs to be nested in subcomponents and wrapper elements. The former behaviour is implemented by inputs dynamically registering and unregistering themselves as appropriate, and the latter behaviour is implemented using the React Context API to allow communication between the managing group component and the nested inputs, however deeply located they are in the group's component subtree.

## Requirements

This package has been written using the React Hooks API, so it is only usable with React version 16.8 or greater.

## Installation

```bash
npm install --save react-roving-tabindex
```

This package includes TypeScript typings.

## Usage

There is a storybook for this package [here](https://stevejay.github.io/react-roving-tabindex/).

```tsx
import React from "react";
import {
  RovingTabIndexProvider,
  useRovingTabIndex,
  useFocusEffect,
} from "react-roving-tabindex";

type Props = {
  disabled?: boolean;
  children: React.ReactNode;
};

const ToolbarButton = ({ disabled = false, children }: Props) => {
  const ref = React.useRef<HTMLButtonElement>(null);
  // handleKeyDown and handleClick are stable for the lifetime of the component:
  const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
    ref, // don't change the value of this ref
    disabled // change this as you like throughout the lifetime of the component
  );
  // Use some mechanism to set focus on the button if it gets focused,
  // in this case using the included useFocusEffect hook:
  useFocusEffect(focused, ref);
  return (
    <button
      ref={ref}
      tabIndex={tabIndex} // must be applied here
      disabled={disabled}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

const App = () => (
  <RovingTabIndexProvider>
    {/*
      it's fine for the roving tabindex components to be nested
      in other DOM or React components
    */}
    <ToolbarButton>First Button</ToolbarButton>
    <ToolbarButton>Second Button</ToolbarButton>
  </RovingTabIndexProvider>
);
```

You can optionally pass a custom ID to the `useRovingTabIndex` hook as the third argument:

```jsx
const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
  ref, // don't change the value of this ref
  disabled, // change this as you like
  "custom-id-1" // some custom id
);
```

This is useful if you need to support server-side rendering. The value initially passed will be used for the lifetime of the containing component.

You can change the navigation direction by passing a direction to the Provider. This will change the left and right arrow keys for up and down.

```jsx
<RovingTabIndexProvider direction="horizontal|vertical|both" />
```

## License

MIT © [stevejay](https://github.com/stevejay)

## Development

If you have build errors when building Storybook locally, you are likely using Node v13. Please use either Node v14+ or Node v12.

### Issues

- The `@types/styled-components` package is currently downgraded to v4.1.8 because of [this issue](https://github.com/DefinitelyTyped/DefinitelyTyped/issues/33311)
