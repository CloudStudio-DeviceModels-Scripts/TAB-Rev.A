//function parseUplink(device, payload)
//{
	// This function allows you to parse the received payload, and store the 
	// data in the respective endpoints. Learn more at https://wiki.cloud.studio/page/200

	// The parameters in this function are:
	// - device: object representing the device that produced the payload. 
	//   You can use "device.endpoints" to access the collection 
	//   of endpoints contained within the device. More information
	//   at https://wiki.cloud.studio/page/205
	// - payload: object containing the payload received from the device. More
	//   information at https://wiki.cloud.studio/page/208.

	// This example is written assuming a temperature and humidity sensor that 
	// sends a binary payload with temperature in the first byte, humidity 
	// in the second byte, and battery percentage in the third byte.

/*  
	// Payload is binary, so it's easier to handle as an array of bytes
	var bytes = payload.asBytes();
	
	// Verify payload contains exactly 3 bytes
	if (bytes.length != 3)
		return;

	// Parse and store temperature
	var temperatureSensor = device.endpoints.byType(endpointType.temperatureSensor);
	if (temperatureSensor != null)
	{
		var temperature = bytes[0] & 0x7f;
		if (bytes[0] & 0x80)  // Negative temperature?
			temperature -= 128;
		temperatureSensor.updateTemperatureSensorStatus(temperature);
	}

	// Parse and store humidity
	var humiditySensor = device.endpoints.byType(endpointType.humiditySensor);
	if (humiditySensor != null)
	{
		var humidity = bytes[1];
		humiditySensor.updateHumiditySensorStatus(humidity);
	}	  
	
	// Parse and store battery percentage
	var batteryPercentage = bytes[2];
	device.updateDeviceBattery({ percentage: batteryPercentage });
*/

//}

//function buildDownlink(device, endpoint, command, payload) 
//{ 
	// This function allows you to convert a command from the platform 
	// into a payload to be sent to the device.
	// Learn more at https://wiki.cloud.studio/page/200

	// The parameters in this function are:
	// - device: object representing the device to which the command will
	//   be sent. 
	// - endpoint: endpoint object representing the endpoint to which the 
	//   command will be sent. May be null if the command is to be sent to 
	//   the device, and not to an individual endpoint within the device.
	// - command: object containing the command that needs to be sent. More
	//   information at https://wiki.cloud.studio/page/1195.

	// This example is written assuming a device that contains a single endpoint, 
	// of type appliance, that can be turned on, off, and toggled. 
	// It is assumed that a single byte must be sent in the payload, 
	// which indicates the type of operation.

/*
	 payload.port = 25; 	 	 // This device receives commands on LoRaWAN port 25 
	 payload.buildResult = downlinkBuildResult.ok; 

	 switch (command.type) { 
	 	 case commandType.onOff: 
	 	 	 switch (command.onOff.type) { 
	 	 	 	 case onOffCommandType.turnOn: 
	 	 	 	 	 payload.setAsBytes([30]); 	 	 // Command ID 30 is "turn on" 
	 	 	 	 	 break; 
	 	 	 	 case onOffCommandType.turnOff: 
	 	 	 	 	 payload.setAsBytes([31]); 	 	 // Command ID 31 is "turn off" 
	 	 	 	 	 break; 
	 	 	 	 case onOffCommandType.toggle: 
	 	 	 	 	 payload.setAsBytes([32]); 	 	 // Command ID 32 is "toggle" 
	 	 	 	 	 break; 
	 	 	 	 default: 
	 	 	 	 	 payload.buildResult = downlinkBuildResult.unsupported; 
	 	 	 	 	 break; 
	 	 	 } 
	 	 	 break; 
	 	 default: 
	 	 	 payload.buildResult = downlinkBuildResult.unsupported; 
	 	 	 break; 
	 }
*/

//}

/**
 * Decoder for Trackio GPS device.
 * Added altitude = 0 to add support for mappers.helium.com
 *
 * Test with: 08FE3962FF010E78BACA5B
 */
function Decoder(bytes, port) {
  var decoded = {};

  // Some "common status format"
  decoded.status = bits(bytes[0], 4, 7);

  decoded.battery = (25 + bits(bytes[1], 0, 3)) / 10,
  decoded.capacity = 100 * (bits(bytes[1], 4, 7) / 15),

  // Bit 7 is RFU; exclude
  decoded.temperature = bits(bytes[2], 0, 7) - 32,
//  decoded.temperature = hotspots.lat,
  decoded.gnssFix =  bit(bytes[0], 3),
    // LSB, ignoring the 4 high bits (RFU) and sign-extending to 32 bits
    // to support negative values, by shifting 4 bytes too far to the
    // left (which discards those bits, as only 32 bits are preserved),
    // followed by a sign-propagating right shift:
  decoded.latitude = (bytes[3] | bytes[4] << 8 | bytes[5] << 16
      | bytes[6] << 28 >> 4) / 1e6,
    // Likewise, ignoring the 3 high bits (used for accuracy):
  decoded.longitude = (bytes[7] | bytes[8] << 8 | bytes[9] << 16
      | bytes[10] << 27 >> 3) / 1e6,
    // Accuracy in meters; 1 << x+2 is the same as Pow(2, x+2) for x < 32
  decoded.accuracy = 1 << bits(bytes[10], 5, 7) + 2,
  decoded.altitude = 0;

  return decoded;
//}

// Gets the zero-based unsigned numeric value of the given bit(s)
function bits(value, lsb, msb) {
  var len = msb - lsb + 1;
  var mask = (1 << len) - 1;
  return value >> lsb & mask;
}

// Gets the boolean value of the given bit
function bit(value, bit) {
  return (value & (1 << bit)) > 0;
}
}