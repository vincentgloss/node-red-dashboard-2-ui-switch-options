<template>
    <!-- Newer Dashboard versions hide the widget themselves, older ones (1.23) need v-show -->
    <div v-show="state?.visible !== false" class="option-switcher-wrapper">
        <h2 v-if="props.label" v-html="props.label" />
        <div class="option-switcher">
            <v-btn :disabled="!canSwitch" :style="buttonStyle" aria-label="Previous option" @click="step(-1)">
                <v-icon :color="iconColor" :size="iconSize">{{ prevIcon }}</v-icon>
            </v-btn>
            <span class="current-option" aria-live="polite" v-html="currentLabel" />
            <v-btn :disabled="!canSwitch" :style="buttonStyle" aria-label="Next option" @click="step(1)">
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
            index: 0
        }
    },
    computed: {
        current () {
            return this.options[this.index]
        },
        currentLabel () {
            return this.current ? this.current.label : 'No option available'
        },
        canSwitch () {
            return this.state?.enabled !== false && this.options.length > 1
        },
        prevIcon () {
            return mdiIcon(this.props.prevIcon, 'chevron-double-left')
        },
        nextIcon () {
            return mdiIcon(this.props.nextIcon, 'chevron-double-right')
        },
        iconColor () {
            return this.props.iconColor || undefined
        },
        iconSize () {
            return this.props.iconSize || undefined
        },
        buttonStyle () {
            const color = this.props.buttonColor
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
        // Every message from the node carries the full state: options, index and payload.
        apply (msg) {
            if (!msg) return
            if (Array.isArray(msg.options)) this.options = msg.options
            if (Number.isInteger(msg.index)) {
                this.index = msg.index
            } else if (msg.payload !== undefined) {
                const found = this.options.findIndex(option => option.value === msg.payload)
                if (found !== -1) this.index = found
            }
            if (this.index >= this.options.length) this.index = 0
        },
        step (direction) {
            const count = this.options.length
            if (!this.canSwitch) return
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
