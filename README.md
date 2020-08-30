# react-roving-tabindex

> React Hooks implementation of a roving tabindex. See the storybook [here](https://stevejay.github.io/react-roving-tabindex/) to try it out.

[![bundlephobia](https://img.shields.io/bundlephobia/minzip/react-roving-tabindex)](https://bundlephobia.com/result?p=react-roving-tabindex) [![NPM](https://img.shields.io/npm/v/react-roving-tabindex.svg)](https://www.npmjs.com/package/react-roving-tabindex) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![CircleCI](https://img.shields.io/circleci/project/github/stevejay/react-roving-tabindex/master.svg)](https://circleci.com/gh/stevejay/react-roving-tabindex/tree/master)

## Background

The roving tabindex is an accessibility pattern for a grouped set of inputs. It assists people who are using their keyboard to navigate your Web site. All inputs in a group get treated as a single tab stop, which speeds up keyboard navigation. Also, the last focused input in a group is remembered, so that it can receive focus again when the user tabs back to the group.

When in the group, the left and right (or up and down) arrow keys move between the inputs. The Home and End keys (Fn+LeftArrow and Fn+RightArrow on macOS) move to the group's first and last inputs respectively.

More information about the roving tabindex pattern is available [here](https://www.stefanjudis.com/today-i-learned/roving-tabindex/) and [here](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#Managing_focus_inside_groups).

### Implementation Considerations

There are two main architectural choices to be made:

- Whether dynamic enabling and unenabling of the inputs in the group should be supported.
- How the inputs in a group are identified, including if they need to be direct children of the group container.

This package opts to support dynamic enabling and unenabling. It also allows inputs to be nested as necessary within subcomponents and wrapper elements. It uses React Context to communicate between the managing group component and the nested inputs.

## Requirements

This package has been written using the React Hooks API, so it is only usable with React version 16.8 onwards.

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
  useFocusEffect
} from "react-roving-tabindex";

type Props = {
  disabled?: boolean;
  children: React.ReactNode;
};

const ToolbarButton = ({ disabled = false, children }: Props) => {
  // The ref of the input to be controlled.
  const ref = React.useRef<HTMLButtonElement>(null);

  // handleKeyDown and handleClick are stable for the lifetime of the component:
  const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
    ref, // Don't change the value of this ref.
    disabled // But change this as you like throughout the lifetime of the component.
  );

  // Use some mechanism to set focus on the button if it gets focus.
  // In this case I use the included useFocusEffect hook:
  useFocusEffect(focused, ref);

  return (
    <button
      ref={ref}
      tabIndex={tabIndex} // tabIndex must be applied here.
      disabled={disabled}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

const App = () => (
  // Wrap each group in a RovingTabIndexProvider.
  <RovingTabIndexProvider>
    {/*
      it's fine for the roving tabindex components to be nested
      in other DOM elements or React components.
    */}
    <ToolbarButton>First Button</ToolbarButton>
    <ToolbarButton>Second Button</ToolbarButton>
  </RovingTabIndexProvider>
);
```

### Custom ID

You can optionally pass a custom ID to the `useRovingTabIndex` hook as the third argument:

```jsx
const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
  ref,
  disabled,
  "custom-id-1" // A custom ID.
);
```

This is useful if you need to support server-side rendering. The value initially passed will be used for the lifetime of the containing component. You cannot dynamically change this ID.

### Navigation

By default the left and right arrow keys are used to move between inputs. You can change this using the `direction` prop on the provider:

```jsx
<RovingTabIndexProvider direction="horizontal|vertical|both" />
```

The `vertical` option requires the up and down arrows for navigation. The `both` option is a mix of the other two options.

## License

MIT © [stevejay](https://github.com/stevejay)

## Development

If you have build errors when building Storybook locally, you are likely using Node v13. Please use either Node v14+ or Node v12.

### Issues

- The `@types/styled-components` package is currently downgraded to v4.1.8 because of [this issue](https://github.com/DefinitelyTyped/DefinitelyTyped/issues/33311). This only affects the Storybook build.
