# Changelog

## 1.1.0 (unreleased)

### Security

- `vue`, `vuex` and `to-title-case` are no longer installed with the package. The Dashboard provides Vue itself, so the widget never used them, but they brought five known vulnerabilities into every installation.
- Build tools updated (Vite 8, ESLint 10). `npm audit` reports no vulnerabilities.
- Dashboard users can no longer replace the options from the browser. The `new-options` socket event is gone; options come only from the editor or from `msg.options`.

### Fixed

- The buttons moved whenever the option changed, because the row was as wide as the current label. The label area is now as wide and high as the largest option.
- On a transparent button without an icon color, the icon was white and invisible on a light background. It now uses the theme color; on light button colors it turns dark.
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

- `msg.index` selects by position, `msg.step` moves forward or back (e.g. `1` or `-1`).
- `msg.options` also accepts plain values like `["Off","On"]` or `[18,20,22]`, and objects with only a label.
- `msg.ui_update` changes label, icons, icon size and colors at runtime; `null` returns to the editor setting.
- Option values in the editor can be text, number, boolean or JSON. Invalid values are marked in the editor.
- Setting *Layout*: centered (as wide as the longest option) or buttons at the edges.
- Setting *Long text*: wrap to at most 2 lines, shrink the font (down to 14 px), or one line; cut off text ends with "…" and shows a tooltip.
- Setting *Corners* for the button corner radius (square, default, rounded, round or own px), also as `buttonRadius` in `msg.ui_update`.
- New editor: a live preview of the whole widget below name, group and size (stays at the top while scrolling; colors from the group's theme, its buttons step through the options), sections *Behavior* and *Appearance*, an icon picker with suggestions and a search over all Material Design icons of the installed Dashboard, color swatches with an eyedropper, and icon sizes S, M, L or own pixels.
- Setting *Send a message when an input message selects an option* (off for new nodes, on for nodes from 1.0).
- Setting *Send after*: a selection in the dashboard is sent only after the given seconds without further switching, so options can be skipped without triggering anything. A bar below the buttons shows the wait.
- Setting *After the last option, start again at the first* (on by default). If off, the buttons stop at both ends.
- `msg.payload` finds options with the same JSON, and `"true"` finds the option `true`.
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
