import { randomBytes } from "crypto";

import net from 'dgram';
import { EventEmitter } from 'stream';

import { unpackString, MsgUnpacker } from "./MsgUnpacker";

import Movement from './movement';

import { MsgPacker } from './MsgPacker';
import { Snapshot } from './snapshot';
import Huffman from "./huffman";

const huff = new Huffman();

enum States {
	STATE_OFFLINE = 0,
	STATE_CONNECTING,
	STATE_LOADING,
	STATE_ONLINE,
	STATE_DEMOPLAYBACK,
	STATE_QUITTING,
	STATE_RESTARTING
}


enum NETMSGTYPE {
	EX,
	SV_MOTD,
	SV_BROADCAST,
	SV_CHAT,
	SV_KILLMSG,
	SV_SOUNDGLOBAL,
	SV_TUNEPARAMS,
	SV_EXTRAPROJECTILE,
	SV_READYTOENTER,
	SV_WEAPONPICKUP,
	SV_EMOTICON,
	SV_VOTECLEAROPTIONS,
	SV_VOTEOPTIONLISTADD,
	SV_VOTEOPTIONADD,
	SV_VOTEOPTIONREMOVE,
	SV_VOTESET,
	SV_VOTESTATUS,
	CL_SAY,
	CL_SETTEAM,
	CL_SETSPECTATORMODE,
	CL_STARTINFO,
	CL_CHANGEINFO,
	CL_KILL,
	CL_EMOTICON,
	CL_VOTE,
	CL_CALLVOTE,
	CL_ISDDNETLEGACY,
	SV_DDRACETIMELEGACY,
	SV_RECORDLEGACY,
	UNUSED,
	SV_TEAMSSTATELEGACY,
	CL_SHOWOTHERSLEGACY,
	NUM
}

