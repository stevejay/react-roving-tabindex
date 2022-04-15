# react-roving-tabindex

> React Hooks implementation of a roving tabindex, now with grid support. See the storybook [here](https://stevejay.github.io/react-roving-tabindex/) to try it out.

[![bundlephobia](https://img.shields.io/bundlephobia/minzip/react-roving-tabindex)](https://bundlephobia.com/result?p=react-roving-tabindex) [![NPM](https://img.shields.io/npm/v/react-roving-tabindex.svg)](https://www.npmjs.com/package/react-roving-tabindex) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![CircleCI](https://img.shields.io/circleci/project/github/stevejay/react-roving-tabindex/master.svg)](https://circleci.com/gh/stevejay/react-roving-tabindex/tree/master) [![Coverage Status](https://coveralls.io/repos/github/stevejay/react-roving-tabindex/badge.svg?branch=master)](https://coveralls.io/github/stevejay/react-roving-tabindex?branch=master)

## Background

The roving tabindex is an accessibility pattern for a grouped set of inputs. It assists people who are using their keyboard to navigate your Web site. All inputs in a group get treated as a single tab stop which speeds up keyboard navigation. The last focused input in the group is also remembered. It receives focus again when the user tabs back into the group.

When in the group, the ArrowLeft and ArrowRight keys move focus between the inputs. (You can also configure this library so that the ArrowUp and ArrowDown keys move focus.) The Home and End keys (Fn+LeftArrow and Fn+RightArrow on macOS) move focus to the group's first and last inputs respectively.

More information about the roving tabindex pattern is available [here](https://www.stefanjudis.com/today-i-learned/roving-tabindex/) and [here](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#Managing_focus_inside_groups).

This pattern can also be used for a grid of items, as in [this calendar example](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Grid_Role#Calendar_example). Conventionally, the containing element for the grid should be given the `grid` role, and each grid item should be given the `gridcell` role. The ArrowLeft and ArrowRight keys are used to move focus between inputs in a row, while the ArrowUp and ArrowDown keys move focus between the rows. The Home and End keys (Fn+LeftArrow and Fn+RightArrow on macOS) move focus to a row's first and last inputs respectively. If the Control key is held while pressing the Home and End keys then focus is moved to the very first and very last input in the grid respectively.

### Implementation considerations

There are two main architectural choices to be made:

- Whether dynamic enabling and unenabling of the inputs in the group should be supported.
- How the inputs in a group are identified, including if they need to be direct children of the group container.

This package opts to support dynamic enabling and unenabling. It also allows inputs to be nested as necessary within subcomponents and wrapper elements. It uses React Context to communicate between the managing group component and the nested inputs.

This package does not support nesting one roving tabindex group inside another. I believe that this complicates keyboard navigation too much.

### When not to use this package

This package is designed as a general solution for a roving tabindex in a toolbar or a smallish grid. If you need a roving tabindex in a very large grid or table (a few hundred cells or more) then you will likely be better served with a bespoke implementation. By not including any unnecessary flexibility that this package offers then you should create a more performant implementation. For example, you might not need to support the enabling and unenabling of tab stops. It also takes time to register the cells with the package, and there is an overhead to creating the row index mapping for a grid.

## Requirements

This package has been written using the React Hooks API, so it is only usable with React version 16.8 onwards. It has peer dependencies of `react` and `react-dom`.

## Installation

```bash
npm install react-roving-tabindex

# or

yarn add react-roving-tabindex
```

This package includes TypeScript typings.

If you need to support IE then you also need to install polyfills for `Array.prototype.findIndex` and `Map`. If you are using React with IE then [you already need to use a `Map` polyfill](https://reactjs.org/docs/javascript-environment-requirements.html). If you use a global polyfill like [core-js](https://github.com/zloirock/core-js) or [babel-polyfill](https://babeljs.io/docs/usage/polyfill/) then it should include a `findIndex` polyfill.

## Usage

There is a basic storybook for this package [here](https://stevejay.github.io/react-roving-tabindex/), with both toolbar and grid usage examples.

### Basic usage

```tsx
import { ReactNode, useRef } from "react";
import {
  RovingTabIndexProvider,
  useRovingTabIndex,
  useFocusEffect
} from "react-roving-tabindex";

type Props = {
  disabled?: boolean;
  children: ReactNode;
};

const ToolbarButton = ({ disabled = false, children }: Props) => {
  // The ref of the input to be controlled.
  const ref = useRef<HTMLButtonElement>(null);

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
  // Wrap each roving tabindex group in a RovingTabIndexProvider.
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

If you need to incorporate your own handling for `onClick` and/or `onKeyDown` events then just create handlers that invoke multiple handlers:

```ts
return (
  <button
    ref={ref}
    tabIndex={tabIndex}
    disabled={disabled}
    onKeyDown={(event) => {
      handleKeyDown(event); // handler from the hook
      someKeyDownHandler(event); // your handler
    }}
    onClick={(event) => {
      handleClick(event); // handler from the hook
      someClickHandler(event); // your handler
    }}
  >
    {children}
  </button>
);
```

### Options

The `RovingTabIndexProvider` component includes an optional `options` prop for tailoring the behaviour of the library:

```tsx
const SomeComponent = () => (
  <RovingTabIndexProvider options={{ direction: "vertical" }}>
    {/* whatever */}
  </RovingTabIndexProvider>
);
```

There are currently three options available: `direction`, `focusOnClick`, and `loopAround`. Note that it is fine to create a new `options` object on every render - the library's internal state is only updated if the actual option values change, rather than the containing `options` object.

#### Direction

By default, it is the ArrowLeft and ArrowRight keys that are used to move to the previous and next item respectively. The `RovingTabIndexProvider` has an optional `direction` property on the `options` prop that allows you to change this:

```ts
const SomeComponent = () => (
  <RovingTabIndexProvider options={{ direction: "vertical" }}>
    {/* whatever */}
  </RovingTabIndexProvider>
);
```

The default behaviour is selected by setting the direction to `horizontal`. If the direction is set to `vertical` then it is the ArrowUp and ArrowDown keys that are used to move to the previous and next item. If the direction is set to `both` then both the ArrowLeft and ArrowUp keys can be used to move to the previous item, and both the ArrowRight and ArrowDown keys can be used to move to the next item. You can update the `direction` value at any time.

#### Loop Around

By default, if you try to tab past the very start or very end of the roving tabindex then tabbing does not wrap around. The `RovingTabIndexProvider` has an optional `loopAround` property on the `options` prop that allows you to change this:

```ts
const SomeComponent = () => (
  <RovingTabIndexProvider options={{ loopAround: true }}>
    {/* whatever */}
  </RovingTabIndexProvider>
);
```

If this option is set to `true` then tabbing will wrap around if you reach the very start or very end of the roving tabindex items, rather than stopping. Note that this option does not apply if the roving tabindex is being used with a grid.

#### Focus on Click

By default, clicking on a roving tabindex item will not result in `focus()` being invoked on the item (via `useFocusEffect`). It is only when you use the keyboard to move to an item that `focus()` is invoked on it. The `RovingTabIndexProvider` has an optional `focusOnClick` property on the `options` prop that allows you to change this:

```ts
const SomeComponent = () => (
  <RovingTabIndexProvider options={{ focusOnClick: true }}>
    {/* whatever */}
  </RovingTabIndexProvider>
);
```

Browsers are [inconsistent in their behaviour](https://zellwk.com/blog/inconsistent-button-behavior/) when a button is clicked so you will see some variation between the browsers with the default value of `false` for this option. Please set this option to `true` if you want this library to behave as it did prior to version 3.

### Grid usage

This package supports a roving tabindex in a grid. For each usage of the `useRovingTabIndex` hook in the grid, you _must_ pass a row index value as a third argument to the hook:

```ts
const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
  ref,
  disabled,
  someRowIndexValue
);
```

The row index value must be the zero-based row index for the grid item that the hook is being used with. Thus all items that represent the first row of grid items should have `0` passed to the hook, the second row `1`, and so on. If the shape of the grid can change dynamically then it is fine to update the row index value. For example, the grid might initially have four items per row but get updated to have three items per row.

The `direction` property of the `RovingTabIndexProvider` is ignored when row indexes are provided. This is because the ArrowUp and ArrowDown keys are always used to move between rows.

## Upgrading

### From version 2 to version 3

Please see the CHANGELOG.md file for instructions to upgrade from version 2 to version 3.

### From version 1 to version 2

There are a few breaking changes in version 2.

This package no longer includes a ponyfill for `Array.prototype.findIndex` and now also uses the `Map` class. If you need to support IE then you will need to install polyfills for both. That said, if you currently support IE then you are almost certainly using a suitable global polyfill already. Please see the Installation section earlier in this file for further guidance.

The optional ID argument that was the third argument to the `useRovingTabIndex` hook has been replaced with the new optional row index argument. The ID argument was included to support server-side rendering (SSR) but it is not actually required. By default this library auto-generates an ID within the hook. This is not a problem in SSR because it never gets generated and serialized on the server. Thus it is fine for it to be auto-generated even when SSR needs to be supported. So if you have previously used the following...

```ts
const [...] = useRovingTabIndex(ref, true, id);
//                                         ^^
```

... then you can simply remove that third argument:

```ts
const [...] = useRovingTabIndex(ref, true);
```

### From version 0.x to version 1

The version 1 release has no breaking changes compared to v0.9.0. The version bump was because the package had stabilized.

## License

MIT © [stevejay](https://github.com/stevejay)

## Development

If you have build errors when building the Storybook locally, you are likely using Node v13. Please use either Node v14+ or Node v12.

### Publishing

- `npm run build`
- For beta versions, add or bump a `-rcX` suffix to the package.json version number and then run `npm publish --tag next`.
- For releases, remove the `-rcX` suffix from the package.json version number and then run `npm publish`.
