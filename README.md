[![npm version](https://img.shields.io/npm/v/node-red-contrib-fhem.svg?style=flat-square)](https://www.npmjs.org/package/node-red-contrib-fhem)[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate/?hosted_button_id=GPNW3U6QJUYYJ)

# node-red-contrib-fhem

This package contains a receiver, a sender and a command node which connects to FHEM instances.

# Requirements
a telnet "device" in fhem.
https://fhem.de/commandref.html#telnet

The configured port must be accessible over the network from the node-red instance.
Currently there is only a plain telnet connection possible.

# Example Configuration for fhem-instance
Name: MyFhem
Server: 192.168.1.10
Port: 7072

# Example Configuration for fhem-in
Name: Temps
Instance: Choose your fhem-instance

The Devivefilter and Readingsfilter are optional settings. If you leave both blank, you will get all events from fhem-instance

Example for all temperature readings from all devices
Devicefilter: leave blank
Readingsfilter: temperatur

# Example Configuration for fhem-out
Name: MyOutDevice
FHEM-Instance: Choose your fhem-instance
Device: the fhem device-name property

The string of msg.action is send directly to the fhem device
"msg.action = set_on" sets a device in them on
"msg.action = virtTemp 10" sets the device property virtTemp to 10

# Example Configuration for fhem-cmd
Name: MyOutDevice
FHEM-Instance: Choose your fhem-instance

The string of msg.cmd is send directly to the fhem instance and the response is send to the out pin
"msg.cmd = update check" Shows list of fhem modules to update
