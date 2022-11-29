module.exports = function (RED) {

    function cmd(config) {
        var node;
        var send_count = 0;
        var send_count_stat = [];
        var connstate = "unknown";

        RED.nodes.createNode(this, config);

        let fhem = RED.nodes.getNode(config.fheminstance);

        node = this;

        function updateStatus() {
            send_count_stat.push(send_count);
            send_count = 0;
            if (send_count_stat.length > 6) {
                send_count_stat.shift();
            }
            const sum = send_count_stat.reduce((partial_sum, a) => partial_sum + a, 0);
            if (connstate == "connected") {
                node.status({ fill: "green", shape: "dot", text: "connected\n" + parseInt((sum / send_count_stat.length) * 6) + "/Min" });
            } else if (connstate == "disconnected") {
                node.status({ fill: "red", shape: "dot", text: "disconnected\n" + parseInt((sum / send_count_stat.length) * 6) + "/Min" });
            }
        }
        node.on('input', function (msg) {
            //this.log(msg.cmd);
            if ( !msg.cmd ) {
                node.status({ fill: "red", shape: "ring", text: "cmd property empty" });
            }
            fhem.eventEmitter.emit("cmd_data_send", {"source": node.id, "cmd": msg.cmd});
        });
        fhem.eventEmitter.on("cmd_data_response", (response) => {
            if ( response.source==node.id ) {
                delete response.source;
                this.send([response]);
            }
        });
        fhem.eventEmitter.on("cmd_connected", () => {
            //var nodeContext = this.context();
            //nodeContext.set("devicelist",fhem.devicelist);
            //this.context().set("devicelist",fhem.devicelist);
            connstate = "connected";
            this.status({ fill: "green", shape: "dot", text: "connected" });
        });
        fhem.eventEmitter.on("cmd_disconnected", () => {
            connstate = "disconnected";
            this.status({ fill: "red", shape: "dot", text: "disconnected" });
        });
        fhem.eventEmitter.on("cmd_data_received", (data) => {
            this.log( data );
            //this.status({ fill: "green", shape: "dot", text: "connected" });
            var msg = { payload: data }
            send_count++;
            this.send(msg);
        });

        setInterval(updateStatus, 10000);
    }
            
    RED.nodes.registerType("fhem-cmd", cmd);


}