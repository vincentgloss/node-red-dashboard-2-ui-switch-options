# A simple widget to switch between options

This repository contains the ui-switch-options node for the flowfuse [Node-RED Dashboard 2.0](https://github.com/FlowFuse/flowforge-nr-dashboard). 

It allows you to create a widget that lets users switch between different options using "Previous" and "Next" buttons. It's designed to provide a simple way to navigate through a list of options and return the selected value

The usual method of installing is to use Manage Palette in the Node-RED editor and search for @vincentgloss/node-red-dashboard-2-ui-switch-options and install it.

Using `npm` directly, `cd` into your node red user directory (usually .node-red in your home folder) and from there run
```
npm install @vincentgloss/node-red-dashboard-2-ui-switch-options
```

### Inputs

- **payload** (string): A valid value of the option to be selected. This is also emitted whenever an option is switched.

### Configuration

- **Name**: The name of the node, which helps identify it in the Node-RED editor.
- **Group**: The display group in which the widget will be shown on the dashboard.
- **Size**: The dimensions of the widget. This will automatically adjust based on the group configuration.
- **Options**: A list of options for the widget. Each option should have a `label` (accepts plain html) and a `value`. These are the options users can switch between.
- **Label**: A text label (optional, accepts plain html) that appears above the widget on the dashboard.
- **Prev Icon**: If provided, this [Material Design icon](https://pictogrammers.com/library/mdi/) will replace the default **prev** icon. No need to include the `mdi` prefix.
- **Next Icon**: If provided, this [Material Design icon](https://pictogrammers.com/library/mdi/) will replace the default **next** icon. No need to include the `mdi` prefix.
- **Icon Color**: The color of the **prev** and **next** icons. The colors may be recognized names such as "red" or "skyblue," or may be numerically specified, e.g., `#AEEA00`. The set of named colors can be found [here](https://vuetifyjs.com/en/styles/colors/).
- **Icon Size**: The size of the **prev** and **next** icons. The size may be numerically specified in `px`.
- **Button Color**: The color of the **prev** and **next** buttons. The colors may be recognized names such as "red" or "skyblue," or may be numerically specified, e.g., `#AEEA00`. The set of named colors can be found [here](https://vuetifyjs.com/en/styles/colors/).