interface chunk {
	bytes: number,
	flags: number,
	sequence?: number,
	seq?: number,
	type: 'sys' | 'game',
	msgid: number,
	msg: string,
	raw: Buffer,
	extended_msgid?: Buffer;
}
function toHexStream(buff: Buffer): string {
	return buff.toJSON().data.map(a => ('0' + (a & 0xff).toString(16)).slice(-2)).join("");
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

function arrStartsWith(arr: number[], arrStart: number[], start = 0) {
	arr.splice(0, start)
	for (let i = 0; i < arrStart.length; i++) {
		if (arr[i] == arrStart[i])
			continue;
		else return false;
	}
	return true;
}
declare interface PlayerInfo {
	local: number,
	client_id: number,
	team: number,
	score: number,
	latency: number,
}

declare interface ClientInfo {
	name: string,
	clan: string,
	country: number,
	skin: string,
	use_custom_color: number,
	color_body: number,
	color_feet: number,
}
declare interface iMessage {
	team: number,
	client_id: number,
	author?: { ClientInfo?: ClientInfo, PlayerInfo?: PlayerInfo },
	message: string
}

declare interface iKillMsg {
	killer_id: number,
	killer?: { ClientInfo?: ClientInfo, PlayerInfo?: PlayerInfo },
	victim_id: number,
	victim?: { ClientInfo?: ClientInfo, PlayerInfo?: PlayerInfo },
	weapon: number,
	special_mode: number
}

declare interface iOptions {
	identity?: ClientInfo,
	password?: string,
	ddnet_version?: {version: number, release_version: string},
	timeout?: number, // in ms
	NET_VERSION?: string
}

export declare interface Client {
	host: string;
	port: number;
	name: string;
	State: number; // 0 = offline; 1 = STATE_CONNECTING = 1, STATE_LOADING = 2, STATE_ONLINE = 3
	ack: number;
	clientAck: number;
	receivedSnaps: number; /* wait for 2 ss before seeing self as connected */
	lastMsg: string;
	socket: net.Socket | undefined;
	TKEN: Buffer;
	time: number;
	SnapUnpacker: Snapshot;

	timer: number;
	PredGameTick: number;
	AckGameTick: number;

	movement: Movement;

	snaps: Buffer[];

	sentChunkQueue: Buffer[];
	queueChunkEx: MsgPacker[];
	lastSendTime: number;
	lastRecvTime: number;

	lastSentMessages: {msg: MsgPacker, ack: number}[];

	// eSnapHolder: eSnap[];


	options?: iOptions;

	on(event: 'connected', listener: () => void): this;
	on(event: 'disconnect', listener: (reason: string) => void): this;

	on(event: 'message', listener: (message: iMessage) => void): this;
	on(event: 'broadcast', listener: (message: string) => void): this;
	on(event: 'kill', listener: (kill: iKillMsg) => void): this;
	on(event: 'motd', listener: (message: string) => void): this;
	
	requestResend: boolean;
}



export class Client extends EventEmitter {



	constructor(ip: string, port: number, nickname: string, options?: iOptions) {
		super();
		this.host = ip;
		this.port = port;
		this.name = nickname;
		this.AckGameTick = 0;
		this.PredGameTick = 0;
		this.SnapUnpacker = new Snapshot();
		// this.eSnapHolder = [];
		this.requestResend = false;
		
		if (options) 			
			this.options = options;

		this.timer = 0;

		this.movement = new Movement();

		this.snaps = [];

		this.sentChunkQueue = [];
		this.queueChunkEx = [];

		this.State = States.STATE_OFFLINE; // 0 = offline; 1 = STATE_CONNECTING = 1, STATE_LOADING = 2, STATE_ONLINE = 3
		this.ack = 0; // ack of messages the client has received
		this.clientAck = 0; // ack of messages the client has sent
		this.receivedSnaps = 0; /* wait for 2 snaps before seeing self as connected */
		this.lastMsg = "";
		this.socket = net.createSocket("udp4")
		this.socket.bind();

		this.TKEN = Buffer.from([255, 255, 255, 255])
		this.time = new Date().getTime() + 2000; // time (used for keepalives, start to send keepalives after 2 seconds)
		this.lastSendTime = new Date().getTime();
		this.lastRecvTime = new Date().getTime();

		this.lastSentMessages = [];

	}

	ResendAfter(lastAck: number) {
		this.clientAck = lastAck;
		

		let toResend: MsgPacker[] = [];
		this.lastSentMessages.forEach(msg => {
			if (msg.ack > lastAck)
				toResend.push(msg.msg);
		});
		toResend.forEach(a => a.flag = 1|2);
		this.SendMsgEx(toResend);
	}

	Unpack(packet: Buffer): _packet {
		var unpacked: _packet = { twprotocol: { flags: packet[0] >> 4, ack: ((packet[0]&0xf)<<8) | packet[1], chunkAmount: packet[2], size: packet.byteLength - 3 }, chunks: [] }


		if (packet.indexOf(Buffer.from([0xff, 0xff, 0xff, 0xff])) == 0 )// !(unpacked.twprotocol.flags & 8) || unpacked.twprotocol.flags == 255) // flags == 255 is connectionless (used for sending usernames)
			return unpacked;
		if (unpacked.twprotocol.flags & 4) { // resend flag
			this.ResendAfter(unpacked.twprotocol.ack);
		}
		packet = packet.slice(3)
		
		if (unpacked.twprotocol.flags & 8 && !(unpacked.twprotocol.flags & 1)) { // compression flag
			packet = huff.decompress(packet)
			if (packet.length == 1 && packet[0] == -1)
				return unpacked
		} 


		for (let i = 0; i < unpacked.twprotocol.chunkAmount; i++) {
			var chunk: chunk = {} as chunk;
			chunk.bytes = ((packet[0] & 0x3f) << 4) | (packet[1] & ((1 << 4) - 1));
			chunk.flags = (packet[0] >> 6) & 3;
			chunk.sequence = -1;

			if (chunk.flags & 1) {
				chunk.seq = ((packet[1] & 0xf0) << 2) | packet[2];
				packet = packet.slice(3) // remove flags & size
			} else
				packet = packet.slice(2)
			chunk.type = packet[0] & 1 ? "sys" : "game"; // & 1 = binary, ****_***1. e.g 0001_0111 sys, 0001_0110 game
			chunk.msgid = (packet[0] - (packet[0] & 1)) / 2;
			chunk.msg = messageTypes[packet[0] & 1][chunk.msgid];
			chunk.raw = packet.slice(1, chunk.bytes)
			Object.values(messageUUIDs).forEach((a, i) => {
				if (a.compare(packet.slice(0, 16)) == 0) {
					chunk.extended_msgid = a;
					chunk.msg = Object.keys(messageUUIDs)[i];
				}
			})

			packet = packet.slice(chunk.bytes) 
			unpacked.chunks.push(chunk)
		}
		return unpacked
	}
	SendControlMsg(msg: number, ExtraMsg: string = "") {
		this.lastSendTime = new Date().getTime();
		return new Promise((resolve, reject) => {
			if (this.socket) {
				var latestBuf = Buffer.from([0x10 + (((16 << 4) & 0xf0) | ((this.ack >> 8) & 0xf)), this.ack & 0xff, 0x00, msg])
				latestBuf = Buffer.concat([latestBuf, Buffer.from(ExtraMsg), this.TKEN]) // move header (latestBuf), optional extraMsg & TKEN into 1 buffer
				this.socket.send(latestBuf, 0, latestBuf.length, this.port, this.host, (err, bytes) => {
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

	SendMsgEx(Msgs: MsgPacker[] | MsgPacker) {
		if (this.State == States.STATE_OFFLINE)
			return; 
		if (!this.socket)
			return;
		let _Msgs: MsgPacker[];
		if (Msgs instanceof Array)
			_Msgs = Msgs;
		else
			_Msgs = [Msgs];
		if (this.queueChunkEx.length > 0) {
			_Msgs.push(...this.queueChunkEx);
			this.queueChunkEx = [];
		}
		this.lastSendTime = new Date().getTime();
		var header: Buffer[] = [];
		if (this.clientAck == 0)
			this.lastSentMessages = [];
		_Msgs.forEach((Msg: MsgPacker, index) => {
			header[index] = Buffer.alloc((Msg.flag & 1 ? 3 : 2));
			header[index][0] = ((Msg.flag & 3) << 6) | ((Msg.size >> 4) & 0x3f);
			header[index][1] = (Msg.size & 0xf);
			if (Msg.flag & 1) {
				this.clientAck = (this.clientAck + 1) % (1 << 10);
				if (this.clientAck == 0)
					this.lastSentMessages = [];
				header[index][1] |= (this.clientAck >> 2) & 0xf0;
				header[index][2] = this.clientAck & 0xff;
				header[index][0] = (((Msg.flag | 2)&3)<<6)|((Msg.size>>4)&0x3f); // 2 is resend flag (ugly hack for queue)
				if ((Msg.flag & 2) == 0)
					this.sentChunkQueue.push(Buffer.concat([header[index], Msg.buffer]));
				header[index][0] = (((Msg.flag)&3)<<6)|((Msg.size>>4)&0x3f);
				if ((Msg.flag & 2) == 0)
					this.lastSentMessages.push({msg: Msg, ack: this.clientAck})
			}
		})
		let flags = 0;
		if (this.requestResend)
			flags |= 4;
		
		var packetHeader = Buffer.from([((flags<<4)&0xf0)|((this.ack>>8)&0xf), this.ack & 0xff, _Msgs.length]);
		var chunks = Buffer.from([]);
		let skip = false;
		_Msgs.forEach((Msg: MsgPacker, index) => {
			if (skip)
				return;
			if (chunks.byteLength < 1300)
				chunks = Buffer.concat([chunks, Buffer.from(header[index]), Msg.buffer]);
			else {
				skip = true;
				this.SendMsgEx(_Msgs.slice(index));
			}
		})
		var packet = Buffer.concat([(packetHeader), chunks, this.TKEN]);
		if (chunks.length < 0)
			return;
		this.socket.send(packet, 0, packet.length, this.port, this.host)
	}

	QueueChunkEx(Msg: MsgPacker) {
		this.queueChunkEx.push(Msg);
	}

	SendMsgRaw(chunks: Buffer[]) {
		if (this.State == States.STATE_OFFLINE)
			return;
		if (!this.socket)
			return;

		this.lastSendTime = new Date().getTime();

		var packetHeader = Buffer.from([0x0+(((16<<4)&0xf0)|((this.ack>>8)&0xf)), this.ack&0xff, chunks.length]);

		var packet = Buffer.concat([(packetHeader), Buffer.concat(chunks), this.TKEN]);
		if (chunks.length < 0)
			return;
		this.socket.send(packet, 0, packet.length, this.port, this.host)
	}

	MsgToChunk(packet: Buffer) {
		var chunk: chunk = {} as chunk;
		chunk.bytes = ((packet[0] & 0x3f) << 4) | (packet[1] & ((1 << 4) - 1));
		chunk.flags = (packet[0] >> 6) & 3;
		chunk.sequence = -1;
		
		if (chunk.flags & 1) {
			chunk.seq = ((packet[1]&0xf0)<<2) | packet[2];
			packet = packet.slice(3) // remove flags & size
		} else
			packet = packet.slice(2)
		chunk.type = packet[0] & 1 ? "sys" : "game"; // & 1 = binary, ****_***1. e.g 0001_0111 sys, 0001_0110 game
		chunk.msgid = (packet[0]-(packet[0]&1))/2;
		chunk.msg = messageTypes[packet[0]&1][chunk.msgid];
		chunk.raw = packet.slice(1, chunk.bytes)
		Object.values(messageUUIDs).forEach((a, i) => {
			if (a.compare(packet.slice(0, 16)) === 0) {
				chunk.extended_msgid = a;
				chunk.msg = Object.keys(messageUUIDs)[i];
			}
		})
		return chunk;
	}

	connect() {
		this.State = States.STATE_CONNECTING;

		let predTimer = setInterval(() => {
			if (this.State == States.STATE_ONLINE) {
				if (this.AckGameTick > 0)
					this.PredGameTick++;
			} else if (this.State == States.STATE_OFFLINE) 
				clearInterval(predTimer);
			
		}, 20);

		this.SendControlMsg(1, "TKEN")
		let connectInterval = setInterval(() => {
			if (this.State == States.STATE_CONNECTING)
				this.SendControlMsg(1, "TKEN")
			else
				clearInterval(connectInterval)
		}, 500);

		let inputInterval = setInterval(() => {
			if (this.State == States.STATE_OFFLINE)
				clearInterval(inputInterval)
			if (this.State != States.STATE_ONLINE)
				return;
			this.time = new Date().getTime();
			this.sendInput();
		}, 500)

		let resendTimeout = setInterval(() => {
			if (this.State != States.STATE_OFFLINE) {
				if (((new Date().getTime()) - this.lastSendTime) > 900 && this.sentChunkQueue.length > 0) {
					this.SendMsgRaw([this.sentChunkQueue[0]]);
				}
			} else
				clearInterval(resendTimeout)
		}, 1000)
		
		let Timeout = setInterval(() => {
			let timeoutTime = this.options?.timeout ? this.options.timeout : 15000;
			if ((new Date().getTime() - this.lastRecvTime) > timeoutTime) {
				this.State = States.STATE_OFFLINE;
				this.emit("timeout");
				this.emit("disconnect", "Timed Out. (no packets received for " + (new Date().getTime() - this.lastRecvTime) + "ms)");
				clearInterval(Timeout);
			}
		}, 5000)

		this.time = new Date().getTime() + 2000; // start sending keepalives after 2s

		if (this.socket)
			this.socket.on("message", (a, rinfo) => {
				if (this.State == 0 || rinfo.address != this.host || rinfo.port != this.port)
					return;
				clearInterval(connectInterval)
				if (a.toJSON().data[0] == 0x10) {
					if (a.toString().includes("TKEN") || a.toJSON().data[3] == 0x2) {
						clearInterval(connectInterval);
						this.TKEN = Buffer.from(a.toJSON().data.slice(a.toJSON().data.length - 4, a.toJSON().data.length))
						this.SendControlMsg(3);
						this.State = States.STATE_LOADING; // loading state
						this.receivedSnaps = 0;
						
						var info = new MsgPacker(1, true, 1);
						info.AddString(this.options?.NET_VERSION ? this.options.NET_VERSION : "0.6 626fce9a778df4d4");
						info.AddString(this.options?.password === undefined ? "" : this.options?.password); // password

						var client_version = new MsgPacker(0, true, 1);
						client_version.AddBuffer(Buffer.from("8c00130484613e478787f672b3835bd4", 'hex'));
						let randomUuid = Buffer.alloc(16);

						randomBytes(16).copy(randomUuid);

						client_version.AddBuffer(randomUuid);
						if (this.options?.ddnet_version !== undefined) {
							client_version.AddInt(this.options?.ddnet_version.version);
							client_version.AddString("DDNet " + this.options?.ddnet_version.release_version);
						} else {
							client_version.AddInt(16003);
							client_version.AddString("DDNet 16.0.3");
						}
		
						this.SendMsgEx([client_version, info])
					} else if (a.toJSON().data[3] == 0x4) {
						// disconnected
						this.State = States.STATE_OFFLINE;
						let reason: string = (unpackString(a.toJSON().data.slice(4)).result);
						this.emit("disconnect", reason);
					} 
					if (a.toJSON().data[3] !== 0x0) { // keepalive
						this.lastRecvTime = new Date().getTime();
					}
				} else {
					this.lastRecvTime = new Date().getTime();

				}

				
				var unpacked: _packet = this.Unpack(a);
				unpacked.chunks.forEach(a => {
					if (a.flags & 1 && (a.flags !== 15)) { // vital and not connless
						if (a.seq === (this.ack+1)%(1<<10)) { // https://github.com/nobody-mb/twchatonly/blob/master/chatonly.cpp#L237
							this.ack = a.seq!;
							
							this.requestResend = false;
						}
						else { //IsSeqInBackroom (old packet that we already got)
							let Bottom = (this.ack - (1<<10)/2);
							
							if(Bottom < 0) {
								if((a.seq! <= this.ack) || (a.seq! >= (Bottom + (1<<10))))
									return;
							} else {
								if(a.seq! <= this.ack && a.seq! >= Bottom)
									return;
							}
							this.requestResend = true;
							
						}
					}

				})
				unpacked.chunks.filter(a => a.msgid == NETMSGTYPE.SV_BROADCAST && a.type == 'game').forEach(a => {
					let unpacker = new MsgUnpacker(a.raw.toJSON().data);

					this.emit("broadcast", unpacker.unpackString());
				})
				this.sentChunkQueue.forEach((buff, i) => {
					let chunk = this.MsgToChunk(buff);
					if (chunk.flags & 1) {
						if (chunk.seq && chunk.seq >= this.ack)
							this.sentChunkQueue.splice(i, 1);
					} 
				})
				var snapChunks = unpacked.chunks.filter(a => a.msg === "SNAP" || a.msg === "SNAP_SINGLE" || a.msg === "SNAP_EMPTY");
				if (snapChunks.length > 0) {
					let part = 0;
					let num_parts = 1;
					snapChunks.forEach(chunk => {
						let unpacker = new MsgUnpacker(chunk.raw.toJSON().data);
			
						let AckGameTick = unpacker.unpackInt();
						
						let DeltaTick = AckGameTick - unpacker.unpackInt();
						if (AckGameTick >= this.AckGameTick) {
							if (this.AckGameTick == -1) {// reset ack
								if (DeltaTick == -1) {// acked reset
									this.AckGameTick = AckGameTick;
								}
							} else
								this.AckGameTick = AckGameTick;
							if (Math.abs(this.PredGameTick - this.AckGameTick) > 10)
								this.PredGameTick = AckGameTick + 1;
						
						let num_parts = 1;
						let part = 0;

						if (chunk.msg === "SNAP") {
							num_parts = unpacker.unpackInt();
							part = unpacker.unpackInt();
						}
						
						let crc = 0;
						let part_size = 0;
						if (chunk.msg != "SNAP_EMPTY") {
							crc = unpacker.unpackInt(); // crc
							part_size = unpacker.unpackInt();
						}
						if (part === 0 || this.snaps.length > 30) {
							this.snaps = [];
						}
						chunk.raw = Buffer.from(unpacker.remaining);
						this.snaps.push(chunk.raw)
							
						if ((num_parts - 1) === part && this.snaps.length === num_parts) {

							let mergedSnaps = Buffer.concat(this.snaps);

							let snapUnpacked = this.SnapUnpacker.unpackSnapshot(mergedSnaps.toJSON().data, DeltaTick, AckGameTick);
							this.AckGameTick = snapUnpacked.recvTick;
							
							this.emit("snapshot");
							
							this.sendInput();
						}

					}
					})
				}
				var chunkMessages = unpacked.chunks.map(a => a.msg)
				if (chunkMessages.includes("SV_CHAT")) {
					var chat = unpacked.chunks.filter(a => a.msg == "SV_CHAT");
					chat.forEach(a => {
						if (a.msg == "SV_CHAT") {
							let unpacker = new MsgUnpacker(a.raw.toJSON().data);
							var unpacked: iMessage = {
								team: unpacker.unpackInt(),
								client_id: unpacker.unpackInt(),
								message: unpacker.unpackString()
							} as iMessage;

							if (unpacked.client_id != -1) {
								unpacked.author = { 
									ClientInfo: this.client_info(unpacked.client_id), 
									PlayerInfo: this.player_info(unpacked.client_id) 
								}
							}
							this.emit("message", unpacked)
						}
					})
				}
					var chat = unpacked.chunks.filter(a => a.msg == "SV_KILL_MSG" || a.msg == "SV_MOTD");
					chat.forEach(a => {
						if (a.msg == "SV_KILL_MSG") {
							var unpacked: iKillMsg = {} as iKillMsg;
							let unpacker = new MsgUnpacker(a.raw.toJSON().data);
							unpacked.killer_id = unpacker.unpackInt();
							unpacked.victim_id = unpacker.unpackInt();
							unpacked.weapon = unpacker.unpackInt();
							unpacked.special_mode = unpacker.unpackInt();
							if (unpacked.victim_id != -1 && unpacked.victim_id < 64) {
								unpacked.victim = { ClientInfo: this.client_info(unpacked.victim_id), PlayerInfo: this.player_info(unpacked.victim_id) }

							}
							if (unpacked.killer_id != -1 && unpacked.killer_id < 64)
								unpacked.killer = { ClientInfo: this.client_info(unpacked.killer_id), PlayerInfo: this.player_info(unpacked.killer_id) }
							this.emit("kill", unpacked)
						} else if (a.msg == "SV_MOTD") {
							let unpacker = new MsgUnpacker(a.raw.toJSON().data);
							let message = unpacker.unpackString();
							this.emit("motd", message);
						}
					})

				if (unpacked.chunks[0] && chunkMessages.includes("SV_READY_TO_ENTER")) {
					var Msg = new MsgPacker(15, true, 1); /* entergame */
					this.SendMsgEx(Msg);
				} else if ((unpacked.chunks[0] && chunkMessages.includes("CAPABILITIES") || unpacked.chunks[0] && chunkMessages.includes("MAP_CHANGE"))) {
					// send ready
					var Msg = new MsgPacker(14, true, 1); /* ready */
					this.SendMsgEx(Msg);
				} else if ((unpacked.chunks[0] && chunkMessages.includes("CON_READY"))) {
					var info = new MsgPacker(20, false, 1);
					if (this.options?.identity) {
						info.AddString(this.options.identity.name); 
						info.AddString(this.options.identity.clan); 
						info.AddInt(this.options.identity.country); 
						info.AddString(this.options.identity.skin); 
						info.AddInt(this.options.identity.use_custom_color);
						info.AddInt(this.options.identity.color_body); 
						info.AddInt(this.options.identity.color_feet); 
					} else {
						info.AddString(this.name); /* name */
						info.AddString(""); /* clan */
						info.AddInt(-1); /* country */
						info.AddString("greyfox"); /* skin */
						info.AddInt(1); /* use custom color */
						info.AddInt(10346103); /* color body */
						info.AddInt(65535); /* color feet */

					}
					var crashmeplx = new MsgPacker(17, true, 1); // rcon
					crashmeplx.AddString("crashmeplx"); // 64 player support message
					this.SendMsgEx([info, crashmeplx]);



				} else if (unpacked.chunks[0] && chunkMessages.includes("PING")) {
					var info = new MsgPacker(23, true, 1);
					this.SendMsgEx(info)
				}
				if (chunkMessages.includes("SNAP") || chunkMessages.includes("SNAP_EMPTY") || chunkMessages.includes("SNAP_SINGLE")) {
					this.receivedSnaps++; /* wait for 2 ss before seeing self as connected */
					if (this.receivedSnaps == 2) {
						if (this.State != States.STATE_ONLINE)
							this.emit('connected')
						this.State = States.STATE_ONLINE;
					}

				}
				if (new Date().getTime() - this.time >= 1000 && this.State == States.STATE_ONLINE) {
					this.time = new Date().getTime();
					this.SendControlMsg(0);
				}
			})
	}

	sendInput(input = this.movement.input) {
		if (this.State != States.STATE_ONLINE)
			return;

		let inputMsg = new MsgPacker(16, true, 0);
		inputMsg.AddInt(this.AckGameTick);
		inputMsg.AddInt(this.PredGameTick);
		inputMsg.AddInt(40);

		let input_data = [

			input.m_Direction,
			input.m_TargetX,
			input.m_TargetY,
			input.m_Jump,
			input.m_Fire,
			input.m_Hook,
			input.m_PlayerFlags,
			input.m_WantedWeapon,
			input.m_NextWeapon,
			input.m_PrevWeapon
		]
		input_data.forEach(a => {
			inputMsg.AddInt(a);
		});
		this.SendMsgEx(inputMsg);
	}
	get input() {
		return this.movement.input;
	}

	Disconnect() {
		return new Promise((resolve) => {
			this.SendControlMsg(4).then(() => {
				resolve(true);
				if (this.socket)
					this.socket.close();
				this.socket = undefined
				this.State = States.STATE_OFFLINE;
			})
		})
	}

	Say(message: string, team = false) {
		var packer = new MsgPacker(NETMSGTYPE.CL_SAY, false, 1);
		packer.AddInt(team ? 1 : 0); // team
		packer.AddString(message);
		this.QueueChunkEx(packer);
	}
	Vote(vote: boolean) {
		var packer = new MsgPacker(NETMSGTYPE.CL_VOTE, false, 1);
		packer.AddInt(vote ? 1 : -1);
		this.QueueChunkEx(packer);
	}
	ChangePlayerInfo(playerInfo: ClientInfo) {
		var packer = new MsgPacker(NETMSGTYPE.CL_CHANGEINFO, false, 1);
		packer.AddString(playerInfo.name); //m_pName);
		packer.AddString(playerInfo.clan); //m_pClan);
		packer.AddInt(playerInfo.country); //m_Country);
		packer.AddString(playerInfo.skin); //m_pSkin);
		packer.AddInt(playerInfo.use_custom_color ? 1 : 0); //m_UseCustomColor);
		packer.AddInt(playerInfo.color_body); //m_ColorBody);
		packer.AddInt(playerInfo.color_feet); //m_ColorFeet);
		this.QueueChunkEx(packer);
	}
	Kill() {
		var packer = new MsgPacker(NETMSGTYPE.CL_KILL, false, 1);
		this.QueueChunkEx(packer);
	}
	ChangeTeam(team: number) {
		var packer = new MsgPacker(NETMSGTYPE.CL_SETTEAM, false, 1);
		packer.AddInt(team);
		this.QueueChunkEx(packer);
	}
	Emote(emote: number) {
		var packer = new MsgPacker(NETMSGTYPE.CL_EMOTICON, false, 1);
		packer.AddInt(emote);
		this.QueueChunkEx(packer);
	}
	client_info(id: number) {
		let delta = this.SnapUnpacker.deltas.filter(a => 
			a.type_id == 11 
			&& a.id == id
		);

		if (delta.length == 0)
			return undefined;
		return delta[0].parsed as ClientInfo;
			// .sort((a, b) => a.id - b.id)
			// .map(a => a.parsed as ClientInfo);
	}
	get client_infos(): ClientInfo[] {
		
		return this.SnapUnpacker.deltas.filter(a => a.type_id == 11)
			.sort((a, b) => a.id - b.id)
			.map(a => a.parsed as ClientInfo) ;
	}
	player_info(id: number) {
		let delta = this.SnapUnpacker.deltas.filter(a => 
			a.type_id == 10
			&& a.id == id
		);

		if (delta.length == 0)
			return undefined;
		return delta[0].parsed as PlayerInfo;
	}
	get player_infos(): PlayerInfo[] {
		return this.SnapUnpacker.deltas.filter(a => a.type_id == 10)
			.sort((a, b) => a.id - b.id)
			.map(a => a.parsed as PlayerInfo);
	}
}
