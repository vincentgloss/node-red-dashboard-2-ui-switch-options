<template>
    <!-- Newer Dashboard versions hide the widget themselves, older ones (1.23) need v-show -->
    <div v-show="state?.visible !== false" class="option-switcher-wrapper">
        <h2 v-if="settings.label" v-html="settings.label" />
        <div class="option-switcher" :class="'layout-' + layout">
            <v-btn :disabled="!canPrev" :style="buttonStyle" aria-label="Previous option" @click="step(-1)">
                <v-icon :color="iconColor" :size="iconSize">{{ prevIcon }}</v-icon>
            </v-btn>
            <!-- All labels lie on top of each other, so the box is as wide and high as the largest one
                 and the buttons do not move when the option changes. Only the current one is visible. -->
            <div ref="labels" class="current-option" :class="'overflow-' + overflow" :title="fullText || undefined" aria-live="polite">
                <span v-for="(option, i) in options" :key="i" class="option-label" :class="{ active: i === index }" v-html="option.label" />
                <span v-if="!options.length" class="option-label active">No option available</span>
            </div>
            <v-btn :disabled="!canNext" :style="buttonStyle" aria-label="Next option" @click="step(1)">
                <v-icon :color="iconColor" :size="iconSize">{{ nextIcon }}</v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script>
// Smallest font size for "shrink", in px
const MIN_FONT = 14

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

// Plain numbers are pixels
function cssSize (value) {
    if (value === undefined || value === null || String(value).trim() === '') return undefined
    const text = String(value).trim()
    return /^\d+(\.\d+)?$/.test(text) ? text + 'px' : text
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
            appearance: {},
            // Text of the current option if it is cut off, shown as tooltip
            fullText: ''
        }
    },
    computed: {
        settings () {
            return { ...this.props, ...this.appearance }
        },
        current () {
            return this.options[this.index]
        },
        wrap () {
            return this.props.wrap !== false
        },
        layout () {
            return this.props.layout === 'edges' ? 'edges' : 'center'
        },
        overflow () {
            return ['shrink', 'ellipsis'].includes(this.props.overflow) ? this.props.overflow : 'wrap'
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
            const style = {}
            const color = this.settings.buttonColor
            if (color === 'transparent') Object.assign(style, { 'background-color': 'transparent', 'box-shadow': 'none' })
            else if (color) style['background-color'] = color
            const radius = cssSize(this.settings.buttonRadius)
            if (radius) style['border-radius'] = radius
            return style
        }
    },
    watch: {
        options () {
            this.$nextTick(this.fit)
        },
        // Icon size or radius can change the room left for the text
        appearance () {
            this.$nextTick(this.fit)
        },
        index () {
            this.$nextTick(this.updateFullText)
        }
    },
    created () {
        // Subscribes to msg-input, widget-load and widget-sync, handles enabled/visible/class
        // and unsubscribes again when the widget is removed.
        this.$dataTracker(this.id, this.apply, this.apply, null, this.apply)
    },
    mounted () {
        // Fit again when the widget gets another width (window, group, hidden and shown again).
        // Deferred to the next frame, so the font change does not resize inside the observer callback.
        let width = -1
        this.resizeObserver = new ResizeObserver(entries => {
            const next = Math.round(entries[0].contentRect.width)
            if (next === width) return
            width = next
            cancelAnimationFrame(this.frame)
            this.frame = requestAnimationFrame(this.fit)
        })
        this.resizeObserver.observe(this.$el)
        if (document.fonts?.ready) document.fonts.ready.then(() => this.fit())
        this.fit()
    },
    beforeUnmount () {
        if (this.resizeObserver) this.resizeObserver.disconnect()
        cancelAnimationFrame(this.frame)
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
        },
        // "shrink": one font size for all options (so it does not jump when switching), as large as possible
        // while every label fits on one line, but not below MIN_FONT. Longer labels then wrap like "wrap".
        fit () {
            const box = this.$refs.labels
            if (!box) return
            box.style.fontSize = ''
            if (this.overflow === 'shrink' && box.clientWidth > 0) {
                const labels = [...box.children]
                box.classList.add('measuring')
                let size = parseFloat(getComputedStyle(box).fontSize)
                while (size > MIN_FONT && labels.some(label => label.scrollWidth > label.clientWidth + 1)) {
                    size = Math.max(size - 1, MIN_FONT)
                    box.style.fontSize = size + 'px'
                }
                box.classList.remove('measuring')
            }
            this.updateFullText()
        },
        updateFullText () {
            const label = this.$refs.labels?.querySelector('.option-label.active')
            const cut = label && (label.scrollHeight > label.clientHeight + 1 || label.scrollWidth > label.clientWidth + 1)
            this.fullText = cut ? label.textContent.trim() : ''
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
    max-width: 100%;
    margin-top: 20px;
}

.option-switcher.layout-edges {
    width: 100%;
    justify-content: space-between;
}

.option-switcher > .v-btn {
    flex-shrink: 0;
}

.current-option {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    flex: 0 1 auto;
    min-width: 0;
    margin: 0 20px;
    font-size: 1.5em;
    text-align: center;
}

.layout-edges .current-option {
    flex: 1 1 auto;
}

.option-label {
    grid-area: 1 / 1;
    align-self: center;
    min-width: 0;
    overflow-wrap: break-word;
    visibility: hidden;
}

.option-label.active {
    visibility: visible;
}

/* At most two lines, then "…" */
.overflow-wrap .option-label,
.overflow-shrink .option-label {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
}

/* One line, then "…" (also used while measuring for "shrink") */
.overflow-ellipsis .option-label,
.current-option.measuring .option-label {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>
