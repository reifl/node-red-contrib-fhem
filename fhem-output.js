module.exports = function (RED) {
    function output(config) {
        RED.nodes.createNode(this, config);

        let fhem = RED.nodes.getNode(config.fheminstance);
        var node = this;
        var last_cmd = "";
        var last_activity = null;
        var connstate = "unknown";

        function updateStatus() {
            if (connstate == "connected") {
                node.status({ fill: "green", shape: "dot", text: last_cmd+" at "+last_activity.toLocaleString("de-DE") });
            } else if (connstate == "disconnected") {
                node.status({ fill: "red", shape: "ring", text: last_cmd });
            }
        }
        node.on('input', function (msg) {
            if (!msg.hasOwnProperty("action")) msg.action = "toggle";
            if ( msg.hasOwnProperty("cmd") ) {
                last_cmd = msg.cmd;
                data = msg.cmd;
            } else {
                data = "set " + config.Device + " " + msg.action;
                last_cmd = "set " + msg.action;
            }
            //this.log(data);
            last_activity = new Date();
            updateStatus();
            fhem.eventEmitter.emit("data_send", data);
        });
        fhem.eventEmitter.on("connected", () => {
            connstate = "connected";
            this.status({ fill: "green", shape: "dot", text: "connected" });
        });
        fhem.eventEmitter.on("disconnected", (msg) => {
            connstate = "disconnected";
            var txt = "disconnected";
            if ( msg!=undefined ) txt = msg;
            this.status({ fill: "red", shape: "ring", text: txt });
        });
    }
    RED.nodes.registerType("fhem-out", output);
}