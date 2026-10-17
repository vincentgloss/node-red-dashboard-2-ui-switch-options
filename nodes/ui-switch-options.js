module.exports = function (RED) {
    // Options are { label, value }. A missing label falls back to the value. Returns null if the list is invalid.
    function normalizeOptions (list) {
        if (!Array.isArray(list)) return null
        const result = []
        for (const item of list) {
            if (item === null || typeof item !== 'object' || item.value === undefined) return null
            const label = item.label === undefined || item.label === null || item.label === '' ? item.value : item.label
            result.push({ label: String(label), value: item.value })
        }
        return result
    }

    // Exact match first, then by text, so a number 1 also finds the option "1" from the editor.
    function findOption (options, value) {
        const exact = options.findIndex(option => option.value === value)
        if (exact !== -1 || value === null || typeof value === 'object') return exact
        return options.findIndex(option => option.value !== null && typeof option.value !== 'object' && String(option.value) === String(value))
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

        let options = normalizeOptions(config.options) || []
        let index = 0

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
                options
            }
        }

        // The stored snapshot is what the Dashboard sends to every client that (re)loads the widget.
        function save () {
            base.stores.data.clear(node.id)
            base.stores.data.save(base, node, snapshot())
        }

        function output (extra) {
            const { payload, label, index } = snapshot()
            return { ...extra, payload, label, index }
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

                let selected = false
                if (msg.payload !== undefined) {
                    const found = findOption(options, msg.payload)
                    if (found === -1) {
                        node.warn(RED._('ui-switch-options.errors.notFound', { value: String(msg.payload) }))
                    } else {
                        index = found
                        selected = true
                    }
                }

                save()
                // The Dashboard sends this msg to all clients after onInput, so it carries the full state.
                Object.assign(msg, snapshot())
                if (selected) send(output(msg.topic === undefined ? {} : { topic: msg.topic }))
            },

            // A click on previous or next in a dashboard
            onChange (msg, value, conn) {
                if (!value || typeof value !== 'object') return
                let found = Number.isInteger(value.index) && options[value.index] && options[value.index].value === value.value ? value.index : -1
                if (found === -1) found = findOption(options, value.value)
                if (found === -1) return

                index = found
                save()
                base.emit('widget-sync:' + node.id, snapshot(), node, [conn.id])
                node.send(output(base.includeClientData && msg?._client ? { _client: msg._client } : {}))
            }
        }

        save()
        group.register(node, config, evts)
    }

    RED.nodes.registerType('ui-switch-options', UISwitchOptionsNode)
}
