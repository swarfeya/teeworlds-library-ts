import { randomBytes } from "crypto";

import net from 'dgram';
import { EventEmitter } from 'stream';

import { unpackString, MsgUnpacker } from "./MsgUnpacker";
let { version } = require('../package.json');

import Movement from './components/movement';
import { PlayerInput, PlayerInfo, Projectile, Laser, Pickup, Flag, GameInfo, GameData, CharacterCore, Character, ClientInfo, SpectatorInfo, Common, Explosion, Spawn, HammerHit, Death, SoundGlobal, SoundWorld, DamageInd } from "./snapshots";

import { MsgPacker } from './MsgPacker';
import { Item, Snapshot } from './snapshot';
import Huffman from "./huffman";
import { Game } from "./components/game";
import { SnapshotWrapper } from "./components/snapshot";

import { UUIDManager } from "./UUIDManager";

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


enum NETMSG_Game {
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

enum NETMSG_Sys {
	NETMSG_EX = 0,

	// the first thing sent by the client
	// contains the version info for the client
	NETMSG_INFO = 1,

	// sent by server
	NETMSG_MAP_CHANGE, // sent when client should switch map
	NETMSG_MAP_DATA, // map transfer, contains a chunk of the map file
	NETMSG_CON_READY, // connection is ready, client should send start info
	NETMSG_SNAP, // normal snapshot, multiple parts
	NETMSG_SNAPEMPTY, // empty snapshot
	NETMSG_SNAPSINGLE, // ?
	NETMSG_SNAPSMALL, //
	NETMSG_INPUTTIMING, // reports how off the input was
	NETMSG_RCON_AUTH_STATUS, // result of the authentication
	NETMSG_RCON_LINE, // line that should be printed to the remote console

	NETMSG_AUTH_CHALLANGE, //
	NETMSG_AUTH_RESULT, //

	// sent by client
	NETMSG_READY, //
	NETMSG_ENTERGAME,
	NETMSG_INPUT, // contains the inputdata from the client
	NETMSG_RCON_CMD, //
	NETMSG_RCON_AUTH, //
	NETMSG_REQUEST_MAP_DATA, //

	NETMSG_AUTH_START, //
	NETMSG_AUTH_RESPONSE, //

	// sent by both
	NETMSG_PING,
	NETMSG_PING_REPLY,
	NETMSG_ERROR,

	// sent by server (todo: move it up)
	NETMSG_RCON_CMD_ADD,
	NETMSG_RCON_CMD_REM,

	NUM_NETMSGS,

	NETMSG_WHATIS = 65536,
	NETMSG_ITIS,
	NETMSG_IDONTKNOW,

	NETMSG_RCONTYPE,
	NETMSG_MAP_DETAILS,
	NETMSG_CAPABILITIES,
	NETMSG_CLIENTVER,
	NETMSG_PINGEX,
	NETMSG_PONGEX,
	NETMSG_CHECKSUM_REQUEST,
	NETMSG_CHECKSUM_RESPONSE,
	NETMSG_CHECKSUM_ERROR,

	NETMSG_REDIRECT,

	NETMSG_I_AM_NPM_PACKAGE

}

interface chunk {
	bytes: number,
	flags: number,
	sequence?: number,
	seq?: number,
	// type: 'sys' | 'game',
	sys: Boolean,
	msgid: number,
	msg: string,
	raw: Buffer,
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


declare interface iMessage {
	team: number,
	client_id: number,
	author?: { ClientInfo?: ClientInfo, PlayerInfo?: PlayerInfo },
	message: string
}

declare interface iEmoticon {
	client_id: number,
	emoticon: number,
	author?: { ClientInfo?: ClientInfo, PlayerInfo?: PlayerInfo }
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
	NET_VERSION?: string,
	lightweight?: boolean // experimental, only sends keepalive's (sendinput has to be called manually)
}

export declare interface Client {
	

	on(event: 'connected', listener: () => void): this;
	on(event: 'disconnect', listener: (reason: string) => void): this;

	on(event: 'emote', listener: (message: iEmoticon) => void): this;
	on(event: 'message', listener: (message: iMessage) => void): this;
	on(event: 'broadcast', listener: (message: string) => void): this;
	on(event: 'kill', listener: (kill: iKillMsg) => void): this;
	on(event: 'motd', listener: (message: string) => void): this;
	
