var MsgPacker = require('./MsgPacker');
// var MsgUnpacker = require('./MsgUnpacker');
// var net = require('dgram');
import net from 'dgram';
// const SocksClient = require('socks').SocksClient;
import { SocksClient, SocksClientOptions, SocksProxy, SocksRemoteHost } from 'socks';
import fs from 'fs';
// import * from fs as 'fs';
import { EventEmitter } from 'stream';
interface chunk {
	bytes?: number,
	flags?: number, 
	sequence?: number,
	seq?: number,
	type?: 'sys' | 'game',
	msgid?: number,
	msg?: string,
	raw?: Buffer,
	extended_msgid?: Buffer;
}
interface _packet {
	twprotocol: { flags: number, ack: number, chunkAmount: number, size: number },
	chunks: chunk[]
}
var messageTypes = [
	["none, starts at 1", "SV_MOTD", "SV_BROADCAST", "SV_CHAT", "SV_KILL_MSG", "SV_SOUND_GLOBAL", "SV_TUNE_PARAMS", "SV_EXTRA_PROJECTILE", "SV_READY_TO_ENTER", "SV_WEAPON_PICKUP", "SV_EMOTICON", "SV_VOTE_CLEAR_OPTIONS", "SV_VOTE_OPTION_LIST_ADD", "SV_VOTE_OPTION_ADD", "SV_VOTE_OPTION_REMOVE", "SV_VOTE_SET", "SV_VOTE_STATUS", "CL_SAY", "CL_SET_TEAM", "CL_SET_SPECTATOR_MODE", "CL_START_INFO", "CL_CHANGE_INFO", "CL_KILL", "CL_EMOTICON", "CL_VOTE", "CL_CALL_VOTE", "CL_IS_DDNET", "SV_DDRACE_TIME", "SV_RECORD", "UNUSED", "SV_TEAMS_STATE", "CL_SHOW_OTHERS_LEGACY"], 
	["none, starts at 1", "INFO", "MAP_CHANGE", "MAP_DATA", "CON_READY", "SNAP", "SNAP_EMPTY", "SNAP_SINGLE", "INPUT_TIMING", "RCON_AUTH_STATUS", "RCON_LINE", "READY", "ENTER_GAME", "INPUT", "RCON_CMD", "RCON_AUTH", "REQUEST_MAP_DATA", "PING", "PING_REPLY", "RCON_CMD_ADD", "RCON_CMD_REMOVE"]
]
var messageUUIDs = {
	"WHAT_IS": Buffer.from([0x24, 0x5e, 0x50, 0x97, 0x9f, 0xe0, 0x39, 0xd6, 0xbf, 0x7d, 0x9a, 0x29, 0xe1, 0x69, 0x1e, 0x4c]),
	"IT_IS": Buffer.from([0x69, 0x54, 0x84, 0x7e, 0x2e, 0x87, 0x36, 0x03, 0xb5, 0x62, 0x36, 0xda, 0x29, 0xed, 0x1a, 0xca]),
	"I_DONT_KNOW": Buffer.from([0x41, 0x69, 0x11, 0xb5, 0x79, 0x73, 0x33, 0xbf, 0x8d, 0x52, 0x7b, 0xf0, 0x1e, 0x51, 0x9c, 0xf0]),
	"RCON_TYPE": Buffer.from([0x12, 0x81, 0x0e, 0x1f, 0xa1, 0xdb, 0x33, 0x78, 0xb4, 0xfb, 0x16, 0x4e, 0xd6, 0x50, 0x59, 0x26]),
	"MAP_DETAILS": Buffer.from([0xf9, 0x11, 0x7b, 0x3c, 0x80, 0x39, 0x34, 0x16, 0x9f, 0xc0, 0xae, 0xf2, 0xbc, 0xb7, 0x5c, 0x03]),
	"CLIENT_VERSION": Buffer.from([0x8c, 0x00, 0x13, 0x04, 0x84, 0x61, 0x3e, 0x47, 0x87, 0x87, 0xf6, 0x72, 0xb3, 0x83, 0x5b, 0xd4]),
	"CAPABILITIES": Buffer.from([0xf6, 0x21, 0xa5, 0xa1, 0xf5, 0x85, 0x37, 0x75, 0x8e, 0x73, 0x41, 0xbe, 0xee, 0x79, 0xf2, 0xb2]),
}
function arrStartsWith(arr: number[], arrStart: number[], start=0) {
	arr.splice(0, start)
    for (let i = 0; i < arrStart.length; i++) {
		if (arr[i] == arrStart[i])
		continue;
        else return false;
    }
    return true;
}
class Client extends EventEmitter {
	host: string;
	port: number;
	name: string;
	index: number;
	State: number; // 0 = offline; 1 = STATE_CONNECTING = 1, STATE_LOADING = 2, STATE_ONLINE = 3
	ack: number;
	clientAck: number;
	receivedSnaps: number; /* wait for 2 ss before seeing self as connected */
	lastMsg: string;
	_port: number;
	proxy?: SocksProxy;
	proxyMode: boolean;
	socket: net.Socket;
	TKEN: Buffer;
	time: number;
	socksClient?: SocksClient;
	hostInfo?: SocksRemoteHost; 
	// latestBuf: Buffer;
	// hostInfo: object;
	constructor(ip: string, port: number, name: string, id: number, proxy?: SocksProxy) {
		super();
		this.host = ip;
		this.port = port;
		this.name = name;
		// this.onetime = []
		this.index = id;
		this.State = 0; // 0 = offline; 1 = STATE_CONNECTING = 1, STATE_LOADING = 2, STATE_ONLINE = 3
		this.ack = 0; // ack of messages the client has received
		this.clientAck = 1; // ack of messages the client has sent
		this.receivedSnaps = 0; /* wait for 2 snaps before seeing self as connected */
		this.lastMsg = "";
		this.hostInfo; // hostinfo of the proxy
		this._port = Math.floor(Math.random()*65535)
		this.proxyMode = Boolean(proxy)
		this.socket = net.createSocket("udp4")
		this.socket.bind();
		if (this.proxyMode && proxy) {
			this.proxy = proxy;
			const options: SocksClientOptions = {
				proxy: proxy,
			
				command: 'associate',
			
				// When using associate, the destination should be the remote client that is expected to send UDP packets to the proxy server to be forwarded. This should be your local ip, or optionally the wildcard address (0.0.0.0)  UDP Client <-> Proxy <-> UDP Client
				destination: {
					host: '***REMOVED***',
					port: this._port
				}
			};
			this.socksClient = new SocksClient(options);
			this.socksClient.connect();
			this.socksClient.on("error", err => {
				console.log("CRASH CRASH CRASH!!!", err)
				// this.emit("error", err, this.index);
				// remove proxy
				var proxies = fs.readFileSync(__dirname + "\\socks5.txt")
					.toString()
					.replace(/\r/g, "")
					.split("\n")
					.filter(a => a) // filter empty out	
				if (proxies.indexOf(`${proxy.host}:${proxy.port}`) != -1)
					proxies.splice(proxies.indexOf(`${proxy.host}:${proxy.port}`), 1)
				else
					console.log("wtf proxy not in proxies?", proxy)
				fs.writeFileSync(__dirname + "\\socks5.txt", proxies.join("\n"));
			})
			
		}
		this.hostInfo;
		this.TKEN = Buffer.from([255, 255, 255, 255])
		this.time = new Date().getTime()+2000; // time (used for keepalives, start to send keepalives after 2 seconds)
		this.State = 0;
	}
	Unpack(packet: Buffer): _packet {
		// var sys = (i) => { return {"type": i&1 ? "sys" : "game", "msgid": (i-(i&1))/2, "msg": messageTypes[i&1][(i-(i&1))/2], "ye": i.toString(16)}}
		var unpacked: _packet = {twprotocol: {flags: packet[0], ack: packet[1], chunkAmount: packet[2], size: packet.byteLength-3}, chunks: []}
		
		// console.log(unpacked)
		
		if (unpacked.twprotocol.flags == 0x10 || unpacked.twprotocol.flags == 128)
			return unpacked;
		if (packet.indexOf(Buffer.from([0xff,0xff,0xff,0xff])) == 0)
			return unpacked;
		packet = packet.slice(3)
		for (let i = 0; i < unpacked.twprotocol.chunkAmount; i++) {
			var _chunk: chunk = {};
			// chunk.preraw = packet;
			_chunk.bytes = ((packet[0] & 0x3f) << 4) | (packet[1] & ((1 << 4) - 1)); // idk what this shit is but it works
			// if (i == unpacked.twprotocol.chunkAmount-1) 
				// console.log("last", packet.slice(0, chunk.bytes))
			_chunk.flags = (packet[0] >> 6) & 3;
			_chunk.sequence = -1;
			
			if (_chunk.flags & 1) {
				_chunk.sequence = ((packet[1] & (~((1 << 4) - 1))) << 2) | packet[2];
				_chunk.seq = ((packet[1]&0xf0)<<2) | packet[2];
				packet = packet.slice(3) // remove flags & size
			} else
				packet = packet.slice(2)
			// if (Object.keys(messageUUIDs).includes())
			// console.log(packet[0].toString(16), packet[1].toString(16))
			_chunk.type = packet[0] & 1 ? "sys" : "game"; // & 1 = binary, ****_***1. e.g 0001_0111 sys, 0001_0110 game
			_chunk.msgid = (packet[0]-(packet[0]&1))/2;
			_chunk.msg = messageTypes[packet[0]&1][_chunk.msgid];
			// chunk.ye = packet[0].toString(16)
			// console.log(sys(packet[1]))
			_chunk.raw = packet.slice(1, _chunk.bytes)
			Object.values(messageUUIDs).forEach((a, i) => {
				if (a.compare(packet.slice(0, 16)) == 0) {
					_chunk.extended_msgid = a;
					// chunk.type = 'sys';
					_chunk.msg = Object.keys(messageUUIDs)[i];
				}
			})
			
			// chunk.raw = chunk.raw.toJSON().data.map(a => a.toString(16))
			// chunk.len = chunk.raw.length
			// chunk.raw = chunk.raw.map(a => parseInt(a, 16))
			// chunk.raw = Buffer.from(chunk.raw)
			packet = packet.slice(_chunk.bytes) // +1 cuz it adds an extra \x00 for easier parsing i guess
			unpacked.chunks.push(_chunk)
		}
		return unpacked
		}
	SendControlMsg(msg: number, ExtraMsg: string = "") {
		return new Promise((resolve, reject) => {
			
			var latestBuf = Buffer.from([0x10+(((16<<4)&0xf0)|((this.ack>>8)&0xf)), this.ack&0xff, 0x00, msg])
			latestBuf = Buffer.concat([latestBuf, Buffer.from(ExtraMsg), this.TKEN]) // move header (latestBuf), optional extraMsg & TKEN into 1 buffer
			if (this.proxyMode) {
				var packet = SocksClient.createUDPFrame({
					remoteHost: { host: this.host, port: this.port },
					data: latestBuf
				});
				if (this.hostInfo != undefined)
					this.socket.send(packet, 0, packet.length, this.hostInfo.port, this.hostInfo.host, (err, bytes) => {
						// console.log(`sent controlmsg ${msg} with ack: `, ack, bytes)	
						resolve(bytes)
					})
			} else {
				this.socket.send(latestBuf, 0, latestBuf.length, this.port, this.host, (err, bytes) => {
					// console.log(`sent controlmsg ${msg} with ack: `, ack, bytes)	
					resolve(bytes)
				})
			}
			setTimeout(() => { resolve("failed, rip") }, 2000) 
			/* 	after 2 seconds it was probably not able to send, 
				so when sending a quit message the user doesnt
				stay stuck not being able to ctrl + c
		*/
	})
	}
	SendMsgEx(Msg: typeof MsgPacker, Flags: number) {
		// if (!Msg instanceof MsgPacker) 
			// return;
		var header = [] 
		// mpd = (*mpd << 1) | sys; /* store system flag in msg id */
		// if(Flags&1)
			// ack = (ack+1)%(1<<10); /* max sequence */
		// pcd = Msg.buffer;
		header[0] = ((Flags&3)<<6)|((Msg.size>>4)&0x3f); 
		header[1] = (Msg.size&0xf);
		if(Flags&1) {
			header[1] |= (this.clientAck>>2)&0xf0;
			header[2] = this.clientAck&0xff;
		} 	
		// if (Msg.sys)
		// var latestBuf = Buffer.from([0x0, ack, 0x01, pcd[0], pcd[1], pcd[2]])
		// else
			// var latestBuf = Buffer.from([0x0, ack, 0x01, pcd[0], pcd[1], clientAck])
		// latestBuf = Buffer.concat([latestBuf, Msg.buffer, bufffff])
		var latestBuf = Buffer.from([0x0+(((16<<4)&0xf0)|((this.ack>>8)&0xf)), this.ack&0xff, 0x1, header[0], header[1], this.clientAck]);
		var latestBuf = Buffer.concat([latestBuf, Msg.buffer, this.TKEN]);
		if (this.proxyMode) {
			var packet = SocksClient.createUDPFrame({
				remoteHost: { host: this.host, port: this.port },
				data: latestBuf
			});
			if (this.hostInfo != undefined)
				this.socket.send(packet, 0, packet.length, this.hostInfo.port, this.hostInfo.host, (err, bytes) => {
					// console.log(`sent controlmsg ${msg} with ack: `, ack, bytes)	
					// resolve(bytes)
				})
		} else {
			this.socket.send(latestBuf, 0, latestBuf.length, this.port, this.host, (err, bytes) => {
				// console.log(`sent controlmsg ${msg} with ack: `, ack, bytes)	
				// resolve(bytes)
			})
		}
	}
	connect() {
		if (this.proxyMode && this.socksClient) {
			this.socksClient.on("established", (info) => {
				console.log(info.remoteHost);
				this.hostInfo = info.remoteHost;
				this.SendControlMsg(1, "TKEN")
				this.time = new Date().getTime() + 2000;
				
			})
	} else {
		this.SendControlMsg(1, "TKEN")
		this.time = new Date().getTime() + 2000;
	}
	this.socket.on("message", a => {
		if (this.proxyMode)
			a = SocksClient.parseUDPFrame(a).data;

		var unpacked: _packet = this.Unpack(a)
		// console.log(unpacked)
		if (unpacked.twprotocol.flags != 128 && unpacked.twprotocol.ack) {
			this.clientAck = unpacked.twprotocol.ack+1;
			unpacked.chunks.forEach(a => {
				if (!a.msg)
					console.log(unpacked)
				if (a.msg && !a.msg.startsWith("SNAP")) {
					if (a.seq != undefined && a.seq != -1)
						this.ack = a.seq
					
					// console.log(a.msg + " is not snap, new ack: " + this.ack, a.sequence + ", new clientAck: " + this.clientAck);
				}
			})
		}
		var chunkMessages = unpacked.chunks.map(a => a.msg)
		if (chunkMessages.includes("SV_CHAT")) {
			var chat = unpacked.chunks.filter(a => a.msg == "SV_CHAT");
			chat.forEach(a => {
				if (a.msg == "SV_CHAT") {
					// console.log(a)
					// var _chat = new MsgUnpacker("SV_CHAT", a.raw)
					// chat = msgUnpack(chat.raw)
					// console.log("emitting crash cause chat?", _chat)
					// this.emit("message", _chat)
				}
			})
		}
		if (a.toString().includes("TKEN") || arrStartsWith(a.toJSON().data, [0x10, 0x0, 0x0, 0x0])) {
			this.TKEN = Buffer.from(a.toJSON().data.slice(a.toJSON().data.length-4, a.toJSON().data.length))
			this.SendControlMsg(3);
			this.State = 2; // loading state
			var packer = new MsgPacker(1, true);
			packer.AddString("0.6 626fce9a778df4d4");
			packer.AddString(""); // password
			this.SendMsgEx(packer, 1)
		} else if (unpacked.chunks[0] && chunkMessages.includes("SV_READY_TO_ENTER")) {
			var Msg = new MsgPacker(15, true); /* entergame */
			this.SendMsgEx(Msg, 1);
		} else if ((unpacked.chunks[0] && chunkMessages.includes("CAPABILITIES") || unpacked.chunks[0] && chunkMessages.includes("MAP_CHANGE"))) {
			// send ready
			var Msg = new MsgPacker(14, true); /* ready */
			this.SendMsgEx(Msg, 1);
		} else if ((unpacked.chunks[0] && chunkMessages.includes("CON_READY") || unpacked.chunks[0] && chunkMessages.includes("SV_MOTD"))) {
			var packer = new MsgPacker(20, false);
			packer.AddString(this.name); /* name */
			packer.AddString(""); /* clan */
			packer.AddInt(-1); /* country */
			packer.AddString("greyfox"); /* skin */
			packer.AddInt(1); /* use custom color */
			packer.AddInt(10346103); /* color body */
			packer.AddInt(65535); /* color feet */
			this.SendMsgEx(packer, 1);

			// onetime.push("startinfo")
			
		} else if (unpacked.chunks[0] && chunkMessages.includes("SV_READY_TO_ENTER")) {
			
			if (this.State != 3) {
				// console.log("crash cause 19123?")
				this.emit('connected', this.index);
			}
			this.State = 3
		} else if (unpacked.chunks[0] && chunkMessages.includes("PING")) {
			var packer = new MsgPacker(23, true);
			console.log("actually sending ping reply o.o")
			this.SendMsgEx(packer, 1)
		} else if (chunkMessages.includes("SNAP") || chunkMessages.includes("SNAP_EMPTY") || chunkMessages.includes("SNAP_SINGLE")) {
			// just skip snap, nobody likes snap
			this.receivedSnaps++; /* wait for 2 ss before seeing self as connected */
			if (this.receivedSnaps >= 2) {
				if (this.State != 3)
					this.emit('connected', this.index)
				this.State = 3
			}
		} else if (unpacked.twprotocol.flags == 128 || unpacked.twprotocol.flags == 0x10) { // also skip compressed & control messages
			// flag 128 = compression flag
		} 
		else {
			
			console.log("invalid packet: ", unpacked, this.ack)
			// socket.disconnect()
		}
		if (new Date().getTime() - this.time >= 1000) {
			this.time = new Date().getTime();
			this.SendControlMsg(0);
		}
	/*	setTimeout(() => {
			if (State != 3) {
				if (message) {
					State = 0;
					message = false;
					latestBuf = Buffer.from([0x00, ack, 0x01, 0x41, 0x04, clientAck, 0x22, 0x00])
					latestBuf = Buffer.concat([latestBuf, Buffer.from("chat test blabla"), Buffer.from([0x0a, 0x00]), bufffff])
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
		}, 7500)*/
		
		// if (ack >= 100)
		// return socket.disconnect()
		// console.log(bufffff.toJSON().data)
	})
	}

}
export = Client;
// module.exports = Client;