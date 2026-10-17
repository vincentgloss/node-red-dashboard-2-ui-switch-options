# Changelog

## 1.1.0 (unreleased)

### Security

- `vue`, `vuex` and `to-title-case` are no longer installed with the package. The Dashboard provides Vue itself, so the widget never used them, but they brought five known vulnerabilities into every installation.
- Build tools updated (Vite 8, ESLint 10). `npm audit` reports no vulnerabilities.
- Dashboard users can no longer replace the options from the browser. The `new-options` socket event is gone; options come only from the editor or from `msg.options`.

### Fixed

- Options set with `msg.options` were stored as an object instead of a list and were lost when a dashboard was reloaded. Selecting an option by `msg.payload` also dropped them.
- A shorter `msg.options` list kept old entries from the previous list.
- The node crashed on deploy if no group was set.
- Default icons did not apply to nodes that were imported and never opened in the editor (the buttons showed no icon).
- Socket listeners were not removed when the widget was closed, so they piled up with every page change.
- `msg.payload` values like `0` or `false` were ignored, and a number did not find an option with the same text as value.
- A switch in one dashboard did not show up in other open dashboards.
- The node help showed only "In-Editor help text will go here."
- Options with a value but no label were silently dropped when saving the editor.
- Removed console logging on every message in Node-RED and in the browser.

### Added

- `msg.enabled`, `msg.visible` and `msg.class`.
- `index` in every output message, `topic` is passed on from input messages.
- German translation of the editor and the help, all editor texts translatable.
- Example flow `switch-options-demo`.
- German README.

### Changed

- Output after an input message: `payload`, `label`, `index` (and `topic`), like after a switch in the dashboard. `currentIndex`, `options` and the topic `ui-switch-options-update` are gone.
- An unknown `msg.payload` shows a node warning instead of sending a message with topic `error`.
- After a redeploy the widget starts with the options from the editor and keeps the selected option if it is still one of them.
- Requires FlowFuse Dashboard 1.23 or newer (declared as peer dependency).

## 1.0.0 (2024-09-10)

Initial version.