	on(event: 'map_details', listener: (message: {map_name: string, map_sha256: Buffer, map_crc: number, map_size: number, map_url: string}) => void): this;
	on(event: 'capabilities', listener: (message: {ChatTimeoutCode: boolean, AnyPlayerFlag: boolean, PingEx: boolean, AllowDummy: boolean, SyncWeaponInput: boolean}) => void): this;
	
	on(event: 'snapshot', listener: (items: Item[]) => void): this;
}

export class Client extends EventEmitter {

	private host: string;
	private port: number;
	private name: string;
	private State: number; // 0 = offline; 1 = STATE_CONNECTING = 1, STATE_LOADING = 2, STATE_ONLINE = 3
	private ack: number;
	private clientAck: number;
	private receivedSnaps: number; /* wait for 2 ss before seeing self as connected */
	private socket: net.Socket | undefined;
	private TKEN: Buffer;
	private time: number;
	private SnapUnpacker: Snapshot;

	public SnapshotUnpacker: SnapshotWrapper;

	private PredGameTick: number;
	private AckGameTick: number;
	
	private SnapshotParts: number;
	private currentSnapshotGameTick: number;

	
	private snaps: Buffer[];
	
	private sentChunkQueue: Buffer[];
	private queueChunkEx: MsgPacker[];
	private lastSendTime: number;
	private lastRecvTime: number;

	private lastSentMessages: {msg: MsgPacker, ack: number}[];
	

	public movement: Movement;
	public game: Game;

	private VoteList: string[];
	// eSnapHolder: eSnap[];


	public readonly options?: iOptions;
	private requestResend: boolean;

	private UUIDManager: UUIDManager;
  
	constructor(ip: string, port: number, nickname: string, options?: iOptions) {
		super();
		this.host = ip;
		this.port = port;
		this.name = nickname;
		this.AckGameTick = 0;
		this.PredGameTick = 0;
		this.currentSnapshotGameTick = 0;

		this.SnapshotParts = 0;
		
		this.SnapUnpacker = new Snapshot(this);
		// this.eSnapHolder = [];
		this.requestResend = false;
		
		this.VoteList = [];

		if (options) 			
			this.options = options;

			
		this.snaps = [];

		this.sentChunkQueue = [];
		this.queueChunkEx = [];

		this.State = States.STATE_OFFLINE; // 0 = offline; 1 = STATE_CONNECTING = 1, STATE_LOADING = 2, STATE_ONLINE = 3
		this.ack = 0; // ack of messages the client has received
		this.clientAck = 0; // ack of messages the client has sent
		this.receivedSnaps = 0; /* wait for 2 snaps before seeing self as connected */
		this.socket = net.createSocket("udp4");
		this.socket.bind();

		this.TKEN = Buffer.from([255, 255, 255, 255])
		this.time = new Date().getTime() + 2000; // time (used for keepalives, start to send keepalives after 2 seconds)
		this.lastSendTime = new Date().getTime();
		this.lastRecvTime = new Date().getTime();

		this.lastSentMessages = [];

		this.movement = new Movement();
		
		this.game = new Game(this);
		this.SnapshotUnpacker = new SnapshotWrapper(this);

		this.UUIDManager = new UUIDManager();
		
		this.UUIDManager.RegisterName("i-dont-know@ddnet.tw", NETMSG_Sys.NETMSG_IDONTKNOW);
		this.UUIDManager.RegisterName("what-is@ddnet.tw", NETMSG_Sys.NETMSG_WHATIS);
		this.UUIDManager.RegisterName("it-is@ddnet.tw", NETMSG_Sys.NETMSG_ITIS);
		this.UUIDManager.RegisterName("i-dont-know@ddnet.tw", NETMSG_Sys.NETMSG_IDONTKNOW);

		this.UUIDManager.RegisterName("rcon-type@ddnet.tw", NETMSG_Sys.NETMSG_RCONTYPE);
		this.UUIDManager.RegisterName("map-details@ddnet.tw", NETMSG_Sys.NETMSG_MAP_DETAILS);
		this.UUIDManager.RegisterName("capabilities@ddnet.tw", NETMSG_Sys.NETMSG_CAPABILITIES);
		this.UUIDManager.RegisterName("clientver@ddnet.tw", NETMSG_Sys.NETMSG_CLIENTVER);
		this.UUIDManager.RegisterName("ping@ddnet.tw", NETMSG_Sys.NETMSG_PING);
		this.UUIDManager.RegisterName("pong@ddnet.tw", NETMSG_Sys.NETMSG_PONGEX);
		this.UUIDManager.RegisterName("checksum-request@ddnet.tw", NETMSG_Sys.NETMSG_CHECKSUM_REQUEST);
		this.UUIDManager.RegisterName("checksum-response@ddnet.tw", NETMSG_Sys.NETMSG_CHECKSUM_RESPONSE);
		this.UUIDManager.RegisterName("checksum-error@ddnet.tw", NETMSG_Sys.NETMSG_CHECKSUM_ERROR);
		this.UUIDManager.RegisterName("redirect@ddnet.org", NETMSG_Sys.NETMSG_REDIRECT);

		this.UUIDManager.RegisterName("i-am-npm-package@swarfey.gitlab.io", NETMSG_Sys.NETMSG_I_AM_NPM_PACKAGE);

	}

