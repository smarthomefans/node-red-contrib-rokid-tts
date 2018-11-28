module.exports = function (RED) {
    var axios = require('axios');

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
            var text = config.data || msg.data
            axios({
                method: 'post',
                url: `https://homebase.rokid.com/trigger/with/${webhookId}`,
                headers: {
                    'Content-type': 'application/json; charset=utf-8'
                },
                data: { "type": "tts", "devices": { "sn": rokid_sn }, "data": { "text": text } }


            }).then(function (response) {
                var data = response.data
                msg.headers = response.headers
                msg.request = response.request
                if (!data.ok) {
                    throw new Error(JSON.stringify(data))
                }
                payload.status = 1
                payload.data = data
                msg.payload = payload
                node.send(msg)

            }).catch(function (error) {
                payload.status = 0
                payload.data = error.message
                msg.payload = payload
                msg['error'] = error
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