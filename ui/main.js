/**
 * Used only for development (via `npm run dev`).
 *
 * This file is useful for testing your component in isolation from Node-RED.
 */
import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import 'vuetify/styles'; // Import Vuetify styles

import UISwitchOptions from './components/UISwitchOptions.vue';

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});

createApp(UISwitchOptions)
  .use(vuetify) // Use Vuetify plugin
  .mount('#app');
