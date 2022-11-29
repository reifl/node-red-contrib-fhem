module.exports = function (RED) {

    function input(config) {
       
        var send_count = 0;
        var send_count_stat = [];
        var connstate = "unknown";
        var intervalUpdate = false;

        RED.nodes.createNode(this, config);

        let fhem = RED.nodes.getNode(config.fheminstance);

        var node = this;

        function updateStatus() {
            send_count_stat.push(send_count);
            send_count = 0;
            if (send_count_stat.length > 6) {
                send_count_stat.shift();
            }
            const sum = send_count_stat.reduce((partial_sum, a) => partial_sum + a, 0);
            if (connstate == "connected") {
                node.status({ fill: "green", shape: "dot", text: parseInt((sum / send_count_stat.length) * 6) + " Msg/Min" });
            } else if (connstate == "disconnected") {
                node.status({ fill: "red", shape: "ring", text: parseInt((sum / send_count_stat.length) * 6) + " Msg/Min" });
            }
        }
        fhem.eventEmitter.on("connected", () => {
            //var nodeContext = this.context();
            //nodeContext.set("devicelist",fhem.devicelist);
            //this.context().set("devicelist",fhem.devicelist);
            connstate = "connected";
            this.status({ fill: "green", shape: "dot", text: "connected" });
        });
        fhem.eventEmitter.on("disconnected", () => {
            connstate = "disconnected";
            this.status({ fill: "red", shape: "ring", text: "disconnected" });
        });
        fhem.eventEmitter.on("devicelist_received", (list) => {
            this.send([null,{payload: list}]);
        });
        fhem.eventEmitter.on("data_received", (msg) => {
            //this.log( msg );

            if (config.filterDevice != "") {
                if (msg.device != config.filterDevice) return;
            }
            
            var i4 = msg.event.indexOf(': ');
            if (i4 > 0) {
                msg.reading = msg.event.substring(0, i4);
                if (msg.reading != null) {
                    if (config.filterReading != "") {
                        if (msg.reading != config.filterReading) return;
                    }
                }
                msg.value = msg.event.substring(i4 + 2);
            } else if (config.filterReading != "") {
                return;
            }

            msg.attributes = fhem.devicelist[msg.device]?.Attributes;
            msg.readings = fhem.devicelist[msg.device]?.Readings;
            msg.internals = fhem.devicelist[msg.device]?.Internals;
            msg.label = fhem.devicelist[msg.device]?.label;
            send_count++;
            this.send([msg,null]);
        });

        this.on('close', (removed, done) => {
            clearInterval(intervalUpdate)
            done(); //instant response that everything is fine
        });
        // Update Visible Node Status every 10 Seconds
        intervalUpdate = setInterval(updateStatus, 10000);
    }
            
    RED.nodes.registerType("fhem-in", input);


}