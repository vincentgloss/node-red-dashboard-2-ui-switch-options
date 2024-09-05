<template>
  <div class="option-switcher-wrapper">
    <h2>{{ props.label || '' }} </h2>

    <div class="option-switcher">
      <v-btn @click="switchOption('prev')" :disabled="options.length <= 1">
        <v-icon>mdi-{{ props.prevIcon }}</v-icon> <!-- Bind the icon name inside the slot -->
      </v-btn>
      <span class="current-option">{{ currentOptionValue || 'No option available' }}</span>
      <v-btn @click="switchOption('next')" :disabled="options.length <= 1">
        <v-icon>mdi-{{ props.nextIcon }}</v-icon> <!-- Bind the icon name inside the slot -->
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
    prevIcon: { type: String, default: '' },  // Default icon names
    nextIcon: { type: String, default: '' }
  },
  data() {
    return {
      currentOptionIndex: 0,
      options: Array.isArray(this.props.options) ? this.props.options : [],
    };
  },
  watch: {
    // Watch for changes in prevIcon and nextIcon to ensure reactivity
    prevIcon(newIcon) {
      console.log('Previous icon updated:', newIcon);
    },
    nextIcon(newIcon) {
      console.log('Next icon updated:', newIcon);
    }
  },
  computed: {
    currentOptionLabel() {
      return this.options && this.options.length > 0 ? this.options[this.currentOptionIndex].label : '';
    },
    currentOptionValue() {
      return this.options && this.options.length > 0 ? this.options[this.currentOptionIndex].value : 'No options';
    }
  },
  methods: {
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
    refreshOptions() {
      this.$socket.emit('widget-load', this.id);
    }
  },
  mounted() {
    if (!this.$socket) {
      console.error('Socket is null or undefined');
      return;
    }
    console.log('OptionSwitcher mounted with options:', this.options);
    console.log('Received label prop:', this.label); // Debugging line
    this.refreshOptions(); // Fetch initial options

    this.$socket.on('widget-load:' + this.id, (msg) => {
      if (msg && msg.payload) {
        const matchingOptionIndex = this.options.findIndex(opt => opt.value === msg.payload);
        if (matchingOptionIndex !== -1) {
          this.currentOptionIndex = matchingOptionIndex;
        } else {
          console.warn('Received payload does not match any option:', msg.payload);
        }
      }
    });
    this.$socket.emit('widget-load', this.id);
  },
  unmounted() {
    this.$socket.off('widget-load:' + this.id);
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