	private ResendAfter(lastAck: number) {
		this.clientAck = lastAck;
		

		let toResend: MsgPacker[] = [];
		this.lastSentMessages.forEach(msg => {
			if (msg.ack > lastAck)
				toResend.push(msg.msg);
		});
		toResend.forEach(a => a.flag = 1|2);
		this.SendMsgEx(toResend);
	}

	private Unpack(packet: Buffer): _packet {
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
			// chunk.type = packet[0] & 1 ? "sys" : "game"; // & 1 = binary, ****_***1. e.g 0001_0111 sys, 0001_0110 game
			chunk.sys = Boolean(packet[0] & 1); // & 1 = binary, ****_***1. e.g 0001_0111 sys, 0001_0110 game
			chunk.msgid = (packet[0] - (packet[0] & 1)) / 2;
			chunk.msg = messageTypes[packet[0] & 1][chunk.msgid];
			chunk.raw = packet.slice(1, chunk.bytes)
			if (chunk.msgid == 0 && chunk.raw.byteLength >= 16) {
				let uuid = this.UUIDManager.LookupUUID(chunk.raw.slice(0, 16));
				if (uuid !== undefined) {
					chunk.extended_msgid = uuid.hash;
					chunk.msg = uuid.name;
					chunk.raw = chunk.raw.slice(16);
					chunk.msgid = uuid.type_id;
				}
			}

			packet = packet.slice(chunk.bytes) 
			unpacked.chunks.push(chunk)
		}
		return unpacked
	}

	
	/**  Send a Control Msg to the server. (used for disconnect)*/
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

	
	/**  Send a Msg (or Msg[]) to the server.*/
	SendMsgEx(Msgs: MsgPacker[] | MsgPacker, flags = 0) { 
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
		// let flags = 0;
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
	
	/** Queue a chunk (It will get sent in the next packet). */
	QueueChunkEx(Msg: MsgPacker) {
		this.queueChunkEx.push(Msg);
	}
	
	/**  Send a Raw Buffer (as chunk) to the server. */
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

	private MsgToChunk(packet: Buffer) {
		var chunk: chunk = {} as chunk;
		chunk.bytes = ((packet[0] & 0x3f) << 4) | (packet[1] & ((1 << 4) - 1));
		chunk.flags = (packet[0] >> 6) & 3;
		chunk.sequence = -1;
		
		if (chunk.flags & 1) {
			chunk.seq = ((packet[1]&0xf0)<<2) | packet[2];
			packet = packet.slice(3) // remove flags & size
		} else
			packet = packet.slice(2)
		// chunk.type = packet[0] & 1 ? "sys" : "game"; // & 1 = binary, ****_***1. e.g 0001_0111 sys, 0001_0110 game
		chunk.sys = Boolean(packet[0] & 1); // & 1 = binary, ****_***1. e.g 0001_0111 sys, 0001_0110 game
		chunk.msgid = (packet[0]-(packet[0]&1))/2;
		chunk.msg = messageTypes[packet[0]&1][chunk.msgid];
		chunk.raw = packet.slice(1, chunk.bytes)
		if (chunk.msgid == 0) {
			let uuid = this.UUIDManager.LookupUUID(chunk.raw.slice(0,16));
			if (uuid !== undefined) {
				chunk.extended_msgid = uuid.hash;
				chunk.msgid = uuid.type_id;
				chunk.msg = uuid.name;
				chunk.raw = chunk.raw.slice(16);
			}	
			
		}
		return chunk;
	}

	
	/** Connect the client to the server. */
	connect() { 
		this.State = States.STATE_CONNECTING;

		let predTimer = setInterval(() => {
			if (this.State == States.STATE_ONLINE) {
				if (this.AckGameTick > 0)
					this.PredGameTick++;
			} else if (this.State == States.STATE_OFFLINE) 
				clearInterval(predTimer);
			
		}, 1000/50); // 50 ticks per second

		this.SendControlMsg(1, "TKEN")
		let connectInterval = setInterval(() => {
			if (this.State == States.STATE_CONNECTING)
				this.SendControlMsg(1, "TKEN")
			else
				clearInterval(connectInterval)
		}, 500);
		if (!this.options?.lightweight) {
			let inputInterval = setInterval(() => {
				if (this.State == States.STATE_OFFLINE)
					clearInterval(inputInterval)
				if (this.State != States.STATE_ONLINE)
					return;
				this.time = new Date().getTime();
				this.sendInput();
			}, 50)
		}

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
			this.socket.on("message", (packet, rinfo) => {
				if (this.State == 0 || rinfo.address != this.host || rinfo.port != this.port)
					return;
				clearInterval(connectInterval)
				
				if (packet[0] == 0x10) {
					if (packet.toString().includes("TKEN") || packet[3] == 0x2) {
						clearInterval(connectInterval);
						this.TKEN = packet.slice(-4)
						this.SendControlMsg(3);
						this.State = States.STATE_LOADING; // loading state
						this.receivedSnaps = 0;
						
						var info = new MsgPacker(1, true, 1);
						info.AddString(this.options?.NET_VERSION ? this.options.NET_VERSION : "0.6 626fce9a778df4d4");
						info.AddString(this.options?.password === undefined ? "" : this.options?.password); // password

						var client_version = new MsgPacker(0, true, 1);
						client_version.AddBuffer(Buffer.from("8c00130484613e478787f672b3835bd4", 'hex'));
						let randomUuid = randomBytes(16);

						client_version.AddBuffer(randomUuid);
						if (this.options?.ddnet_version !== undefined) {
							client_version.AddInt(this.options?.ddnet_version.version);
							client_version.AddString(`DDNet ${this.options?.ddnet_version.release_version}; https://www.npmjs.com/package/teeworlds/v/${version}`);
						} else {
							client_version.AddInt(16050);
							client_version.AddString(`DDNet 16.5.0; https://www.npmjs.com/package/teeworlds/v/${version}`);
						}
		
						var i_am_npm_package = new MsgPacker(0, true, 1);
						i_am_npm_package.AddBuffer(this.UUIDManager.LookupType(NETMSG_Sys.NETMSG_I_AM_NPM_PACKAGE)!.hash);
									
						i_am_npm_package.AddString(`https://www.npmjs.com/package/teeworlds/v/${version}`);


						this.SendMsgEx([client_version, info, i_am_npm_package])
					} else if (packet[3] == 0x4) {
						// disconnected
						this.State = States.STATE_OFFLINE;
						let reason: string = (unpackString(packet.slice(4)).result);
						this.emit("disconnect", reason);
					} 
					if (packet[3] !== 0x0) { // keepalive
						this.lastRecvTime = new Date().getTime();
					}
				} else {
					this.lastRecvTime = new Date().getTime();
				}
				
				var unpacked: _packet = this.Unpack(packet);
				unpacked.chunks = unpacked.chunks.filter(chunk => ((chunk.flags & 2) && (chunk.flags & 1)) ? chunk.seq! > this.ack : true); // filter out already received chunks
				
				unpacked.chunks.forEach(chunk => {
					if (chunk.flags & 1 && (chunk.flags !== 15)) { // vital and not connless
						if (chunk.seq === (this.ack+1)%(1<<10)) { // https://github.com/nobody-mb/twchatonly/blob/master/chatonly.cpp#L237
							this.ack = chunk.seq!;
							
							this.requestResend = false;
						}
						else { //IsSeqInBackroom (old packet that we already got)
							let Bottom = (this.ack - (1<<10)/2);
							
							if(Bottom < 0) {
								if((chunk.seq! <= this.ack) || (chunk.seq! >= (Bottom + (1<<10))))
									return;
							} else {
								if(chunk.seq! <= this.ack && chunk.seq! >= Bottom)
									return;
							}
							this.requestResend = true;
							
						}
					}

				})
				this.sentChunkQueue.forEach((buff, i) => {
					let chunkFlags = (buff[0] >> 6) & 3;
					if (chunkFlags & 1) {
						let chunk = this.MsgToChunk(buff);
						if (chunk.seq && chunk.seq >= this.ack)
							this.sentChunkQueue.splice(i, 1);
					} 
				})
				
				
				unpacked.chunks.forEach((chunk, index) => {
					if (chunk.sys) { 
						// system messages
						if (chunk.msgid == NETMSG_Sys.NETMSG_PING) { // ping
							let packer = new MsgPacker(NETMSG_Sys.NETMSG_PING_REPLY, true, 0);

							this.SendMsgEx(packer); // send ping reply
						} else if (chunk.msgid == NETMSG_Sys.NETMSG_PING_REPLY) { // Ping reply
							this.game._ping_resolve(new Date().getTime())
						} 

						// packets neccessary for connection
						// https://ddnet.org/docs/libtw2/connection/

						if (chunk.msgid == NETMSG_Sys.NETMSG_MAP_CHANGE) {
							var Msg = new MsgPacker(NETMSG_Sys.NETMSG_READY, true, 1); /* ready */
							this.SendMsgEx(Msg);		
						} else if (chunk.msgid == NETMSG_Sys.NETMSG_CON_READY) {
							var info = new MsgPacker(NETMSG_Game.CL_STARTINFO, false, 1);
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
						} 

						if (chunk.msgid >= NETMSG_Sys.NETMSG_SNAP && chunk.msgid <= NETMSG_Sys.NETMSG_SNAPSINGLE) {
							this.receivedSnaps++; /* wait for 2 ss before seeing self as connected */
							if (this.receivedSnaps == 2) {
								if (this.State != States.STATE_ONLINE)
									this.emit('connected')
								this.State = States.STATE_ONLINE;
							}
							if (Math.abs(this.PredGameTick - this.AckGameTick) > 10)
						this.PredGameTick = this.AckGameTick + 1;

					// snapChunks.forEach(chunk => {
						let unpacker = new MsgUnpacker(chunk.raw);
			
						let NumParts = 1;
						let Part = 0;
						let GameTick = unpacker.unpackInt();
						let DeltaTick = GameTick - unpacker.unpackInt();
						let PartSize = 0;
						let Crc = 0;
						let CompleteSize = 0;

						if (chunk.msgid == NETMSG_Sys.NETMSG_SNAP) {
							NumParts = unpacker.unpackInt();
							Part = unpacker.unpackInt();
						}	

						if (chunk.msgid != NETMSG_Sys.NETMSG_SNAPEMPTY) {
							Crc = unpacker.unpackInt();
							PartSize = unpacker.unpackInt();
						}

						if (PartSize < 1 || NumParts > 64 || Part < 0 || Part >= NumParts || PartSize <= 0 || PartSize > 900)
							return;

						if (GameTick >= this.currentSnapshotGameTick) {
							if (GameTick != this.currentSnapshotGameTick) {
								this.snaps = [];
								this.SnapshotParts = 0;
								this.currentSnapshotGameTick = GameTick;
							}

							// chunk.raw = Buffer.from(unpacker.remaining);
							this.snaps[Part] = unpacker.remaining;

							this.SnapshotParts |= 1 << Part;
							
							if (this.SnapshotParts == ((1 << NumParts) - 1)) {
								let mergedSnaps = Buffer.concat(this.snaps);
								this.SnapshotParts = 0;

								let snapUnpacked = this.SnapUnpacker.unpackSnapshot(mergedSnaps, DeltaTick, GameTick, Crc);
								
								this.emit("snapshot", snapUnpacked.items);
								this.AckGameTick = snapUnpacked.recvTick;
								if (Math.abs(this.PredGameTick - this.AckGameTick) > 10) {
									this.PredGameTick = this.AckGameTick + 1;
									this.sendInput();
								}
							} 


						} 

					
					// })


						}
						
						if (chunk.msgid >= NETMSG_Sys.NETMSG_WHATIS && chunk.msgid <= NETMSG_Sys.NETMSG_CHECKSUM_ERROR) {
							if (chunk.msgid == NETMSG_Sys.NETMSG_WHATIS) {
								let Uuid = chunk.raw.slice(0, 16);

								let uuid = this.UUIDManager.LookupUUID(Uuid);
								let packer = new MsgPacker(0, true, 1);
								if (uuid !== undefined) {
									// IT_IS msg
									packer.AddBuffer(this.UUIDManager.LookupType(NETMSG_Sys.NETMSG_ITIS)!.hash);
									
									packer.AddBuffer(Uuid);
									packer.AddString(uuid.name);
								} else {
									// dont_know msg
									packer.AddBuffer(this.UUIDManager.LookupType(NETMSG_Sys.NETMSG_IDONTKNOW)!.hash);
									
									packer.AddBuffer(Uuid);
								}
								this.QueueChunkEx(packer)
							}

							if (chunk.msgid == NETMSG_Sys.NETMSG_MAP_DETAILS) { // TODO: option for downloading maps
								let unpacker = new MsgUnpacker(chunk.raw);

								let map_name = unpacker.unpackString();
								let map_sha256: Buffer = Buffer.alloc(32);
								if (unpacker.remaining.length >= 32)
									map_sha256 = unpacker.unpackRaw(32);
								let map_crc = unpacker.unpackInt();
								let map_size = unpacker.unpackInt();

								let map_url = "";
								if (unpacker.remaining.length) 
									map_url = unpacker.unpackString();
								
								this.emit("map_details", {map_name, map_sha256, map_crc, map_size, map_url})
								// unpacker.unpack

							} else if (chunk.msgid == NETMSG_Sys.NETMSG_CAPABILITIES) {
								let unpacker = new MsgUnpacker(chunk.raw);
								let Version = unpacker.unpackInt();
								let Flags = unpacker.unpackInt();
								if (Version <= 0)
									return;
								let DDNet = false;
								if (Version >= 1) {
									DDNet = Boolean(Flags & 1);
									
								}
								let ChatTimeoutCode = DDNet;
								let AnyPlayerFlag = DDNet;
								let PingEx = false;
								let AllowDummy = true;
								let SyncWeaponInput = false;
								if(Version >= 1)
								{
									ChatTimeoutCode = Boolean(Flags & 2);
								}
								if(Version >= 2)
								{
									AnyPlayerFlag = Boolean(Flags & 4);
								}
								if(Version >= 3)
								{
									PingEx = Boolean(Flags & 8);
								}
								if(Version >= 4)
								{
									AllowDummy = Boolean(Flags & 16);
								}
								if(Version >= 5)
								{
									SyncWeaponInput = Boolean(Flags & 32);
								}
								this.emit("capabilities", {ChatTimeoutCode, AnyPlayerFlag, PingEx, AllowDummy, SyncWeaponInput});
								// https://github.com/ddnet/ddnet/blob/06e3eb564150e9ab81b3a5595c48e9fe5952ed32/src/engine/client/client.cpp#L1565
							} else if (chunk.msgid == NETMSG_Sys.NETMSG_PINGEX) {
								let packer = new MsgPacker(0, true, 2);
								packer.AddBuffer(this.UUIDManager.LookupType(NETMSG_Sys.NETMSG_PONGEX)!.hash);

								this.SendMsgEx(packer, 2);
							}

						}

					} else { 
						// game messages

						// vote list:
						if (chunk.msgid == NETMSG_Game.SV_VOTECLEAROPTIONS) {
							this.VoteList = [];
						} else if (chunk.msgid == NETMSG_Game.SV_VOTEOPTIONLISTADD) {
							let unpacker = new MsgUnpacker(chunk.raw)
							let NumOptions = unpacker.unpackInt()
							let list: string[] = [];
							for (let i = 0; i < 15; i++) {
								list.push(unpacker.unpackString());
							}
							list = list.slice(0, NumOptions);

							this.VoteList.push(...list);
						} else if (chunk.msgid == NETMSG_Game.SV_VOTEOPTIONADD) {
							let unpacker = new MsgUnpacker(chunk.raw)
							
							this.VoteList.push(unpacker.unpackString());
						} else if (chunk.msgid == NETMSG_Game.SV_VOTEOPTIONREMOVE) {
							let unpacker = new MsgUnpacker(chunk.raw)
							
							let index = this.VoteList.indexOf(unpacker.unpackString());

							if (index > -1)
								this.VoteList = this.VoteList.splice(index, 1);
							
						}

						// events
						if (chunk.msgid == NETMSG_Game.SV_EMOTICON) {
							let unpacker = new MsgUnpacker(chunk.raw);
							let unpacked = {
								client_id: unpacker.unpackInt(),
								emoticon: unpacker.unpackInt()
							} as iEmoticon;

							if (unpacked.client_id != -1) {
								unpacked.author = { 
									ClientInfo: this.SnapshotUnpacker.getObjClientInfo(unpacked.client_id), 
									PlayerInfo: this.SnapshotUnpacker.getObjPlayerInfo(unpacked.client_id) 
								}
							}
							this.emit("emote", unpacked)

							

						} else if (chunk.msgid == NETMSG_Game.SV_BROADCAST) {
							let unpacker = new MsgUnpacker(chunk.raw);

							this.emit("broadcast", unpacker.unpackString());
						} if (chunk.msgid == NETMSG_Game.SV_CHAT) {
							let unpacker = new MsgUnpacker(chunk.raw);
							let unpacked: iMessage = {
								team: unpacker.unpackInt(),
								client_id: unpacker.unpackInt(),
								message: unpacker.unpackString()
							} as iMessage;

							if (unpacked.client_id != -1) {
								unpacked.author = { 
									ClientInfo: this.SnapshotUnpacker.getObjClientInfo(unpacked.client_id), 
									PlayerInfo: this.SnapshotUnpacker.getObjPlayerInfo(unpacked.client_id) 
								}
							}
							this.emit("message", unpacked)
						} else if (chunk.msgid == NETMSG_Game.SV_KILLMSG) {
							let unpacked: iKillMsg = {} as iKillMsg;
							let unpacker = new MsgUnpacker(chunk.raw);
							unpacked.killer_id = unpacker.unpackInt();
							unpacked.victim_id = unpacker.unpackInt();
							unpacked.weapon = unpacker.unpackInt();
							unpacked.special_mode = unpacker.unpackInt();
							if (unpacked.victim_id != -1 && unpacked.victim_id < 64) {
								unpacked.victim = { ClientInfo: this.SnapshotUnpacker.getObjClientInfo(unpacked.victim_id), PlayerInfo: this.SnapshotUnpacker.getObjPlayerInfo(unpacked.victim_id) }

							}
							if (unpacked.killer_id != -1 && unpacked.killer_id < 64)
								unpacked.killer = { ClientInfo: this.SnapshotUnpacker.getObjClientInfo(unpacked.killer_id), PlayerInfo: this.SnapshotUnpacker.getObjPlayerInfo(unpacked.killer_id) }
							this.emit("kill", unpacked)
						} else if (chunk.msgid == NETMSG_Game.SV_MOTD) {
							let unpacker = new MsgUnpacker(chunk.raw);
							let message = unpacker.unpackString();
							this.emit("motd", message);
						}

						// packets neccessary for connection
						// https://ddnet.org/docs/libtw2/connection/
						if (chunk.msgid == NETMSG_Game.SV_READYTOENTER) {
							var Msg = new MsgPacker(15, true, 1); /* entergame */
							this.SendMsgEx(Msg);
						}
					}
				})

				
				if (new Date().getTime() - this.time >= 1000 && this.State == States.STATE_ONLINE) {
					this.time = new Date().getTime();
					this.SendControlMsg(0);
				}
			})
	}

	
	/** Sending the input. (automatically done unless options.lightweight is on) */
	sendInput(input = this.movement.input) { 
		if (this.State != States.STATE_ONLINE)
			return;

		let inputMsg = new MsgPacker(16, true, 0);
		inputMsg.AddInt(this.AckGameTick);
		inputMsg.AddInt(this.PredGameTick);
		inputMsg.AddInt(40);

		inputMsg.AddInt(input.m_Direction)
		inputMsg.AddInt(input.m_TargetX)
		inputMsg.AddInt(input.m_TargetY)
		inputMsg.AddInt(input.m_Jump)
		inputMsg.AddInt(input.m_Fire)
		inputMsg.AddInt(input.m_Hook)
		inputMsg.AddInt(input.m_PlayerFlags)
		inputMsg.AddInt(input.m_WantedWeapon)
		inputMsg.AddInt(input.m_NextWeapon)
		inputMsg.AddInt(input.m_PrevWeapon)
		
		this.SendMsgEx(inputMsg);
	}
	/** returns the movement object of the client */
	get input() { 
		return this.movement.input;
	}

	
	/** Disconnect the client. */
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

	/** Get all available vote options (for example for map voting) */
	get VoteOptionList(): string[] { 
		return this.VoteList;
	}
	get rawSnapUnpacker(): Snapshot {
		return this.SnapUnpacker;
	}
}
