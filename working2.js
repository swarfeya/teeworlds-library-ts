const net = require('dgram')
bufffff = Buffer.from([255, 255, 255, 255])
function arrStartsWith(arr, arrStart, start=0) {
    arr.splice(0, start)
    for (let i = 0; i < arrStart.length; i++) {
        if (arr[i] == arrStart[i])
            continue;
        else return false;
    }
    return true;
}
class MinecraftProtocol {
	static writeVarInt(val) {
		// "VarInts are never longer than 5 bytes"
		// https://wiki.vg/Data_types#VarInt_and_VarLong
		const buf = Buffer.alloc(5)
		// let written = 0

		// while (true) {
		// 	if ((val & 0xFFFFFF80) === 0) {
		// 		buf.writeUInt8(val, written++)
		// 		break
		// 	} else {
		// 		buf.writeUInt8(val & 0x7F | 0x80, written++)
		// 		val >>>= 7
		// 	}
		// }
		// return val;
		return Buffer.from([16, 0, 0])
		// return buf.slice(0, written)
	}
	static writeVarIn2t(val) {
		// "VarInts are never longer than 5 bytes"
		// https://wiki.vg/Data_types#VarInt_and_VarLong
		const buf = Buffer.alloc(5)
		let written = 0

		while (true) {
			if ((val & 0xFFFFFF80) === 0) {
				buf.writeUInt8(val, written++)
				break
			} else {
				buf.writeUInt8(val & 0x7F | 0x80, written++)
				val >>>= 7
			}
		}
		return buf.slice(0, written)
	}

	static writeString(val) {
		return Buffer.from(val, 'UTF-8')
	}

	static writeUShort(val) {
		return Buffer.from([val >> 8, val & 0xFF])
	}

	static concat(chunks) {
		let length = 0

		for (const chunk of chunks) {
			length += chunk.length
		}

		const buf = [
			MinecraftProtocol.writeVarInt(length),
			...chunks
		]

		return Buffer.concat(buf)
	}
}
test = MinecraftProtocol.concat([
	MinecraftProtocol.writeVarInt(20),
	MinecraftProtocol.writeString("name"),
	MinecraftProtocol.writeString(""),
	MinecraftProtocol.writeVarInt(-1),
	MinecraftProtocol.writeString("pinky"),
	MinecraftProtocol.writeVarInt(1),
	MinecraftProtocol.writeVarInt(7667531), /* color body */
	MinecraftProtocol.writeVarInt(11468598), /* color feet */
])
test2 = MinecraftProtocol.concat([
	MinecraftProtocol.writeVarInt(16),
	MinecraftProtocol.writeString("TKEN"),
	// MinecraftProtocol.writeVarInt(0),
	// MinecraftProtocol.writeVarInt(0),
])
// startinfo: 
"\x00\x04\x01\x41\x07\x03\x28\x74\x65\x73\x74\x00\x00\x40\x70\x69\x6e\x6b\x79\x00\x01\x8b\xfd\xa7\x07\xb6\xfc\xf7\x0a\x1d\x56\xdb\x98"
"\x10\x00\x00\x10\x00\x00\x74\x65\x73\x74\x10\x00\x00\x70\x69\x6e\x6b\x79\x10\x00\x00\x10\x00\x00\x10\x00\x00\x0d\x6b\xa4\x88"
console.log(test.toString())
console.log(test2.toString())

