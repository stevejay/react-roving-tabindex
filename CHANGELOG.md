# Changelog

## 2.1.0

- Updated dev and peer dependencies.
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
