const net = require('dgram')
const process = require('process')
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
process.on("exit", () => {
	console.log("BYE!")
})
var messageTypes = ["SV_MOTD", "SV_BROADCAST", "SV_CHAT", "SV_KILL_MSG", "SV_SOUND_GLOBAL", "SV_TUNE_PARAMS", "SV_EXTRA_PROJECTILE", "SV_READY_TO_ENTER", "SV_WEAPON_PICKUP", "SV_EMOTICON", "SV_VOTE_CLEAR_OPTIONS", "SV_VOTE_OPTION_LIST_ADD", "SV_VOTE_OPTION_ADD", "SV_VOTE_OPTION_REMOVE", "SV_VOTE_SET", "SV_VOTE_STATUS", "CL_SAY", "CL_SET_TEAM", "CL_SET_SPECTATOR_MODE", "CL_START_INFO", "CL_CHANGE_INFO", "CL_KILL", "CL_EMOTICON", "CL_VOTE", "CL_CALL_VOTE", "CL_IS_DDNET", "SV_DDRACE_TIME", "SV_RECORD", "UNUSED", "SV_TEAMS_STATE", "CL_SHOW_OTHERS_LEGACY"]
var messageTypes = [["CAPABILITIES", "SV_MOTD", "SV_BROADCAST", "SV_CHAT", "SV_KILL_MSG", "SV_SOUND_GLOBAL", "SV_TUNE_PARAMS", "SV_EXTRA_PROJECTILE", "SV_READY_TO_ENTER", "SV_WEAPON_PICKUP", "SV_EMOTICON", "SV_VOTE_CLEAR_OPTIONS", "SV_VOTE_OPTION_LIST_ADD", "SV_VOTE_OPTION_ADD", "SV_VOTE_OPTION_REMOVE", "SV_VOTE_SET", "SV_VOTE_STATUS", "CL_SAY", "CL_SET_TEAM", "CL_SET_SPECTATOR_MODE", "CL_START_INFO", "CL_CHANGE_INFO", "CL_KILL", "CL_EMOTICON", "CL_VOTE", "CL_CALL_VOTE", "CL_IS_DDNET", "SV_DDRACE_TIME", "SV_RECORD", "UNUSED", "SV_TEAMS_STATE", "CL_SHOW_OTHERS_LEGACY"], ["CAPABILITIES", "INFO", "MAP_CHANGE", "MAP_DATA", "CON_READY", "SNAP", "SNAP_EMPTY", "SNAP_SINGLE", "INPUT_TIMING", "RCON_AUTH_STATUS", "RCON_LINE", "READY", "ENTER_GAME", "INPUT", "RCON_CMD", "RCON_AUTH", "REQUEST_MAP_DATA", "PING", "PING_REPLY", "RCON_CMD_ADD", "RCON_CMD_REMOVE"]]

