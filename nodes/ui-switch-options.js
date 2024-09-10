module.exports = function (RED) {
    function UISwitchOptionsNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const group = RED.nodes.getNode(config.group);
        const base = group.getBase();
        let currentOptionIndex = 0;
        let options = config.options || []; // Default to config options if available

        function updateFrontend(optionIndex) {
            console.log('Calling updateFrontend:', optionIndex);
            const msg = {
                payload: options[optionIndex]?.value || null,
                topic: "ui-switch-options-update",
                options: options, // Send options to the frontend
                currentIndex: optionIndex
            };
            console.log('Sending message:', msg);
            node.send(msg);
        }

        const evts = {
            onAction: true,
            onInput: function (msg, send, done) {
                let storedData = base.stores.data.get(node.id) || {};
                console.log('Received input message:', msg);
                
                // Handle updating options array
                if (msg.options && Array.isArray(msg.options)) {
                    options = msg.options; // Update local options array
                    storedData.options ??= {}    // initialise if necessary
                    //storedData.options = options;
                    storedData.options = {...storedData.options, ...msg.options}
                    base.stores.data.save(base, node, storedData); // Save new options
                    console.log('Updated and saved new options array:', options);
                }
                    
                if (typeof msg.payload !== 'undefined') {
                    var matchingOptionIndex = options.findIndex(opt => opt.value === msg.payload);
                    if (matchingOptionIndex !== -1) {
                      console.log('Calling updateFrontend with index:', matchingOptionIndex);
                      try {
                        updateFrontend(matchingOptionIndex);
                        storedData.currentOptionIndex = matchingOptionIndex;
                        base.stores.data.save(base, node, { currentOptionIndex: storedData.currentOptionIndex });
                      } catch (error) {
                        console.error('Error calling updateFrontend:', error);
                      }
                      console.log('updateFrontend should have been called');
                    } else {
                      // Emit a warning message to the Vue component
                      node.send({ payload: 'Option not found in options array', topic: 'error' });
                    }
                  }
            },
            onSocket: {
                'widget-load': function (conn, id) {
                    if (id === node.id) {
                        let storedData = base.stores.data.get(node.id) || {};
                        const currentOptionIndex = storedData.currentOptionIndex || 0;
                        const options = storedData.options || config.options || []; // Retrieve saved options
                        
                        // Send the saved index and options array to the client
                        conn.emit(`widget-load:${id}`, { currentOptionIndex, options });
                        console.log(`Sent currentOptionIndex and options to widget:`, currentOptionIndex, options);
                    }
                },
                'switch-option': function (conn, id, selectedOptionValue) {
                    if (id === node.id) {
                        const matchingOptionIndex = options.findIndex(opt => opt.value === selectedOptionValue);
                        if (matchingOptionIndex !== -1) {
                            currentOptionIndex = matchingOptionIndex;
                            let storedData = base.stores.data.get(node.id) || {};
                            storedData.currentOptionIndex = currentOptionIndex;
                            base.stores.data.save(base, node, storedData); // Save current index

                            const selectedOption = options[currentOptionIndex];
                            if (selectedOption) {
                                node.send({
                                    payload: selectedOption.value,
                                    label: selectedOption.label
                                });
                                console.log(`Sending updated option value: ${selectedOption.value}`);
                            }
                        }
                    }
                },
                'new-options': function (conn, { id, options }) {
                    if (id === node.id && Array.isArray(options)) {
                        // Update and save the new options array
                        let storedData = base.stores.data.get(node.id) || {};
                        storedData.options ??= {}    // initialise if necessary
                        //storedData.options = options;
                        storedData.options = {...storedData.options, ...options}
                        base.stores.data.save(base, node, storedData);
                        console.log(`Updated options from frontend: ${options}`);
                        
                        // Optionally send updated options to the frontend
                        conn.emit(`widget-load:${id}`, { currentOptionIndex: storedData.currentOptionIndex, options });
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

    RED.nodes.registerType('ui-switch-options', UISwitchOptionsNode);
};