var socket = net.createSocket("udp4");
var a = {"host": "51.210.171.47", "port": 7303}
"\x10\x00\x00\x01\x54\x4b\x45\x4e\xff\xff\xff\xff"
"\x10\x00\x00\x54\x4b\x45\x4e\xff\xff\xff\xff"
function join(host, port) {
	var latestBuf;
	latestBuf = Buffer.from([16, 0, 0, 1, "T".charCodeAt(0), "K".charCodeAt(0), "E".charCodeAt(0), "N".charCodeAt(0), bufffff])
	latestBuf = Buffer.concat([latestBuf, bufffff])
	socket.send(latestBuf, 0, latestBuf.length, a.port, a.host, (err, bytes) => {
		console.log(err, bytes)
	})

	socket.on("message", a => {
		// console.log(a.toJSON().data.slice(a.toJSON().data.length-4, a.toJSON().data.length))
		if (a.toString().includes("TKEN") || arrStartsWith(a.toJSON().data, [16, 0, 0, 0])) {
			bufffff = Buffer.from(a.toJSON().data.slice(a.toJSON().data.length-4, a.toJSON().data.length))
			latestBuf = Buffer.concat([Buffer.from([16, 0, 0, 3]), bufffff]);
			socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
				console.log(err, bytes)
			})
			latestBuf = Buffer.from("0.6 626fce9a778df4d4".split("").map(a => a.charCodeAt(0)))
			latestBuf = Buffer.concat([Buffer.from([0x0, 0x0, 0x1, 0x41, 0x07, 0x1, 0x3]), latestBuf, Buffer.from([0, 0]), bufffff])
			console.log(latestBuf.toString())
			socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
				console.log(err, bytes)
			})
		} else if (arrStartsWith(a.toJSON().data, [0x0, 0x1, 0x2, 0x41, 0x03, 0x01, 0x01, 0xf6, 0x21, 0xa5, 0xa1, 0xf5])) {
			// latestBuf = MinecraftProtocol.concat([
			// 	MinecraftProtocol.writeVarInt(20),
			// 	MinecraftProtocol.writeString("name"),
			// 	MinecraftProtocol.writeString(""),
			// 	MinecraftProtocol.writeVarInt(-1),
			// 	MinecraftProtocol.writeString("pinky"),
			// 	MinecraftProtocol.writeVarInt(1),
			// 	MinecraftProtocol.writeVarInt(7667531), /* color body */
			// 	MinecraftProtocol.writeVarInt(11468598), /* color feet */
			// ])	
			// latestBuf = Buffer.concat([latestBuf, bufffff])
			latestBuf = Buffer.from([0x0, 0x2, 0x01, 0x40, 0x01, 0x02, 0x1d])
			latestBuf = Buffer.concat([latestBuf, bufffff])
			socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
				console.log(err, bytes)
			})
			
		} else if (arrStartsWith(a.toJSON().data, [0x0, 0x02, 0x02])) {
			// latestBuf = MinecraftProtocol.concat([
			// 	MinecraftProtocol.writeVarInt(20),
			// 	MinecraftProtocol.writeString("testas"),
			// 	MinecraftProtocol.writeString(""),
			// 	MinecraftProtocol.writeVarInt(-1),
			// 	MinecraftProtocol.writeString("pinky"),
			// 	MinecraftProtocol.writeVarInt(1),
			// 	MinecraftProtocol.writeVarInt(7667531), /* color body */
			// 	MinecraftProtocol.writeVarInt(11468598), /* color feet */
			// ])	
			latestBuf = Buffer.from([0x00, 0x04, 0x01, 0x41, 0x07, 0x03, 0x28, 0x74, 0x65, 0x73, 0x74, 0x00, 0x00, 0x40, 0x70, 0x69, 0x6e, 0x6b, 0x79, 0x00, 0x01, 0x8b, 0xfd, 0xa7, 0x07, 0xb6, 0xfc, 0xf7, 0x0a])
			latestBuf = Buffer.concat([latestBuf, bufffff])
			// "\x00\x04\x01\x41\x07\x03\x28\x74\x65\x73\x74\x00\x00\x40\x70\x69\x6e\x6b\x79\x00\x01\x8b\xfd\xa7\x07\xb6\xfc\xf7\x0a\xc2\xa2\xbf\xd4"
	// "\x00\x04\x01\x41\x07\x03\x28\x74\x65\x73\x74\x00\x00\x40\x70\x69\x6e\x6b\x79\x00\x01\x8b\xfd\xa7\x07\xb6\xfc\xf7\x0a\x9d\x4f\x56\x15"

			socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
				console.log(err, bytes)
			})
			
		} else if (arrStartsWith(a.toJSON().data, [0x0, 0x3, 0x3])) {
			latestBuf = Buffer.from([0x00, 0x07, 0x01, 0x40, 0x01, 0x04, 0x1f])
			latestBuf = Buffer.concat([latestBuf, bufffff])
			socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
				console.log(err, bytes)
			})

		} else if (arrStartsWith(a.toJSON().data, [0x0, 0x01, 0x02])) {
			// 0000		0x00, 0x02, 0x01, 0x40, 0x01, 0x02, 0x1d, 0xc2, 0xa2, 0xbf, 0xd4
			latestBuf = Buffer.from([0x00, 0x02, 0x01, 0x40, 0x01, 0x02, 0x1d])
			latestBuf = Buffer.concat([latestBuf, bufffff])
			socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
				console.log(err, bytes)
			})
			
		}else {
			
			console.log("invalid packet: ", a.toJSON().data)
			socket.disconnect()
		}
			// console.log(bufffff.toJSON().data)

	})

}
join(a.host, a.port)
/*
socket.on("connect", () => {
	socket.write(test2)
})
socket.on("data", (a) => {
	console.log(a)
})*/
// console.log()