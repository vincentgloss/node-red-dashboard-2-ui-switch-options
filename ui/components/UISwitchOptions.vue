<template>
    <!-- Newer Dashboard versions hide the widget themselves, older ones (1.23) need v-show -->
    <div v-show="state?.visible !== false" class="option-switcher-wrapper">
        <h2 v-if="settings.label" v-html="settings.label" />
        <div class="option-switcher">
            <v-btn :disabled="!canPrev" :style="buttonStyle" aria-label="Previous option" @click="step(-1)">
                <v-icon :color="iconColor" :size="iconSize">{{ prevIcon }}</v-icon>
            </v-btn>
            <span class="current-option" aria-live="polite" v-html="currentLabel" />
            <v-btn :disabled="!canNext" :style="buttonStyle" aria-label="Next option" @click="step(1)">
                <v-icon :color="iconColor" :size="iconSize">{{ nextIcon }}</v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script>
// Icon names are entered without the "mdi-" prefix, but a prefix typed anyway is accepted too.
function mdiIcon (name, fallback) {
    const icon = typeof name === 'string' ? name.trim().replace(/^mdi-/, '') : ''
    return 'mdi-' + (icon || fallback)
}

// Dark icons on light hex colors, white ones on dark colors. Same rule as the editor preview.
function contrastColor (color) {
    const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(typeof color === 'string' ? color.trim() : '')
    if (!match) return undefined
    const hex = match[1].length === 3 ? match[1].replace(/./g, '$&$&') : match[1]
    const [r, g, b] = [0, 2, 4].map(i => {
        const c = parseInt(hex.slice(i, i + 2), 16) / 255
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179 ? '#0f172a' : '#ffffff'
}

export default {
    name: 'UISwitchOptions',
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({ enabled: true, visible: true }) }
    },
    data () {
        return {
            options: Array.isArray(this.props.options) ? this.props.options : [],
            index: 0,
            // Overrides from msg.ui_update
            appearance: {}
        }
    },
    computed: {
        settings () {
            return { ...this.props, ...this.appearance }
        },
        current () {
            return this.options[this.index]
        },
        currentLabel () {
            return this.current ? this.current.label : 'No option available'
        },
        wrap () {
            return this.props.wrap !== false
        },
        canSwitch () {
            return this.state?.enabled !== false && this.options.length > 1
        },
        canPrev () {
            return this.canSwitch && (this.wrap || this.index > 0)
        },
        canNext () {
            return this.canSwitch && (this.wrap || this.index < this.options.length - 1)
        },
        prevIcon () {
            return mdiIcon(this.settings.prevIcon, 'chevron-double-left')
        },
        nextIcon () {
            return mdiIcon(this.settings.nextIcon, 'chevron-double-right')
        },
        // Without an own icon color: theme color on transparent buttons (white would be invisible there),
        // otherwise a readable color on hex button colors, otherwise the button's own text color.
        iconColor () {
            if (this.settings.iconColor) return this.settings.iconColor
            const button = this.settings.buttonColor
            if (button === 'transparent') return 'primary'
            return contrastColor(button)
        },
        // Plain numbers are pixels; Vuetify adds the unit.
        iconSize () {
            const size = this.settings.iconSize
            if (size === undefined || size === null || size === '') return undefined
            return /^\d+(\.\d+)?$/.test(String(size).trim()) ? Number(size) : size
        },
        buttonStyle () {
            const color = this.settings.buttonColor
            if (!color) return {}
            return color === 'transparent'
                ? { 'background-color': 'transparent', 'box-shadow': 'none' }
                : { 'background-color': color }
        }
    },
    created () {
        // Subscribes to msg-input, widget-load and widget-sync, handles enabled/visible/class
        // and unsubscribes again when the widget is removed.
        this.$dataTracker(this.id, this.apply, this.apply, null, this.apply)
    },
    methods: {
        // Every message from the node carries the full state: options, index, payload and appearance.
        apply (msg) {
            if (!msg) return
            if (Array.isArray(msg.options)) this.options = msg.options
            if (msg.appearance && typeof msg.appearance === 'object') this.appearance = msg.appearance
            if (Number.isInteger(msg.index)) {
                this.index = msg.index
            } else if (msg.payload !== undefined) {
                const found = this.options.findIndex(option => option.value === msg.payload)
                if (found !== -1) this.index = found
            }
            if (this.index >= this.options.length) this.index = 0
        },
        step (direction) {
            if (!(direction < 0 ? this.canPrev : this.canNext)) return
            const count = this.options.length
            this.index = (this.index + direction + count) % count
            this.$socket.emit('widget-change', this.id, { index: this.index, value: this.current.value })
        }
    }
}
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
