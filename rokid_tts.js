module.exports = function (RED) {
    var axios = require('axios');
    var mustache = require("mustache");

    function rokidTTSNode(config) {
        RED.nodes.createNode(this, config);

        // Retrieve the config node
        this.server = RED.nodes.getNode(config.server);
        var node = this;
        if (this.server) {

        } else {
            node.error("没有配置正确的rokid tts server");
            return
        }
        let rokid_sn = this.server.sn
        let webhookId = this.server.webhookId
        

        node.on('input', function (msg) {

            var payload = {}
            let nodeData = config.data;
            let nodeAction = config.action;
            var isTemplatedData = (nodeData||"").indexOf("{{") != -1;

            var data = nodeData || msg.data;
            var action = nodeAction || msg.action;
            if (msg.data && nodeData && (nodeData !== msg.data)) {  // revert change below when warning is finally removed
                node.warn(RED._("common.errors.nooverride"));
            }

            if (isTemplatedData) {
                data = mustache.render(nodeData,msg);
            }

            if (!data) {
                node.error(RED._("没有tts数据"),msg);
                return;
            }

            if (!action) {
                node.error(RED._("msg.type is undefine"),msg);
                return;
            }
            var type = 'text'
            if (action == 'audio') {
                type = 'url'
            }

            var text = data
            axios({
                method: 'post',
                url: `https://homebase.rokid.com/trigger/with/${webhookId}`,
                headers: {
                    'Content-type': 'application/json; charset=utf-8'
                },
                data: { "type": action, "devices": { "sn": rokid_sn }, "data": { type : text } }


            }).then(function (response) {
                var data = response.data
                msg.headers = response.headers
                msg.request = response.request
                if (!data.ok) {
                    throw new Error(JSON.stringify(data))
                }
                payload.status = 1
                msg.payload = payload
                node.send(msg)

            }).catch(function (error) {
                payload.status = 0
                payload.data = error.message
                msg.payload = payload
                node.send(msg)
            })
        });

    }
    RED.nodes.registerType("rokid-tts", rokidTTSNode);


    function RemoteServerNode(n) {
        RED.nodes.createNode(this, n);
        this.name = n.name;
        this.sn = n.sn;
        this.webhookId = n.webhookId;
    }
    RED.nodes.registerType("rokid-tts-server", RemoteServerNode);

}