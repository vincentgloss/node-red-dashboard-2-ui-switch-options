# Switch Options – Option Switcher for FlowFuse Dashboard

A widget for [FlowFuse Dashboard 2.0](https://dashboard.flowfuse.com/), the dashboard for Node-RED, that steps through a list of options with **previous** and **next** buttons. Every switch sends the value of the selected option into your flow.

**English** | [Deutsch](README.de.md)

![A dashboard group with three option switchers: "Heating mode" showing "Off", "Temperature" with minus and plus buttons showing "22 °C", and "Color" with transparent buttons showing "Blue"](https://raw.githubusercontent.com/vincentgloss/node-red-dashboard-2-ui-switch-options/main/docs/dashboard-example.png)

## Requirements

| Software | Version |
|---|---|
| Node-RED | 3.0 or newer |
| FlowFuse Dashboard (`@flowfuse/node-red-dashboard`) | 1.23 or newer |

## Installation

**In the Node-RED editor (recommended):** open the menu, choose **Manage palette**, switch to **Install**, search for `@vincentgloss/node-red-dashboard-2-ui-switch-options` and click **Install**.

**From the command line:** run this in your Node-RED user directory (usually `~/.node-red`), then restart Node-RED:

```sh
npm install @vincentgloss/node-red-dashboard-2-ui-switch-options
```

## Quick start

1. Drag **switch option** from the *Dashboard 2* section of the palette into your flow.
2. Choose a **Group**, add a few **Options** (label and value) and deploy.
3. Connect a debug node to the output and switch in the dashboard.

A ready-made demo is included: **Import → Examples → @vincentgloss/node-red-dashboard-2-ui-switch-options → switch-options-demo**. It opens at `/switch-options-demo` and has an inject node for every input.

## Configuration

At the top of the editor a **preview** shows the widget with the current settings and the colors of the group's theme. Its buttons step through the options. The settings are split into the tabs *Options* and *Appearance*.

| Field | Description |
|---|---|
| **Group**, **Size** | Where the widget appears and how much room it takes. |
| **Label** | Optional text above the widget. HTML is allowed. |
| **Options** | The list to step through. Each option has a label (shown, HTML allowed) and a value (sent). The value can be text, a number, a boolean or JSON. Without a label the value is shown. |
| **After the last option, start again at the first** | On by default. If unchecked, the buttons stop at the first and the last option. |
| **Send a message when an input message selects an option** | Off for new nodes. Leave it off if the widget only shows a state, so a message cannot loop back. |
| **Prev icon**, **Next icon** | Picker with suitable suggestions and a search over all [Material Design icons](https://pictogrammers.com/library/mdi/) of the installed Dashboard. Default: `chevron-double-left` and `chevron-double-right`. |
| **Icon size** | **S** (18 px, default), **M** (24 px) or **L** (32 px), or an own size in pixels. |
| **Icon color**, **Button color** | A color from the palette, your own with the eyedropper, or in the text field a value like `#AEEA00` or a [color name](https://vuetifyjs.com/en/styles/colors/) like `teal`. *Default* uses the theme. The button color can also be *Transparent* (no background, no shadow). Without an own icon color, the icon uses the theme color on transparent buttons and turns dark on light buttons. |

## Control from a flow

First `msg.options` and `msg.ui_update` are applied, then one option is selected: by `msg.index`, otherwise by `msg.step`, otherwise by `msg.payload`.

| Property | Effect |
|---|---|
| `msg.payload` | Selects the option with this value. Text and numbers match each other (`1` selects `"1"`, `"true"` selects `true`), objects match options with the same JSON. If nothing matches, the node shows a warning and nothing changes. |
| `msg.index` | Selects the option at this position, starting at 0. |
| `msg.step` | Moves by this many options: `1` is next, `-1` previous. Stops at the ends if *start again at the first* is off. |
| `msg.options` | Replaces the options. Plain values like `["Off","On"]` or `[18,20,22]`, or objects like `[{"label":"Off","value":"off"}]`. The current option stays selected if it is still in the list, otherwise the first one. |
| `msg.ui_update` | Changes `label`, `prevIcon`, `nextIcon`, `iconColor`, `iconSize` or `buttonColor`, e.g. `{"label":"Mode","buttonColor":"red"}`. `null` returns to the editor setting. `class` adds CSS classes. |
| `msg.enabled` | `false` disables the buttons, `true` enables them again. |
| `msg.visible` | `false` hides the widget, `true` shows it again. |
| `msg.class` | Adds CSS classes to the widget. |

All open dashboards always show the same option and appearance, also after a reload. After a redeploy the widget starts with the options and appearance from the editor again and keeps the selected option if it is still one of them.

## Output

A message is sent when somebody switches in a dashboard, and when an input message selects an option if *Send a message when an input message selects an option* is checked:

```json
{ "payload": "comfort", "label": "Comfort", "index": 2 }
```

| Property | Content |
|---|---|
| `payload` | The value of the selected option, with its type (text, number, boolean or JSON). |
| `label` | The label of the selected option. |
| `index` | The position of the selected option, starting at 0. |
| `topic` | Taken from the input message, if it had one. |
| `_client` | Which dashboard client switched, if *Include client data* is enabled in the Dashboard settings. |

## Upgrading from 1.0

Existing nodes keep working as before: they still send a message when an input message selects an option, and they still start again at the first option after the last. Opening them in the editor shows both settings checked. Values from 1.0 stay text.

- The output after an input message now has the same shape as after a switch in the dashboard: `payload`, `label` and `index`. `currentIndex`, `options` and the fixed topic `ui-switch-options-update` are gone.
- An unknown `msg.payload` now shows a node warning instead of sending `"Option not found in options array"` with topic `error`.

## Development

```sh
npm install
npm run build      # builds resources/ui-switch-options.umd.js
npm run dev        # rebuilds on every change, with source map
npm run lint
```

To try a local change, run `npm install /path/to/node-red-dashboard-2-ui-switch-options` in your Node-RED user directory and restart Node-RED.

## License

[Apache-2.0](LICENSE)
