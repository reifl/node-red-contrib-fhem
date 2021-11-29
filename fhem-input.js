module.exports = function (RED) {

    function input(config) {
        var node;
        var send_count = 0;
        var send_count_stat = [];
        RED.nodes.createNode(this, config);

        let fhem = RED.nodes.getNode(config.fheminstance);

        node = this;

        function updateStatus() {
            send_count_stat.push(send_count);
            send_count = 0;
            if (send_count_stat.length > 60) {
                send_count_stat.shift();
            }
            const sum = send_count_stat.reduce((partial_sum, a) => partial_sum + a, 0);
            node.status({ fill: "green", shape: "dot", text: "connected\n" + parseInt((sum / send_count_stat.length) * 60) + "/Min" });
        }
        fhem.eventEmitter.on("connected", () => {
            this.status({ fill: "green", shape: "dot", text: "connected" });
        });
        fhem.eventEmitter.on("disconnected", () => {
            this.status({ fill: "red", shape: "dot", text: "disconnected" });
        });
        fhem.eventEmitter.on("data_received", (data) => {
            //this.log( data );
            //this.status({ fill: "green", shape: "dot", text: "connected" });
            var data = data.toString().split("\n");
            for (var n = 0; n < data.length; n++) {
                if (data[n] !== "") {
                    var send = true;
                    var msg = { payload: data[n] }

                    var i0 = msg.payload.indexOf(' ');
                    var i1 = msg.payload.indexOf(' ', i0 + 1);
                    var i2 = msg.payload.indexOf(' ', i1 + 1);
                    var i3 = msg.payload.indexOf(' ', i2 + 1);

                    msg.timestamp = msg.payload.substring(0, i1);
                    msg.deviceType = msg.payload.substring(i1 + 1, i2);
                    msg.device = msg.payload.substring(i2 + 1, i3);

                    if (config.filterDevice != "") {
                        if (msg.device != config.filterDevice) {
                            send = false
                        }
                    }
                    msg.event = msg.payload.substring(i3 + 1);

                    var i4 = msg.event.indexOf(': ');

                    if (i4 > 0) {
                        msg.reading = msg.event.substring(0, i4);
                        if (msg.reading != null) {
                            if (config.filterReading != "") {
                                if (msg.reading != config.filterReading) {
                                    send = false
                                }
                            }
                        }
                        msg.value = msg.event.substring(i4 + 2);
                    } else if (config.filterReading != "") {
                        send = false;
                    }
                    if (send) {
                        send_count++;
                        this.send(msg);
                    }
                }
            }

        });
        setInterval(updateStatus, 1000);
    }
    RED.nodes.registerType("fhem-in", input);
}