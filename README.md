# react-roving-tabindex

> React Hooks implementation of a roving tabindex, now with grid support. See the storybook [here](https://stevejay.github.io/react-roving-tabindex/) to try it out.

[![bundlephobia](https://img.shields.io/bundlephobia/minzip/react-roving-tabindex)](https://bundlephobia.com/result?p=react-roving-tabindex) [![NPM](https://img.shields.io/npm/v/react-roving-tabindex.svg)](https://www.npmjs.com/package/react-roving-tabindex) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![CircleCI](https://img.shields.io/circleci/project/github/stevejay/react-roving-tabindex/master.svg)](https://circleci.com/gh/stevejay/react-roving-tabindex/tree/master) [![Coverage Status](https://coveralls.io/repos/github/stevejay/react-roving-tabindex/badge.svg?branch=master)](https://coveralls.io/github/stevejay/react-roving-tabindex?branch=master)

## Background

The roving tabindex is an accessibility pattern for a grouped set of inputs. It assists people who are using their keyboard to navigate your Web site. All inputs in a group get treated as a single tab stop, which speeds up keyboard navigation. The last focused input in the group is also remembered, so that it can receive focus again when the user tabs back into the group.

When in the group, the ArrowLeft and ArrowRight (or ArrowUp and ArrowDown) keys move focus between the inputs. The Home and End keys (Fn+LeftArrow and Fn+RightArrow on macOS) move focus to the group's first and last inputs respectively.

More information about the roving tabindex pattern is available [here](https://www.stefanjudis.com/today-i-learned/roving-tabindex/) and [here](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#Managing_focus_inside_groups).

This pattern can also be used for a grid of items, as in [this calendar example](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Grid_Role#Calendar_example) on the MDN website. Conventionally, the containing element for the grid should be given the `grid` role, and each grid item should given the `gridcell` role. ArrowLeft and ArrowRight are used to move focus between items in a row, while the ArrowUp and ArrowDown keys move between the rows. The Home and End keys (Fn+LeftArrow and Fn+RightArrow on macOS) move focus to a row's first and last items respectively. If the Control key is held while pressing the Home and End keys then focus is moved respectively to the very first and very last item in the grid.

### Implementation considerations

There are two main architectural choices to be made:

- Whether dynamic enabling and unenabling of the inputs in the group should be supported.
- How the inputs in a group are identified, including if they need to be direct children of the group container.

This package opts to support dynamic enabling and unenabling. It also allows inputs to be nested as necessary within subcomponents and wrapper elements. It uses React Context to communicate between the managing group component and the nested inputs.

This package does not support nesting one roving tabindex group inside another. I believe that this complicates keyboard navigation too much.

### When not to use this package

This package is designed as a general solution for a roving tabindex in a toolbar or a smallish grid. If you need a roving tabindex in a very large grid or table (a few hundred cells or more) then you may be better served with a bespoke implementation. By not including any unnecessary flexibility that this package offers then you will likely create a more performant implementation when performance becomes paramount. For example, you might not need to support the enabling and unenabling of tab stops. It also takes time to register the cells with the package, and there is an overhead to creating the row index mapping.

## Requirements

This package has been written using the React Hooks API, so it is only usable with React version 16.8 onwards. It has peer dependencies of `react` and `react-dom`.

## Installation

```bash
npm install --save react-roving-tabindex
```

This package includes TypeScript typings.

If you need to support IE then you need to also install polyfills for `Array.prototype.findIndex` and `Map`. If you are using React with IE then [you already need to use a `Map` polyfill](https://reactjs.org/docs/javascript-environment-requirements.html). If you use a global polyfill like [core-js](https://github.com/zloirock/core-js) or [babel-polyfill](https://babeljs.io/docs/usage/polyfill/) then it should also include a `findIndex` polyfill.

## Usage

There is a storybook for this package [here](https://stevejay.github.io/react-roving-tabindex/), with both basic and grid usage examples.

### Basic usage

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
      tabIndex={tabIndex} // tabIndex must be applied here
      disabled={disabled}
      onKeyDown={handleKeyDown} // handler applied here
      onClick={handleClick} // handler applied here
    >
      {children}
    </button>
  );
};

const SomeComponent = () => (
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

#### Optional ID parameter

The `useRovingTabIndex` hook has an optional third argument that is an options object. One use for it is to pass a custom ID:

```jsx
const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
  ref,
  disabled,
  { id: "custom-id-1" } // A custom ID.
);
```

This is required if you need to support server-side rendering (SSR). Note that the value initially passed will be used for the lifetime of the containing component; you cannot dynamically update this ID.

Note that it is fine to create a new object for this third argument each time the containing component is rendered; it will not trigger a re-render.

#### Navigation

The default navigation configuration is the following:

| Key        | Resulting navigation |
| ---------- | -------------------- |
| ArrowLeft  | Previous tab stop    |
| ArrowRight | Next tab stop        |
| ArrowUp    | Previous tab stop    |
| ArrowDown  | Next tab stop        |
| Home       | Very first tab stop  |
| Home+Ctrl  | Very first tab stop  |
| End        | Very last tab stop   |
| End+Ctrl   | Very last tab stop   |

The above configuration is included with this package as the following default key configuration object:

```ts
import { Key, Navigation, KeyConfig } from "react-roving-tabindex";

export const DEFAULT_KEY_CONFIG: KeyConfig = {
  [Key.ARROW_LEFT]: Navigation.PREVIOUS,
  [Key.ARROW_RIGHT]: Navigation.NEXT,
  [Key.ARROW_UP]: Navigation.PREVIOUS,
  [Key.ARROW_DOWN]: Navigation.NEXT,
  [Key.HOME]: Navigation.VERY_FIRST,
  [Key.HOME_WITH_CTRL]: Navigation.VERY_FIRST,
  [Key.END]: Navigation.VERY_LAST,
  [Key.END_WITH_CTRL]: Navigation.VERY_LAST
};
```

This object is used automatically by default. If this is not suitable for your use case then you can pass your own key configuration object to the `RovingTabIndexProvider`. For example, you might want the ArrowUp and ArrowDown keys to have no effect:

```ts
import {
  DEFAULT_KEY_CONFIG,
  Key,
  RovingTabIndexProvider
} from "react-roving-tabindex";

export const CUSTOM_KEY_CONFIG = {
  ...DEFAULT_KEY_CONFIG,
  [Key.ARROW_UP]: undefined, // or null
  [Key.ARROW_DOWN]: undefined // or null
};

const SomeComponent = () => (
  <RovingTabIndexProvider keyConfig={CUSTOM_KEY_CONFIG}>
    {/* Whatever here */}
  </RovingTabIndexProvider>
);
```

Note that your custom key configuration object should be stable; please do not recreate it each time the component containing the `RovingTabIndexProvider` is invoked as this will trigger a re-render. You can however pass a new configuration if you ever need to dynamically change the key configuration behaviour.

Note also that the TypeScript typings for the key configuration object somewhat constrain the possible navigation options for each key to the most logical choices given the established a11y conventions for a roving tabindex. For example, you cannot assign `Navigation.VERY_FIRST` to `Key.ARROW_LEFT`.

### Grid usage

This package supports a roving tabindex in a grid of elements. For this to work you need to do two things in addition to following the basic usage instructions above.

Firstly you need to create and pass a custom key configuration object to the `RovingTabIndexProvider` component. The exact configuration will depend on your needs but it will likely be something like the following:

```ts
import {
  Key,
  KeyConfig,
  Navigation,
  RovingTabIndexProvider
} from "react-roving-tabindex";

// Create it...
const GRID_KEY_CONFIG: KeyConfig = {
  [Key.ARROW_LEFT]: Navigation.PREVIOUS,
  [Key.ARROW_RIGHT]: Navigation.NEXT,
  [Key.ARROW_UP]: Navigation.PREVIOUS_ROW,
  [Key.ARROW_DOWN]: Navigation.NEXT_ROW,
  [Key.HOME]: Navigation.FIRST_IN_ROW,
  [Key.HOME_WITH_CTRL]: Navigation.VERY_FIRST,
  [Key.END]: Navigation.LAST_IN_ROW,
  [Key.END_WITH_CTRL]: Navigation.VERY_LAST
};

// ... then use it:
const SomeComponent = () => (
  <RovingTabIndexProvider keyConfig={GRID_KEY_CONFIG}>
    {/* Whatever here */}
  </RovingTabIndexProvider>
);
```

Secondly, for each usage of the `useRovingTabIndex` hook you need to pass a third argument of a `rowIndex` value in an options object:

```ts
const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
  ref,
  disabled,
  { rowIndex: 0 }
);
```

The `rowIndex` value should be the zero-based row index for the containing component in the grid it is in. Thus all items that represent the first row of grid items should have `{ rowIndex: 0 }` passed to the hook, the second row `{ rowIndex: 1 }`, and so on. If the shape of the grid can change dynamically then it is fine to update the rowIndex value. For example, the grid might initially has four items per row but be dynamically updated to three items per row.

Note that it is fine to create a new object for this third argument each time the containing component is rendered; it will not trigger an unnecessary re-render. Also, if required you can combine the `rowIndex` with a custom `id` in the same options object (e.g., `{ rowIndex: 0, id: 'some-id' }`).

## Upgrading

### From version 1 to version 2

There are three breaking changes that might require updating your usages of this library.

Firstly, this package no longer includes a ponyfill for `Array.prototype.findIndex` and also now uses the `Map` class. If you need to support IE then you will need to install a polyfill for both, although if you already support IE then you are almost certainly using a suitable global polyfill. Please see the Installation section earlier in this file for further guidance.

Secondly, the `direction` property of the `RovingTabIndexProvider` has been removed. Instead the behaviour of the roving tabindex for the possible key presses (ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Home, End, Home+Ctrl and End+Ctrl) is now configurable. Rather than specifying a direction, you can now pass a key configuration object to the `RovingTabIndexProvider` component:

```ts
const SomeComponent = () => (
  <RovingTabIndexProvider keyConfig={YOUR_CONFIG}>
    {/* Whatever here */}
  </RovingTabIndexProvider>
);
```

If you do not pass your own key configuration object then the following default one is automatically used:

```ts
export const DEFAULT_KEY_CONFIG: KeyConfig = {
  [Key.ARROW_LEFT]: Navigation.PREVIOUS,
  [Key.ARROW_RIGHT]: Navigation.NEXT,
  [Key.ARROW_UP]: Navigation.PREVIOUS,
  [Key.ARROW_DOWN]: Navigation.NEXT,
  [Key.HOME]: Navigation.VERY_FIRST,
  [Key.HOME_WITH_CTRL]: Navigation.VERY_FIRST,
  [Key.END]: Navigation.VERY_LAST,
  [Key.END_WITH_CTRL]: Navigation.VERY_LAST
};
```

This configuration specifies the mapping between key press and focus movement, and it should be quite self-explanatory. The default mapping is likely what you want if you are migrating from version 1. It is the equivalent of the setting `direction="both"`. If you do want to make changes, such as not supporting the ArrowLeft and ArrowRight keys then you can create and use a custom key configuration:

```ts
import { DEFAULT_KEY_CONFIG, Key } from "react-roving-tabindex";

export const CUSTOM_KEY_CONFIG = {
  ...DEFAULT_KEY_CONFIG, // Copy the default configuration.
  [Key.ARROW_LEFT]: undefined, // Or use null.
  [Key.ARROW_RIGHT]: undefined // Or use null.
};

const SomeComponent = () => (
  <RovingTabIndexProvider keyConfig={CUSTOM_KEY_CONFIG}>
    {/* Whatever here */}
  </RovingTabIndexProvider>
);
```

The third and final breaking change is that the optional third argument to the `useRovingTabIndex` hook has changed type from a string ID to an object. This change only affects you if you have needed to pass your own IDs to the hook, in particular if you support server-side rendering (SSR). So if you have used the following...

```ts
const [...] = useRovingTabIndex(ref, true, id);
//                                         ^^
```

... then you will need to instead pass the ID in an object:

```ts
const [...] = useRovingTabIndex(ref, true, { id });
//                                         ^^^^^^
```

Note that it is fine to create a new object for that third argument each time the containing component is rendered; by itself that will not trigger a re-render. As a reminder, the assigned ID will be captured on mounting of the containing component and cannot be changed during that component's lifetime.

### From version 0.x to version 1

The version 1 release has no breaking changes compared to v0.9.0. The version bump was because the package had matured.

## License

MIT © [stevejay](https://github.com/stevejay)

## Development

If you have build errors when building the Storybook locally, you are likely using Node v13. Please use either Node v14+ or Node v12.

### Issues

- The `@types/styled-components` package is currently downgraded to v4.1.8 because of [this issue](https://github.com/DefinitelyTyped/DefinitelyTyped/issues/33311). This only affects the Storybook build.

## TODO

- Own handling of click and keydown (integrating them with the hook's handlers).
