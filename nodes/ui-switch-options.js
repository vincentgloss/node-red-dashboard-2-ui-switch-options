module.exports = function (RED) {
    function UISwitchOptionsNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        console.log('Node configuration:', config); // Debugging line
        const group = RED.nodes.getNode(config.group);
        const base = group.getBase();
        let currentOptionIndex = 0;

        // Options are already an array of objects
        const options = config.options || [];

        // Server-side event handlers
        const evts = {
            onAction: true,
            onInput: function (msg, send, done) {
                if (msg.payload) {
                    const matchingOptionIndex = options.findIndex(opt => opt.value === msg.payload);
                    if (matchingOptionIndex !== -1) {
                        currentOptionIndex = matchingOptionIndex;
                        base.stores.data.save(base, node, msg);
                    }
                }
        
                // Send the updated message to any connected nodes
                if (options[currentOptionIndex]) {
                    const payload = options[currentOptionIndex].value;
                    send({ payload });
                    console.log(`Output payload = ${payload}`);
                }
                done();
            },
            onSocket: {
                'switch-option': function (conn, id, selectedOptionValue) {
                    // Ensure this node processes only its own messages
                    if (id === node.id) {
                        const matchingOptionIndex = options.findIndex(opt => opt.value === selectedOptionValue);
                        if (matchingOptionIndex !== -1) {
                            currentOptionIndex = matchingOptionIndex; // Update the current option index
                            console.log(`Updated currentOptionIndex to: ${currentOptionIndex}`);
                        } else {
                            console.warn(`Invalid option value: ${selectedOptionValue}`);
                        }
        
                        const selectedOption = options[currentOptionIndex];
                        if (selectedOption) {
                            node.send({ payload: selectedOption.value }); // Send the correct option back
                            console.log(`Sending updated option value: ${selectedOption.value}`);
                        }
                    } else {
                        console.log(`Ignoring switch-option event for unrelated ID: ${id}`);
                    }
                }
            }
        };
        

        if (group) {
            group.register(node, config, evts);
        } else {
            node.error('No group configured');
        }
    }

    RED.nodes.registerType('switch options', UISwitchOptionsNode);
};
