module.exports = function (RED) {
    // Settings that msg.ui_update can change at runtime
    const APPEARANCE = ['label', 'prevIcon', 'nextIcon', 'iconColor', 'iconSize', 'buttonColor']

    function isObject (value) {
        return value !== null && typeof value === 'object'
    }

    function text (value) {
        return isObject(value) ? JSON.stringify(value) : String(value)
    }

    // Options are { label, value }. Accepted: objects with value and/or label, or plain strings, numbers and booleans.
    // Returns null if the list is invalid.
    function normalizeOptions (list) {
        if (!Array.isArray(list)) return null
        const result = []
        for (const item of list) {
            if (['string', 'number', 'boolean'].includes(typeof item)) {
                result.push({ label: String(item), value: item })
            } else if (isObject(item) && !Array.isArray(item) && (item.value !== undefined || item.label !== undefined)) {
                const value = item.value !== undefined ? item.value : item.label
                const label = item.label === undefined || item.label === null || item.label === '' ? text(value) : String(item.label)
                result.push({ label, value })
            } else {
                return null
            }
        }
        return result
    }

    // Editor options store the value as text plus its type
    function configValue (option) {
        const value = option.value
        switch (option.valueType) {
            case 'num': {
                const number = Number(value)
                if (value === '' || Number.isNaN(number)) throw new Error(`"${value}" is not a number`)
                return number
            }
            case 'bool':
                return value === true || value === 'true'
            case 'json':
                return JSON.parse(value)
            default:
                return value
        }
    }

    function same (a, b) {
        if (isObject(a) || isObject(b)) return isObject(a) && isObject(b) && JSON.stringify(a) === JSON.stringify(b)
        return a === b
    }

    // Exact match first, then by text, so a number 1 also finds the option "1".
    function findOption (options, value) {
        const exact = options.findIndex(option => same(option.value, value))
        if (exact !== -1 || value === null || isObject(value)) return exact
        return options.findIndex(option => option.value !== null && !isObject(option.value) && String(option.value) === String(value))
    }

    // The Dashboard turns errors of type "warn" into a node warning and does not pass the message on to the widget.
    function warning (message) {
        const error = new Error(message)
        error.type = 'warn'
        return error
    }

    function UISwitchOptionsNode (config) {
        RED.nodes.createNode(this, config)
        const node = this

        const group = RED.nodes.getNode(config.group)
        if (!group) {
            node.error(RED._('ui-switch-options.errors.noGroup'))
            return
        }
        const base = group.getBase()

        // Nodes from version 1.0 have no passthru setting and always passed input selections on.
        const passthru = config.passthru === undefined ? true : config.passthru === true
        const wrap = config.wrap !== false

        const configured = []
        for (const option of Array.isArray(config.options) ? config.options : []) {
            try {
                const value = configValue(option)
                configured.push({ label: option.label === undefined || option.label === '' ? text(value) : String(option.label), value })
            } catch (error) {
                node.error(RED._('ui-switch-options.errors.invalidValue', { label: option.label, error: error.message }))
            }
        }

        let options = configured
        let index = 0
        let appearance = {}

        // After a redeploy, keep the last selection if it is still one of the configured options.
        const previous = base.stores.data.get(node.id)
        if (previous && previous.payload !== undefined) {
            index = Math.max(findOption(options, previous.payload), 0)
        }

        function snapshot () {
            const option = options[index]
            return {
                payload: option ? option.value : null,
                label: option ? option.label : '',
                index: option ? index : -1,
                options,
                appearance
            }
        }

        // The stored snapshot is what the Dashboard sends to every client that (re)loads the widget.
        // (Not under ui_update: the Dashboard strips that from stored messages.)
        function save () {
            base.stores.data.clear(node.id)
            base.stores.data.save(base, node, snapshot())
        }

        function output (extra) {
            const { payload, label, index } = snapshot()
            return { ...extra, payload, label, index }
        }

        // Moves by count steps. Without wrap it stops at the first and last option.
        function stepFrom (from, count) {
            const total = options.length
            return wrap ? ((from + count) % total + total) % total : Math.min(Math.max(from + count, 0), total - 1)
        }

        function applyAppearance (update) {
            if (!isObject(update) || Array.isArray(update)) throw warning(RED._('ui-switch-options.errors.invalidUiUpdate'))
            const next = { ...appearance }
            for (const [key, value] of Object.entries(update)) {
                if (key === 'class') continue // handled by the Dashboard
                if (!APPEARANCE.includes(key)) {
                    node.warn(RED._('ui-switch-options.errors.unknownUiUpdate', { key, keys: APPEARANCE.join(', ') }))
                } else if (value === null) {
                    delete next[key]
                } else if (typeof value === 'string' || typeof value === 'number') {
                    next[key] = String(value)
                } else {
                    node.warn(RED._('ui-switch-options.errors.invalidUiUpdateValue', { key }))
                }
            }
            appearance = next
        }

        // Selects by msg.index, msg.step or msg.payload, in this order. Returns true if an option was selected.
        function select (msg) {
            if (msg.index !== undefined) {
                if (!Number.isInteger(msg.index) || msg.index < 0 || msg.index >= options.length) {
                    node.warn(RED._('ui-switch-options.errors.invalidIndex', { index: JSON.stringify(msg.index), count: options.length }))
                    return false
                }
                index = msg.index
                return true
            }
            if (msg.step !== undefined) {
                if (!Number.isInteger(msg.step)) {
                    node.warn(RED._('ui-switch-options.errors.invalidStep', { step: JSON.stringify(msg.step) }))
                    return false
                }
                if (!options.length) return false
                const next = stepFrom(index, msg.step)
                const moved = next !== index
                index = next
                return moved
            }
            if (msg.payload !== undefined) {
                const found = findOption(options, msg.payload)
                if (found === -1) {
                    node.warn(RED._('ui-switch-options.errors.notFound', { value: JSON.stringify(msg.payload) }))
                    return false
                }
                index = found
                return true
            }
            return false
        }

        const evts = {
            onInput (msg, send) {
                if (Object.hasOwn(msg, 'options')) {
                    const next = normalizeOptions(msg.options)
                    if (!next) throw warning(RED._('ui-switch-options.errors.invalidOptions'))
                    const current = options[index]
                    options = next
                    const kept = current ? findOption(options, current.value) : -1
                    index = kept === -1 ? 0 : kept
                }
                if (msg.ui_update !== undefined) applyAppearance(msg.ui_update)

                const selected = select(msg)

                save()
                // The Dashboard sends this msg to all clients after onInput, so it carries the full state.
                Object.assign(msg, snapshot())
                if (selected && passthru) send(output(msg.topic === undefined ? {} : { topic: msg.topic }))
            },

            // A click on previous or next in a dashboard
            onChange (msg, value, conn) {
                if (!isObject(value)) return
                let found = Number.isInteger(value.index) && options[value.index] && same(options[value.index].value, value.value) ? value.index : -1
                if (found === -1) found = findOption(options, value.value)
                if (found === -1) return

                index = found
                save()
                base.emit('widget-sync:' + node.id, snapshot(), node, [conn.id])
                node.send(output(base.includeClientData && msg?._client ? { _client: msg._client } : {}))
            }
        }

        save()
        // The widget gets the converted options, so typed values are right before the first load.
        group.register(node, { ...config, options: configured, wrap }, evts)
    }

    RED.nodes.registerType('ui-switch-options', UISwitchOptionsNode)
}