function Unpack(packet) {
	// var sys = (i) => { return {"type": i&1 ? "sys" : "game", "msgid": (i-(i&1))/2, "msg": messageTypes[i&1][(i-(i&1))/2], "ye": i.toString(16)}}
	var unpacked = {twprotocol: {flags: packet[0], ack: packet[1], chunkAmount: packet[2], size: packet.byteLength-3}, chunks: []}
	
	// console.log(unpacked)
	
	if (unpacked.twprotocol.flags == 0x10)
		return unpacked;
	if (packet.indexOf(Buffer.from([0xff,0xff,0xff,0xff])) == 0)
		return unpacked;
	packet = packet.slice(3)
	for (let i = 0; i < unpacked.twprotocol.chunkAmount; i++) {
		chunk = {}
		chunk.bytes = ((packet[0] & 0x3f) << 4) | (packet[1] & ((1 << 4) - 1)); // idk what this shit is but it works
		// if (i == unpacked.twprotocol.chunkAmount-1) 
			// console.log("last", packet.slice(0, chunk.bytes))
		chunk.flags = (packet[0] >> 6) & 3;
		chunk.sequence = -1;
		if (chunk.flags & 1) {
			chunk.sequence = ((packet[1] & (~((1 << 4) - 1))) << 2) | packet[2];
			chunk.seq = ((packet[1]&0xf0)<<2) | packet[2];
		}
		packet = packet.slice(2) // remove flags & size
		// console.log(packet[0].toString(16), packet[1].toString(16))
		chunk.type = packet[0] & 1 ? "sys" : "game"; // & 1 = binary, 
		chunk.msgid = (packet[0]-(packet[0]&1))/2;
		chunk.msg = messageTypes[packet[0]&1][(packet[0]-(packet[0]&1))/2];
		chunk.ye = i.toString(16)
		// console.log(sys(packet[1]))
		chunk.raw = packet.slice(0, chunk.bytes)
		// chunk.raw = chunk.raw.toJSON().data.map(a => a.toString(16))
		// chunk.len = chunk.raw.length
		
		// chunk.raw = chunk.raw.map(a => parseInt(a, 16))
		// chunk.raw = Buffer.from(chunk.raw)
		packet = packet.slice(chunk.bytes+1) // +1 cuz it adds an extra \x00 for easier parsing i guess
		unpacked.chunks.push(chunk)
	}
	return unpacked
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
socket.bind(13337)
"\x10\x00\x00\x01\x54\x4b\x45\x4e\xff\xff\xff\xff"
"\x10\x00\x00\x54\x4b\x45\x4e\xff\xff\xff\xff"
function join(host, port) {
	var onetime = []
	var latestBuf;
	var State = 0; // 0 = offline; 1 = 
	message = true;
	latestBuf = Buffer.from([16, 0, 0, 1, "T".charCodeAt(0), "K".charCodeAt(0), "E".charCodeAt(0), "N".charCodeAt(0), bufffff])
	latestBuf = Buffer.concat([latestBuf, bufffff])
	socket.send(latestBuf, 0, latestBuf.length, a.port, a.host, (err, bytes) => {
		console.log(err, bytes)
	})
	var ack = 0;
	var clientAck = 0;
	var lastMsg = "";
	time = new Date().getTime() + 2000;
	socket.on("message", a => {
		unpacked = Unpack(a)
		if (unpacked.twprotocol.flags != 128 && unpacked.twprotocol.ack)
			clientAck = unpacked.twprotocol.ack+1;
		unpacked.chunks.forEach(a => {
			if (a.msg !== "SNAP") {
				if (a.seq != undefined && a.seq != -1)
					ack = a.seq
				
				console.log(a.msg + "is not snap, new ack: " + ack, a.seq, a.sequence);
			}
		})
		// console.log(unpacked)
		var chunkMessages = unpacked.chunks.map(a => a.msg)
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
				console.log("Sent " + bytes)
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
			
		} else if (unpacked.chunks[0] && chunkMessages.includes("CAPABILITIES") && !onetime.includes("ready")) {
			// latestBuf = Buffer.from([0x00, 0x02, 0x01, 0x40, 0x01, 0x02, 0x1d])
			// latestBuf = Buffer.concat([latestBuf, bufffff])
			// send ready
			latestBuf = Buffer.from([0x00, ack, 0x01, 0x40, 0x01, 0x02, 0x1d]);
			latestBuf = Buffer.concat([latestBuf, bufffff]);
			console.log(ack, "THIS IS CAPATIPAIBVPLIES! SEND STUFF OR SMTH?!")
			socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
				console.log("SUCCESFFUYLLY SENT " + bytes)
			})
			onetime.push("ready")
		} else if ((unpacked.chunks[0] && chunkMessages.includes("CON_READY") || unpacked.chunks[0] && chunkMessages.includes("SV_MOTD")) && !onetime.includes("startinfo")) {
			latestBuf = Buffer.from([0x0, ack, 0x01, 0x41, 0x07, 0x03, 0x28, 0x74, 0x65, 0x73, 0x74, 0x00, 0x00, 0x40, 0x70, 0x69, 0x6e, 0x6b, 0x79, 0x00, 0x01, 0x8b, 0xfd, 0xa7, 0x07, 0xb6, 0xfc, 0xf7, 0x0a, 0x66, 0x79, 0x21, 0xb3])			
			latestBuf = Buffer.concat([latestBuf, bufffff]);
			console.log(ack, "THIS IS READY SENMD STARTINFO! SEND STUFF OR SMTH?!")
			socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
				console.log("SUCCESFFUYLLY SENT STARTINFO: " + bytes)
			})
			onetime.push("startinfo")
			
		} else if (unpacked.chunks[0] && chunkMessages.includes("SNAP")) {
			// just skip snap, nobody likes snap
		} 
		else {
			
			console.log("invalid packet: ", unpacked, ack)
			// socket.disconnect()
		}
		if (new Date().getTime() - time >= 1000) {
			time = new Date().getTime();
			// console.log("sending keepalive.\n")
			latestBuf = Buffer.from([0x10, ack, 0x00, 0x00])
			latestBuf = Buffer.concat([latestBuf, bufffff])
			socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
				console.log("sent keepalive: ", bytes)	
			})
		}
		setTimeout(() => {
			if (State != 3) {
				if (message) {
					State = 0;
					message = false;
					latestBuf = Buffer.from([0x00, ack, 0x01, 0x41, 0x04, clientAck, 0x22, 0x00])
					latestBuf = Buffer.concat([latestBuf, /*data*/Buffer.from("chat test blabla"), Buffer.from([0x0a, 0x00]), bufffff])
					socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
						console.log("SUCCESFFUYLLY SENT CHAT: " + bytes)
						// process.exit()
					})
					setTimeout(() => {
						console.log("yooyooy")
						latestBuf = Buffer.from([0x10, ack, 0x0, 0x04])
						latestBuf = Buffer.concat([latestBuf, bufffff]);
						// console.log(ack, "THIS IS READY SENMD STARTINFO! SEND STUFF OR SMTH?!")
						socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
							console.log("SUCCESFFUYLLY SENT DISCONNECT: " + bytes)
							process.exit()
						})
					}, 1500)
				}

			}
		}, 7500)
		process.stdin.on("data", data => {
			if (lastMsg != data) {
				lastMsg = data;
				data = data.slice(0, -2)
				console.log(data)
				pcd = getPcd(ack, data.byteLength+4, 1)
				latestBuf = Buffer.from([0x00, ack, 0x01, pcd[0], pcd[1], clientAck, 0x22, 0x00])
				latestBuf = Buffer.concat([latestBuf, data, Buffer.from([0x0a, 0x00]), bufffff])
				socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
					console.log("SUCCESFFUYLLY SENT CHAT: " + bytes)
					// process.exit()
				})
			}
		})

		// if (ack >= 100)
			// return socket.disconnect()
			// console.log(bufffff.toJSON().data)

	})

}
function getPcd(ack, size, flags) {
    pcd = []
    if (flags & 1) {
        ack = (ack+1)%(1<<10); /* max sequence */
    }
    pcd[0] = ((flags&3)<<6)|((size>>4)&0x3f)
    pcd[1] = size & 0xf
    if (flags&1) {
       pcd[1] |= (ack>>2)&0xf0 
    }
    pcd[2] = ack&0xff
    return pcd
}
var a = {"host": "51.195.119.197", "port": 8304}

join(a.host, a.port)
/*
socket.on("connect", () => {
	socket.write(test2)
})
socket.on("data", (a) => {
	console.log(a)
})*/
// console.log()