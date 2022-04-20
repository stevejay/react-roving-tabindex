# Changelog

## 3.2.0

- Updated dev dependencies.

## 3.1.1

- Updated dev dependencies.
- Fixed a bug whereby `loopAround` option on a toolbar doesn't loop if first/last tabStop is disabled (thanks to @bfeigin).

## 3.1.0

- Updated dev dependencies.
- Support having a short final row of tab stops in a grid layout (thanks to @webextensions).

## 3.0.0

This release has two breaking changes.

The first is that the `RovingTabIndexProvider` now takes an optional `options` prop for tailoring the behaviour of the library. If you have previously used the `direction` prop on the provider then you will need to update your usage as follows:

```tsx
// Old:
const SomeComponent = () => (
  <RovingTabIndexProvider direction="vertical">
    {/* whatever */}
  </RovingTabIndexProvider>
);

// New:
const SomeComponent = () => (
  <RovingTabIndexProvider options={{ direction: "vertical" }}>
    {/* whatever */}
  </RovingTabIndexProvider>
);
```

Note that it is fine to create a new `options` object on every render - the library's internal state is only updated if the individual values of the `options` object's properties change.

The second breaking change is that now, when an element that is part of the roving tabindex is clicked, `focus()` is no longer automatically invoked on the element. The previous behaviour of this library was that `focus()` would be invoked on a click. The reason for this was that browsers are quite inconsistent in their behaviour when a button is clicked, and invoking `focus()` in that situation improved consistency. However, [@kripod](https://github.com/kripod) suggested that a better default is to not automatically invoke `focus()` on click. If you want to maintain the old behaviour then you can use the new `focusOnClick` option and set it to `true`:

```tsx
const SomeComponent = () => (
  <RovingTabIndexProvider options={{ focusOnClick: true }}>
    {/* whatever */}
  </RovingTabIndexProvider>
);
```

There is also a third option available on the `RovingTabIndexProvider`, called `loopAround`. If set to `true` then tabbing wraps around if you reach the very start or very end of the roving tabindex items, rather than stopping. This option does not apply if the roving tabindex is being used with a grid.

## 2.1.0

- Updated dev dependencies.
- Switched from `npm` to `yarn`.

## 2.0.0

This release is a complete rewrite to support a roving tabindex in a grid. There are a few breaking changes, hence the major version bump. Please see the project README file for how to migrate from version 1.

Notable changes:

- Removed array-find-index ponyfill dependency.
- Removed lodash.uniqueid dependency.
- Replaced the optional ID argument to the useRovingTabIndex hook with an optional row index argument (for supporting grids).

## 1.0.0

This release has no breaking changes compared to v0.9.0. I just thought it was time to promote the package to v1. The changes are to do with the build process and Storybook; no source files have been altered.

- Rewrite Storybook files to support v6 format.
- Remove some files that were being erroneously included in the dist directory.
- Rewrite some of the readme file.
- Remove an unused file from the src directory.
- Update dev dependencies.

## 0.9.0

- Updated dev dependencies.
- Removed upper limit for node in engines object in package.json.

## 0.8.0

- Updated dev dependencies.
- Adjusted the package.json engines field to not support node v13.
- Fixed the storybook styling.

## 0.7.2

- Updated dev dependencies.
- Updated README file.
- Added `types` field to the `package.json` file.
- Fixed linting errors due to update of prettier and eslint. No changes were made to how the package is implemented.
