<template>
  <div class="option-switcher-wrapper">
    <h2 v-html="props.label || ''"></h2>
    <div class="option-switcher">
      <v-btn @click="switchOption('prev')" :disabled="options.length <= 1" :style="buttonStyle(props.buttonColor)">
        <v-icon :color="props.iconColor" :size="props.iconSize">{{ 'mdi-' + props.prevIcon }}</v-icon>
      </v-btn>
      <span class="current-option" v-html="currentOptionLabel"></span>
      <v-btn @click="switchOption('next')" :disabled="options.length <= 1" :style="buttonStyle(props.buttonColor)">
        <v-icon :color="props.iconColor" :size="props.iconSize">{{ 'mdi-' + props.nextIcon }}</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UISwitchOptions',
  inject: ['$socket'],
  props: {
    id: { type: String, required: true },
    props: { type: Object, default: () => ({}) },
    state: { type: Object, default: () => ({ enabled: false, visible: false }) },
    label: { type: String, default: '' },
    prevIcon: { type: String, default: 'chevron-double-left' },
    nextIcon: { type: String, default: 'chevron-double-right' },
    iconColor: { type: String, default: 'white' },
    iconSize: { type: String, default: undefined },
    buttonColor: { type: String, default: '' }
  },
  data() {
    return {
      currentOptionIndex: 0,
      options: Array.isArray(this.props.options) ? this.props.options : [],
    };
  },
  watch: {
    label(newVal) {
      this.currentOptionLabel = newVal;
    },
    options(newOptions) {
      // Update currentOptionIndex if options change
      if (newOptions.length > 0 && this.currentOptionIndex >= newOptions.length) {
        this.currentOptionIndex = newOptions.length - 1;
      }
    },
    currentOptionLabel(newLabel) {
      // Ensure label is updated
      if (this.options.length > 0 && this.options[this.currentOptionIndex]) {
        this.currentOptionLabel = this.options[this.currentOptionIndex].label || 'No option available';
      }
    },
  },
  computed: {
    currentOptionLabel() {
      return this.options.length > 0 && this.options[this.currentOptionIndex]
        ? this.options[this.currentOptionIndex].label
        : 'No option available';
    },
    currentOptionValue() {
      return this.options.length > 0 ? this.options[this.currentOptionIndex].value : 'No options';
    },
    buttonStyle() {
      return (color) => {
        const effectiveColor = color === '' ? undefined : color; // Treat empty string as undefined
        return {
          'box-shadow': effectiveColor === 'transparent' ? 'none' : '',
          'background-color': effectiveColor || 'undefined' // Fallback to 'inherit' if color is undefined or empty
        };
      };
    }
  },
  methods: {

    sendNewOptions(newOptions) {
    // Send the new options array to the backend
    this.$socket.emit('new-options', { id: this.id, options: newOptions });
  },
  switchOption(direction) {
    const previousOptionIndex = this.currentOptionIndex;

    if (direction === 'next') {
      this.currentOptionIndex = (this.currentOptionIndex + 1) % this.options.length;
    } else if (direction === 'prev') {
      this.currentOptionIndex = (this.currentOptionIndex - 1 + this.options.length) % this.options.length;
    }

    if (this.currentOptionIndex !== previousOptionIndex) {
      this.$socket.emit('switch-option', this.id, this.currentOptionValue);
      console.log(`Switched to new option: ${this.currentOptionValue}`);
    }
  },
  updateFromBackend(data) {
  console.log('Updating from backend:', data);
  
  // Check if data contains an options array and ensure reactivity
  if (data.options && Array.isArray(data.options)) {
    this.options = [...data.options];
  }

  // If payload exists, check if any option matches the value in payload
  if (data.payload) {
    const optionIndex = this.options.findIndex(option => option.value === data.payload);
    if (optionIndex !== -1) {
      this.currentOptionIndex = optionIndex; // Update the index to the found option
      console.log(`Option updated to: ${this.options[optionIndex].label}`);
    } else {
      console.warn('Option not found in options array');
    }
  }
  
  // Manually trigger label update if necessary
  this.$forceUpdate(); // Consider if this is needed; may not be necessary
},
  refreshOptions() {
    this.$socket.emit('widget-load', this.id);
  }
},

mounted() {
  if (!this.$socket) {
    console.error('Socket connection is not available.');
    return;
  }
  
  // Subscribe to the widget-load event for this widget's ID
  this.$socket.on(`widget-load:${this.id}`, (msg) => {

    if (msg) {
      // Load currentOptionIndex if available
      if (msg.currentOptionIndex !== undefined) {
        this.currentOptionIndex = msg.currentOptionIndex;
        console.log(`Loaded currentOptionIndex from backend: ${this.currentOptionIndex}`);
      }

      // Load options if they are provided in the message
      if (Array.isArray(msg.options)) {
        this.options = msg.options;
        console.log('Loaded options from backend:', this.options);
      }
    }
  });

  this.refreshOptions(); // Fetch initial options
  console.log(`Subscribing to socket with event id: msg-input:${this.id}`);
  
  // Adjust the subscription to include the 'msg-input:' prefix
  this.$socket.on(`msg-input:${this.id}`, (msg) => {
    console.log('Received message in Vue:', msg);

    if (msg && msg.payload) {
      this.updateFromBackend(msg);
    }
    
    // If new options are provided in the message, update them
    if (msg && Array.isArray(msg.options)) {
      this.updateFromBackend(msg); // Update any other necessary state
      this.sendNewOptions(msg.options); // Update options
    }
  });
},


  beforeUnmount() {
    if (this.$socket) {
      this.$socket.off(this.id);
    }
  },
  unmounted () {
        // unsubscribe from the event when the widget is destroyed
        this.$socket.off('widget-load:' + this.id)
    
    }
};
</script>

<style scoped>
.option-switcher-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.option-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.current-option {
  font-size: 1.5em;
  margin: 0 20px;
}
</style>
