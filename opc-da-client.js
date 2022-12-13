const OPC = require('st-opc-da')

module.exports = function(RED) {
    function OpcClient(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        const opc = new OPC()

        opc.on('tag change', tag => {

            let msg = {payload: tag}
            node.send(msg)
        })

        node.on('input', function(msg) {
            
            if(msg.payload.cmd === 'list servers') {
                opc.getOPCServers().then(data => {
                    msg.payload = data;
                    node.send(msg)
                })
            }

            if(msg.payload.cmd === 'add item') {
                opc.addReadOPCTag(config.server, msg.payload.data.name)
            }

            if(msg.payload.cmd === 'start server') {
                opc.startReadServer(config.server, config.update)
            }

            if(msg.payload.cmd === 'get values') {
                msg.payload = opc.tags
                node.send(msg)
            }

        });
        
        node.on('close', () => {
            if(opc.servers[config.server]) {
                opc.servers[config.server].kill()
            }
        })

    }

    RED.nodes.registerType("opc-da-client",OpcClient);
}