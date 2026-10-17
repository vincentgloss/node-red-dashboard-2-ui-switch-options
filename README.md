# Switch Options – Option Switcher for FlowFuse Dashboard

A widget for [FlowFuse Dashboard 2.0](https://dashboard.flowfuse.com/), the dashboard for Node-RED, that steps through a list of options with **previous** and **next** buttons. Every switch sends the value of the selected option into your flow.

**English** | [Deutsch](README.de.md)

![A dashboard group with two option switchers: "Heating mode" showing "Comfort", and "Color" with transparent buttons showing "Red"](https://raw.githubusercontent.com/vincentgloss/node-red-dashboard-2-ui-switch-options/main/docs/dashboard-example.png)

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

A ready-made demo is included: **Import → Examples → @vincentgloss/node-red-dashboard-2-ui-switch-options → switch-options-demo**. It opens at `/switch-options-demo`.

## Configuration

| Field | Description |
|---|---|
| **Group**, **Size** | Where the widget appears and how much room it takes. |
| **Label** | Optional text above the widget. HTML is allowed. |
| **Options** | The list to step through. Each option has a label (shown, HTML allowed) and a value (sent). Without a label the value is shown. |
| **Prev icon**, **Next icon** | Name of a [Material Design icon](https://pictogrammers.com/library/mdi/) without the `mdi-` prefix, for example `chevron-left`. Default: `chevron-double-left` and `chevron-double-right`. |
| **Icon color**, **Button color** | Empty uses the theme. Otherwise a [color name](https://vuetifyjs.com/en/styles/colors/) like `red`, a value like `#AEEA00`, or `transparent` for a button without background and shadow. |
| **Icon size** | For example `24` or `24px`. Empty uses the default size. |

## Control from a flow

| Property | Effect |
|---|---|
| `msg.payload` | Selects the option with this value. A number also finds an option whose value is the same text, so `1` selects `"1"`. If nothing matches, the node shows a warning and nothing changes. |
| `msg.options` | Replaces the options, for example `[{"label":"Off","value":"off"},{"label":"On","value":"on"}]`. The current option stays selected if it is still in the list, otherwise the first one. |
| `msg.enabled` | `false` disables the buttons, `true` enables them again. |
| `msg.visible` | `false` hides the widget, `true` shows it again. |
| `msg.class` | Adds CSS classes to the widget. |

`msg.options` and `msg.payload` can be sent together. All open dashboards always show the same option. After a redeploy the widget starts with the options from the editor again and keeps the selected option if it is still one of them.

## Output

A message is sent when somebody switches in a dashboard and when an input message selects an option:

```json
{ "payload": "comfort", "label": "Comfort", "index": 2 }
```

| Property | Content |
|---|---|
| `payload` | The value of the selected option. |
| `label` | The label of the selected option. |
| `index` | The position of the selected option, starting at 0. |
| `topic` | Taken from the input message, if it had one. |
| `_client` | Which dashboard client switched, if *Include client data* is enabled in the Dashboard settings. |

## Upgrading from 1.0

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
