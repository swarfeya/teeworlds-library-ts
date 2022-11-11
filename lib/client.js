"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
var crypto_1 = require("crypto");
var dgram_1 = __importDefault(require("dgram"));
var stream_1 = require("stream");
var MsgUnpacker_1 = require("./MsgUnpacker");
var movement_1 = __importDefault(require("./components/movement"));
var MsgPacker_1 = require("./MsgPacker");
var snapshot_1 = require("./snapshot");
var huffman_1 = __importDefault(require("./huffman"));
var game_1 = require("./components/game");
var snapshot_2 = require("./components/snapshot");
var UUIDManager_1 = require("./UUIDManager");
var huff = new huffman_1.default();
var States;
(function (States) {
    States[States["STATE_OFFLINE"] = 0] = "STATE_OFFLINE";
    States[States["STATE_CONNECTING"] = 1] = "STATE_CONNECTING";
    States[States["STATE_LOADING"] = 2] = "STATE_LOADING";
    States[States["STATE_ONLINE"] = 3] = "STATE_ONLINE";
    States[States["STATE_DEMOPLAYBACK"] = 4] = "STATE_DEMOPLAYBACK";
    States[States["STATE_QUITTING"] = 5] = "STATE_QUITTING";
    States[States["STATE_RESTARTING"] = 6] = "STATE_RESTARTING";
})(States || (States = {}));
var NETMSG_Game;
(function (NETMSG_Game) {
    NETMSG_Game[NETMSG_Game["EX"] = 0] = "EX";
    NETMSG_Game[NETMSG_Game["SV_MOTD"] = 1] = "SV_MOTD";
    NETMSG_Game[NETMSG_Game["SV_BROADCAST"] = 2] = "SV_BROADCAST";
    NETMSG_Game[NETMSG_Game["SV_CHAT"] = 3] = "SV_CHAT";
    NETMSG_Game[NETMSG_Game["SV_KILLMSG"] = 4] = "SV_KILLMSG";
    NETMSG_Game[NETMSG_Game["SV_SOUNDGLOBAL"] = 5] = "SV_SOUNDGLOBAL";
    NETMSG_Game[NETMSG_Game["SV_TUNEPARAMS"] = 6] = "SV_TUNEPARAMS";
    NETMSG_Game[NETMSG_Game["SV_EXTRAPROJECTILE"] = 7] = "SV_EXTRAPROJECTILE";
    NETMSG_Game[NETMSG_Game["SV_READYTOENTER"] = 8] = "SV_READYTOENTER";
    NETMSG_Game[NETMSG_Game["SV_WEAPONPICKUP"] = 9] = "SV_WEAPONPICKUP";
    NETMSG_Game[NETMSG_Game["SV_EMOTICON"] = 10] = "SV_EMOTICON";
    NETMSG_Game[NETMSG_Game["SV_VOTECLEAROPTIONS"] = 11] = "SV_VOTECLEAROPTIONS";
    NETMSG_Game[NETMSG_Game["SV_VOTEOPTIONLISTADD"] = 12] = "SV_VOTEOPTIONLISTADD";
    NETMSG_Game[NETMSG_Game["SV_VOTEOPTIONADD"] = 13] = "SV_VOTEOPTIONADD";
    NETMSG_Game[NETMSG_Game["SV_VOTEOPTIONREMOVE"] = 14] = "SV_VOTEOPTIONREMOVE";
    NETMSG_Game[NETMSG_Game["SV_VOTESET"] = 15] = "SV_VOTESET";
    NETMSG_Game[NETMSG_Game["SV_VOTESTATUS"] = 16] = "SV_VOTESTATUS";
    NETMSG_Game[NETMSG_Game["CL_SAY"] = 17] = "CL_SAY";
    NETMSG_Game[NETMSG_Game["CL_SETTEAM"] = 18] = "CL_SETTEAM";
    NETMSG_Game[NETMSG_Game["CL_SETSPECTATORMODE"] = 19] = "CL_SETSPECTATORMODE";
    NETMSG_Game[NETMSG_Game["CL_STARTINFO"] = 20] = "CL_STARTINFO";
    NETMSG_Game[NETMSG_Game["CL_CHANGEINFO"] = 21] = "CL_CHANGEINFO";
    NETMSG_Game[NETMSG_Game["CL_KILL"] = 22] = "CL_KILL";
    NETMSG_Game[NETMSG_Game["CL_EMOTICON"] = 23] = "CL_EMOTICON";
    NETMSG_Game[NETMSG_Game["CL_VOTE"] = 24] = "CL_VOTE";
    NETMSG_Game[NETMSG_Game["CL_CALLVOTE"] = 25] = "CL_CALLVOTE";
    NETMSG_Game[NETMSG_Game["CL_ISDDNETLEGACY"] = 26] = "CL_ISDDNETLEGACY";
    NETMSG_Game[NETMSG_Game["SV_DDRACETIMELEGACY"] = 27] = "SV_DDRACETIMELEGACY";
    NETMSG_Game[NETMSG_Game["SV_RECORDLEGACY"] = 28] = "SV_RECORDLEGACY";
    NETMSG_Game[NETMSG_Game["UNUSED"] = 29] = "UNUSED";
    NETMSG_Game[NETMSG_Game["SV_TEAMSSTATELEGACY"] = 30] = "SV_TEAMSSTATELEGACY";
    NETMSG_Game[NETMSG_Game["CL_SHOWOTHERSLEGACY"] = 31] = "CL_SHOWOTHERSLEGACY";
    NETMSG_Game[NETMSG_Game["NUM"] = 32] = "NUM";
})(NETMSG_Game || (NETMSG_Game = {}));
var NETMSG_Sys;
(function (NETMSG_Sys) {
    NETMSG_Sys[NETMSG_Sys["NETMSG_EX"] = 0] = "NETMSG_EX";
    // the first thing sent by the client
    // contains the version info for the client
    NETMSG_Sys[NETMSG_Sys["NETMSG_INFO"] = 1] = "NETMSG_INFO";
    // sent by server
    NETMSG_Sys[NETMSG_Sys["NETMSG_MAP_CHANGE"] = 2] = "NETMSG_MAP_CHANGE";
    NETMSG_Sys[NETMSG_Sys["NETMSG_MAP_DATA"] = 3] = "NETMSG_MAP_DATA";
    NETMSG_Sys[NETMSG_Sys["NETMSG_CON_READY"] = 4] = "NETMSG_CON_READY";
    NETMSG_Sys[NETMSG_Sys["NETMSG_SNAP"] = 5] = "NETMSG_SNAP";
    NETMSG_Sys[NETMSG_Sys["NETMSG_SNAPEMPTY"] = 6] = "NETMSG_SNAPEMPTY";
    NETMSG_Sys[NETMSG_Sys["NETMSG_SNAPSINGLE"] = 7] = "NETMSG_SNAPSINGLE";
    NETMSG_Sys[NETMSG_Sys["NETMSG_SNAPSMALL"] = 8] = "NETMSG_SNAPSMALL";
    NETMSG_Sys[NETMSG_Sys["NETMSG_INPUTTIMING"] = 9] = "NETMSG_INPUTTIMING";
    NETMSG_Sys[NETMSG_Sys["NETMSG_RCON_AUTH_STATUS"] = 10] = "NETMSG_RCON_AUTH_STATUS";
    NETMSG_Sys[NETMSG_Sys["NETMSG_RCON_LINE"] = 11] = "NETMSG_RCON_LINE";
    NETMSG_Sys[NETMSG_Sys["NETMSG_AUTH_CHALLANGE"] = 12] = "NETMSG_AUTH_CHALLANGE";
    NETMSG_Sys[NETMSG_Sys["NETMSG_AUTH_RESULT"] = 13] = "NETMSG_AUTH_RESULT";
    // sent by client
    NETMSG_Sys[NETMSG_Sys["NETMSG_READY"] = 14] = "NETMSG_READY";
    NETMSG_Sys[NETMSG_Sys["NETMSG_ENTERGAME"] = 15] = "NETMSG_ENTERGAME";
    NETMSG_Sys[NETMSG_Sys["NETMSG_INPUT"] = 16] = "NETMSG_INPUT";
    NETMSG_Sys[NETMSG_Sys["NETMSG_RCON_CMD"] = 17] = "NETMSG_RCON_CMD";
    NETMSG_Sys[NETMSG_Sys["NETMSG_RCON_AUTH"] = 18] = "NETMSG_RCON_AUTH";
    NETMSG_Sys[NETMSG_Sys["NETMSG_REQUEST_MAP_DATA"] = 19] = "NETMSG_REQUEST_MAP_DATA";
    NETMSG_Sys[NETMSG_Sys["NETMSG_AUTH_START"] = 20] = "NETMSG_AUTH_START";
    NETMSG_Sys[NETMSG_Sys["NETMSG_AUTH_RESPONSE"] = 21] = "NETMSG_AUTH_RESPONSE";
    // sent by both
    NETMSG_Sys[NETMSG_Sys["NETMSG_PING"] = 22] = "NETMSG_PING";
    NETMSG_Sys[NETMSG_Sys["NETMSG_PING_REPLY"] = 23] = "NETMSG_PING_REPLY";
    NETMSG_Sys[NETMSG_Sys["NETMSG_ERROR"] = 24] = "NETMSG_ERROR";
    // sent by server (todo: move it up)
    NETMSG_Sys[NETMSG_Sys["NETMSG_RCON_CMD_ADD"] = 25] = "NETMSG_RCON_CMD_ADD";
    NETMSG_Sys[NETMSG_Sys["NETMSG_RCON_CMD_REM"] = 26] = "NETMSG_RCON_CMD_REM";
    NETMSG_Sys[NETMSG_Sys["NUM_NETMSGS"] = 27] = "NUM_NETMSGS";
    NETMSG_Sys[NETMSG_Sys["NETMSG_WHATIS"] = 65536] = "NETMSG_WHATIS";
    NETMSG_Sys[NETMSG_Sys["NETMSG_ITIS"] = 65537] = "NETMSG_ITIS";
    NETMSG_Sys[NETMSG_Sys["NETMSG_IDONTKNOW"] = 65538] = "NETMSG_IDONTKNOW";
    NETMSG_Sys[NETMSG_Sys["NETMSG_RCONTYPE"] = 65539] = "NETMSG_RCONTYPE";
    NETMSG_Sys[NETMSG_Sys["NETMSG_MAP_DETAILS"] = 65540] = "NETMSG_MAP_DETAILS";
    NETMSG_Sys[NETMSG_Sys["NETMSG_CAPABILITIES"] = 65541] = "NETMSG_CAPABILITIES";
    NETMSG_Sys[NETMSG_Sys["NETMSG_CLIENTVER"] = 65542] = "NETMSG_CLIENTVER";
    NETMSG_Sys[NETMSG_Sys["NETMSG_PINGEX"] = 65543] = "NETMSG_PINGEX";
    NETMSG_Sys[NETMSG_Sys["NETMSG_PONGEX"] = 65544] = "NETMSG_PONGEX";
    NETMSG_Sys[NETMSG_Sys["NETMSG_CHECKSUM_REQUEST"] = 65545] = "NETMSG_CHECKSUM_REQUEST";
    NETMSG_Sys[NETMSG_Sys["NETMSG_CHECKSUM_RESPONSE"] = 65546] = "NETMSG_CHECKSUM_RESPONSE";
    NETMSG_Sys[NETMSG_Sys["NETMSG_CHECKSUM_ERROR"] = 65547] = "NETMSG_CHECKSUM_ERROR";
})(NETMSG_Sys || (NETMSG_Sys = {}));
var messageTypes = [
    ["none, starts at 1", "SV_MOTD", "SV_BROADCAST", "SV_CHAT", "SV_KILL_MSG", "SV_SOUND_GLOBAL", "SV_TUNE_PARAMS", "SV_EXTRA_PROJECTILE", "SV_READY_TO_ENTER", "SV_WEAPON_PICKUP", "SV_EMOTICON", "SV_VOTE_CLEAR_OPTIONS", "SV_VOTE_OPTION_LIST_ADD", "SV_VOTE_OPTION_ADD", "SV_VOTE_OPTION_REMOVE", "SV_VOTE_SET", "SV_VOTE_STATUS", "CL_SAY", "CL_SET_TEAM", "CL_SET_SPECTATOR_MODE", "CL_START_INFO", "CL_CHANGE_INFO", "CL_KILL", "CL_EMOTICON", "CL_VOTE", "CL_CALL_VOTE", "CL_IS_DDNET", "SV_DDRACE_TIME", "SV_RECORD", "UNUSED", "SV_TEAMS_STATE", "CL_SHOW_OTHERS_LEGACY"],
    ["none, starts at 1", "INFO", "MAP_CHANGE", "MAP_DATA", "CON_READY", "SNAP", "SNAP_EMPTY", "SNAP_SINGLE", "INPUT_TIMING", "RCON_AUTH_STATUS", "RCON_LINE", "READY", "ENTER_GAME", "INPUT", "RCON_CMD", "RCON_AUTH", "REQUEST_MAP_DATA", "PING", "PING_REPLY", "RCON_CMD_ADD", "RCON_CMD_REMOVE"]
];
var Client = /** @class */ (function (_super) {
    __extends(Client, _super);
    function Client(ip, port, nickname, options) {
        var _this = _super.call(this) || this;
        _this.host = ip;
        _this.port = port;
        _this.name = nickname;
        _this.AckGameTick = 0;
        _this.PredGameTick = 0;
        _this.currentSnapshotGameTick = 0;
        _this.SnapshotParts = 0;
        _this.SnapUnpacker = new snapshot_1.Snapshot(_this);
        // this.eSnapHolder = [];
        _this.requestResend = false;
        _this.VoteList = [];
        if (options)
            _this.options = options;
        _this.snaps = [];
        _this.sentChunkQueue = [];
        _this.queueChunkEx = [];
        _this.State = States.STATE_OFFLINE; // 0 = offline; 1 = STATE_CONNECTING = 1, STATE_LOADING = 2, STATE_ONLINE = 3
        _this.ack = 0; // ack of messages the client has received
        _this.clientAck = 0; // ack of messages the client has sent
        _this.receivedSnaps = 0; /* wait for 2 snaps before seeing self as connected */
        _this.socket = dgram_1.default.createSocket("udp4");
        _this.socket.bind();
        _this.TKEN = Buffer.from([255, 255, 255, 255]);
        _this.time = new Date().getTime() + 2000; // time (used for keepalives, start to send keepalives after 2 seconds)
        _this.lastSendTime = new Date().getTime();
        _this.lastRecvTime = new Date().getTime();
        _this.lastSentMessages = [];
        _this.movement = new movement_1.default();
        _this.game = new game_1.Game(_this);
        _this.SnapshotUnpacker = new snapshot_2.SnapshotWrapper(_this);
        _this.UUIDManager = new UUIDManager_1.UUIDManager();
        _this.UUIDManager.RegisterName("what-is@ddnet.tw");
        _this.UUIDManager.RegisterName("it-is@ddnet.tw");
        _this.UUIDManager.RegisterName("i-dont-know@ddnet.tw");
        _this.UUIDManager.RegisterName("rcon-type@ddnet.tw");
        _this.UUIDManager.RegisterName("map-details@ddnet.tw");
        _this.UUIDManager.RegisterName("capabilities@ddnet.tw");
        _this.UUIDManager.RegisterName("clientver@ddnet.tw");
        _this.UUIDManager.RegisterName("ping@ddnet.tw");
        _this.UUIDManager.RegisterName("pong@ddnet.tw");
        _this.UUIDManager.RegisterName("checksum-request@ddnet.tw");
        _this.UUIDManager.RegisterName("checksum-response@ddnet.tw");
        _this.UUIDManager.RegisterName("checksum-error@ddnet.tw");
        return _this;
    }
    Client.prototype.ResendAfter = function (lastAck) {
        this.clientAck = lastAck;
        var toResend = [];
        this.lastSentMessages.forEach(function (msg) {
            if (msg.ack > lastAck)
                toResend.push(msg.msg);
        });
        toResend.forEach(function (a) { return a.flag = 1 | 2; });
        this.SendMsgEx(toResend);
    };
    Client.prototype.Unpack = function (packet) {
        var unpacked = { twprotocol: { flags: packet[0] >> 4, ack: ((packet[0] & 0xf) << 8) | packet[1], chunkAmount: packet[2], size: packet.byteLength - 3 }, chunks: [] };
        if (packet.indexOf(Buffer.from([0xff, 0xff, 0xff, 0xff])) == 0) // !(unpacked.twprotocol.flags & 8) || unpacked.twprotocol.flags == 255) // flags == 255 is connectionless (used for sending usernames)
            return unpacked;
        if (unpacked.twprotocol.flags & 4) { // resend flag
            this.ResendAfter(unpacked.twprotocol.ack);
        }
        packet = packet.slice(3);
        if (unpacked.twprotocol.flags & 8 && !(unpacked.twprotocol.flags & 1)) { // compression flag
            packet = huff.decompress(packet);
            if (packet.length == 1 && packet[0] == -1)
                return unpacked;
        }
        for (var i = 0; i < unpacked.twprotocol.chunkAmount; i++) {
            var chunk = {};
            chunk.bytes = ((packet[0] & 0x3f) << 4) | (packet[1] & ((1 << 4) - 1));
            chunk.flags = (packet[0] >> 6) & 3;
            chunk.sequence = -1;
            if (chunk.flags & 1) {
                chunk.seq = ((packet[1] & 0xf0) << 2) | packet[2];
                packet = packet.slice(3); // remove flags & size
            }
            else
                packet = packet.slice(2);
            // chunk.type = packet[0] & 1 ? "sys" : "game"; // & 1 = binary, ****_***1. e.g 0001_0111 sys, 0001_0110 game
            chunk.sys = Boolean(packet[0] & 1); // & 1 = binary, ****_***1. e.g 0001_0111 sys, 0001_0110 game
            chunk.msgid = (packet[0] - (packet[0] & 1)) / 2;
            chunk.msg = messageTypes[packet[0] & 1][chunk.msgid];
            chunk.raw = packet.slice(1, chunk.bytes);
            if (chunk.msgid == 0 && chunk.raw.byteLength >= 16) {
                var uuid = this.UUIDManager.LookupUUID(chunk.raw.slice(0, 16));
                if (uuid !== undefined) {
                    chunk.extended_msgid = uuid.hash;
                    chunk.msg = uuid.name;
                    chunk.raw = chunk.raw.slice(16);
                    chunk.msgid = uuid.type_id;
                }
            }
            packet = packet.slice(chunk.bytes);
            unpacked.chunks.push(chunk);
        }
        return unpacked;
    };
    /**  Send a Control Msg to the server. (used for disconnect)*/
    Client.prototype.SendControlMsg = function (msg, ExtraMsg) {
        var _this = this;
        if (ExtraMsg === void 0) { ExtraMsg = ""; }
        this.lastSendTime = new Date().getTime();
        return new Promise(function (resolve, reject) {
            if (_this.socket) {
                var latestBuf = Buffer.from([0x10 + (((16 << 4) & 0xf0) | ((_this.ack >> 8) & 0xf)), _this.ack & 0xff, 0x00, msg]);
                latestBuf = Buffer.concat([latestBuf, Buffer.from(ExtraMsg), _this.TKEN]); // move header (latestBuf), optional extraMsg & TKEN into 1 buffer
                _this.socket.send(latestBuf, 0, latestBuf.length, _this.port, _this.host, function (err, bytes) {
                    resolve(bytes);
                });
            }
            setTimeout(function () { resolve("failed, rip"); }, 2000);
            /* 	after 2 seconds it was probably not able to send,
                so when sending a quit message the user doesnt
                stay stuck not being able to ctrl + c
        */
        });
    };
    /**  Send a Msg (or Msg[]) to the server.*/
    Client.prototype.SendMsgEx = function (Msgs, flags) {
        var _this = this;
        if (flags === void 0) { flags = 0; }
        if (this.State == States.STATE_OFFLINE)
            return;
        if (!this.socket)
            return;
        var _Msgs;
        if (Msgs instanceof Array)
            _Msgs = Msgs;
        else
            _Msgs = [Msgs];
        if (this.queueChunkEx.length > 0) {
            _Msgs.push.apply(_Msgs, this.queueChunkEx);
            this.queueChunkEx = [];
        }
        this.lastSendTime = new Date().getTime();
        var header = [];
        if (this.clientAck == 0)
            this.lastSentMessages = [];
        _Msgs.forEach(function (Msg, index) {
            header[index] = Buffer.alloc((Msg.flag & 1 ? 3 : 2));
            header[index][0] = ((Msg.flag & 3) << 6) | ((Msg.size >> 4) & 0x3f);
            header[index][1] = (Msg.size & 0xf);
            if (Msg.flag & 1) {
                _this.clientAck = (_this.clientAck + 1) % (1 << 10);
                if (_this.clientAck == 0)
                    _this.lastSentMessages = [];
                header[index][1] |= (_this.clientAck >> 2) & 0xf0;
                header[index][2] = _this.clientAck & 0xff;
                header[index][0] = (((Msg.flag | 2) & 3) << 6) | ((Msg.size >> 4) & 0x3f); // 2 is resend flag (ugly hack for queue)
                if ((Msg.flag & 2) == 0)
                    _this.sentChunkQueue.push(Buffer.concat([header[index], Msg.buffer]));
                header[index][0] = (((Msg.flag) & 3) << 6) | ((Msg.size >> 4) & 0x3f);
                if ((Msg.flag & 2) == 0)
                    _this.lastSentMessages.push({ msg: Msg, ack: _this.clientAck });
            }
        });
        // let flags = 0;
        if (this.requestResend)
            flags |= 4;
        var packetHeader = Buffer.from([((flags << 4) & 0xf0) | ((this.ack >> 8) & 0xf), this.ack & 0xff, _Msgs.length]);
        var chunks = Buffer.from([]);
        var skip = false;
        _Msgs.forEach(function (Msg, index) {
            if (skip)
                return;
            if (chunks.byteLength < 1300)
                chunks = Buffer.concat([chunks, Buffer.from(header[index]), Msg.buffer]);
            else {
                skip = true;
                _this.SendMsgEx(_Msgs.slice(index));
            }
        });
        var packet = Buffer.concat([(packetHeader), chunks, this.TKEN]);
        if (chunks.length < 0)
            return;
        this.socket.send(packet, 0, packet.length, this.port, this.host);
    };
    /** Queue a chunk (It will get sent in the next packet). */
    Client.prototype.QueueChunkEx = function (Msg) {
        this.queueChunkEx.push(Msg);
    };
    /**  Send a Raw Buffer (as chunk) to the server. */
    Client.prototype.SendMsgRaw = function (chunks) {
        if (this.State == States.STATE_OFFLINE)
            return;
        if (!this.socket)
            return;
        this.lastSendTime = new Date().getTime();
        var packetHeader = Buffer.from([0x0 + (((16 << 4) & 0xf0) | ((this.ack >> 8) & 0xf)), this.ack & 0xff, chunks.length]);
        var packet = Buffer.concat([(packetHeader), Buffer.concat(chunks), this.TKEN]);
        if (chunks.length < 0)
            return;
        this.socket.send(packet, 0, packet.length, this.port, this.host);
    };
    Client.prototype.MsgToChunk = function (packet) {
        var chunk = {};
        chunk.bytes = ((packet[0] & 0x3f) << 4) | (packet[1] & ((1 << 4) - 1));
        chunk.flags = (packet[0] >> 6) & 3;
        chunk.sequence = -1;
        if (chunk.flags & 1) {
            chunk.seq = ((packet[1] & 0xf0) << 2) | packet[2];
            packet = packet.slice(3); // remove flags & size
        }
        else
            packet = packet.slice(2);
        // chunk.type = packet[0] & 1 ? "sys" : "game"; // & 1 = binary, ****_***1. e.g 0001_0111 sys, 0001_0110 game
        chunk.sys = Boolean(packet[0] & 1); // & 1 = binary, ****_***1. e.g 0001_0111 sys, 0001_0110 game
        chunk.msgid = (packet[0] - (packet[0] & 1)) / 2;
        chunk.msg = messageTypes[packet[0] & 1][chunk.msgid];
        chunk.raw = packet.slice(1, chunk.bytes);
        if (chunk.msgid == 0) {
            var uuid = this.UUIDManager.LookupUUID(chunk.raw.slice(0, 16));
            if (uuid !== undefined) {
                chunk.extended_msgid = uuid.hash;
                chunk.msgid = uuid.type_id;
                chunk.msg = uuid.name;
                chunk.raw = chunk.raw.slice(16);
            }
        }
        return chunk;
    };
    /** Connect the client to the server. */
    Client.prototype.connect = function () {
        var _this = this;
        var _a;
        this.State = States.STATE_CONNECTING;
        var predTimer = setInterval(function () {
            if (_this.State == States.STATE_ONLINE) {
                if (_this.AckGameTick > 0)
                    _this.PredGameTick++;
            }
            else if (_this.State == States.STATE_OFFLINE)
                clearInterval(predTimer);
        }, 20);
        this.SendControlMsg(1, "TKEN");
        var connectInterval = setInterval(function () {
            if (_this.State == States.STATE_CONNECTING)
                _this.SendControlMsg(1, "TKEN");
            else
                clearInterval(connectInterval);
        }, 500);
        if (!((_a = this.options) === null || _a === void 0 ? void 0 : _a.lightweight)) {
            var inputInterval_1 = setInterval(function () {
                if (_this.State == States.STATE_OFFLINE)
                    clearInterval(inputInterval_1);
                if (_this.State != States.STATE_ONLINE)
                    return;
                _this.time = new Date().getTime();
                _this.sendInput();
            }, 500);
        }
        var resendTimeout = setInterval(function () {
            if (_this.State != States.STATE_OFFLINE) {
                if (((new Date().getTime()) - _this.lastSendTime) > 900 && _this.sentChunkQueue.length > 0) {
                    _this.SendMsgRaw([_this.sentChunkQueue[0]]);
                }
            }
            else
                clearInterval(resendTimeout);
        }, 1000);
        var Timeout = setInterval(function () {
            var _a;
            var timeoutTime = ((_a = _this.options) === null || _a === void 0 ? void 0 : _a.timeout) ? _this.options.timeout : 15000;
            if ((new Date().getTime() - _this.lastRecvTime) > timeoutTime) {
                _this.State = States.STATE_OFFLINE;
                _this.emit("timeout");
                _this.emit("disconnect", "Timed Out. (no packets received for " + (new Date().getTime() - _this.lastRecvTime) + "ms)");
                clearInterval(Timeout);
            }
        }, 5000);
        this.time = new Date().getTime() + 2000; // start sending keepalives after 2s
        if (this.socket)
            this.socket.on("message", function (packet, rinfo) {
                var _a, _b, _c, _d, _e, _f;
                if (_this.State == 0 || rinfo.address != _this.host || rinfo.port != _this.port)
                    return;
                clearInterval(connectInterval);
                if (packet[0] == 0x10) {
                    if (packet.toString().includes("TKEN") || packet[3] == 0x2) {
                        clearInterval(connectInterval);
                        _this.TKEN = packet.slice(-4);
                        _this.SendControlMsg(3);
                        _this.State = States.STATE_LOADING; // loading state
                        _this.receivedSnaps = 0;
                        var info = new MsgPacker_1.MsgPacker(1, true, 1);
                        info.AddString(((_a = _this.options) === null || _a === void 0 ? void 0 : _a.NET_VERSION) ? _this.options.NET_VERSION : "0.6 626fce9a778df4d4");
                        info.AddString(((_b = _this.options) === null || _b === void 0 ? void 0 : _b.password) === undefined ? "" : (_c = _this.options) === null || _c === void 0 ? void 0 : _c.password); // password
                        var client_version = new MsgPacker_1.MsgPacker(0, true, 1);
                        client_version.AddBuffer(Buffer.from("8c00130484613e478787f672b3835bd4", 'hex'));
                        var randomUuid = (0, crypto_1.randomBytes)(16);
                        client_version.AddBuffer(randomUuid);
                        if (((_d = _this.options) === null || _d === void 0 ? void 0 : _d.ddnet_version) !== undefined) {
                            client_version.AddInt((_e = _this.options) === null || _e === void 0 ? void 0 : _e.ddnet_version.version);
                            client_version.AddString("DDNet " + ((_f = _this.options) === null || _f === void 0 ? void 0 : _f.ddnet_version.release_version));
                        }
                        else {
                            client_version.AddInt(16050);
                            client_version.AddString("DDNet 16.5.0");
                        }
                        _this.SendMsgEx([client_version, info]);
                    }
                    else if (packet[3] == 0x4) {
                        // disconnected
                        _this.State = States.STATE_OFFLINE;
                        var reason = ((0, MsgUnpacker_1.unpackString)(packet.slice(4)).result);
                        _this.emit("disconnect", reason);
                    }
                    if (packet[3] !== 0x0) { // keepalive
                        _this.lastRecvTime = new Date().getTime();
                    }
                }
                else {
                    _this.lastRecvTime = new Date().getTime();
                }
                var unpacked = _this.Unpack(packet);
                unpacked.chunks = unpacked.chunks.filter(function (chunk) { return ((chunk.flags & 2) && (chunk.flags & 1)) ? chunk.seq > _this.ack : true; }); // filter out already received chunks
                unpacked.chunks.forEach(function (chunk) {
                    if (chunk.flags & 1 && (chunk.flags !== 15)) { // vital and not connless
                        if (chunk.seq === (_this.ack + 1) % (1 << 10)) { // https://github.com/nobody-mb/twchatonly/blob/master/chatonly.cpp#L237
                            _this.ack = chunk.seq;
                            _this.requestResend = false;
                        }
                        else { //IsSeqInBackroom (old packet that we already got)
                            var Bottom = (_this.ack - (1 << 10) / 2);
                            if (Bottom < 0) {
                                if ((chunk.seq <= _this.ack) || (chunk.seq >= (Bottom + (1 << 10))))
                                    return;
                            }
                            else {
                                if (chunk.seq <= _this.ack && chunk.seq >= Bottom)
                                    return;
                            }
                            _this.requestResend = true;
                        }
                    }
                });
                _this.sentChunkQueue.forEach(function (buff, i) {
                    var chunkFlags = (buff[0] >> 6) & 3;
                    if (chunkFlags & 1) {
                        var chunk = _this.MsgToChunk(buff);
                        if (chunk.seq && chunk.seq >= _this.ack)
                            _this.sentChunkQueue.splice(i, 1);
                    }
                });
                unpacked.chunks.forEach(function (chunk, index) {
                    var _a;
                    var _b;
                    if (chunk.sys) {
                        // system messages
                        if (chunk.msgid == NETMSG_Sys.NETMSG_PING) { // ping
                            var packer = new MsgPacker_1.MsgPacker(NETMSG_Sys.NETMSG_PING_REPLY, true, 0);
                            _this.SendMsgEx(packer); // send ping reply
                        }
                        else if (chunk.msgid == NETMSG_Sys.NETMSG_PING_REPLY) { // Ping reply
                            _this.game._ping_resolve(new Date().getTime());
                        }
                        // packets neccessary for connection
                        // https://ddnet.org/docs/libtw2/connection/
                        if (chunk.msgid == NETMSG_Sys.NETMSG_MAP_CHANGE) {
                            var Msg = new MsgPacker_1.MsgPacker(NETMSG_Sys.NETMSG_READY, true, 1); /* ready */
                            _this.SendMsgEx(Msg);
                        }
                        else if (chunk.msgid == NETMSG_Sys.NETMSG_CON_READY) {
                            var info = new MsgPacker_1.MsgPacker(NETMSG_Game.CL_STARTINFO, false, 1);
                            if ((_b = _this.options) === null || _b === void 0 ? void 0 : _b.identity) {
                                info.AddString(_this.options.identity.name);
                                info.AddString(_this.options.identity.clan);
                                info.AddInt(_this.options.identity.country);
                                info.AddString(_this.options.identity.skin);
                                info.AddInt(_this.options.identity.use_custom_color);
                                info.AddInt(_this.options.identity.color_body);
                                info.AddInt(_this.options.identity.color_feet);
                            }
                            else {
                                info.AddString(_this.name); /* name */
                                info.AddString(""); /* clan */
                                info.AddInt(-1); /* country */
                                info.AddString("greyfox"); /* skin */
                                info.AddInt(1); /* use custom color */
                                info.AddInt(10346103); /* color body */
                                info.AddInt(65535); /* color feet */
                            }
                            var crashmeplx = new MsgPacker_1.MsgPacker(17, true, 1); // rcon
                            crashmeplx.AddString("crashmeplx"); // 64 player support message
                            _this.SendMsgEx([info, crashmeplx]);
                        }
                        if (chunk.msgid >= NETMSG_Sys.NETMSG_SNAP && chunk.msgid <= NETMSG_Sys.NETMSG_SNAPSINGLE) {
                            _this.receivedSnaps++; /* wait for 2 ss before seeing self as connected */
                            if (_this.receivedSnaps == 2) {
                                if (_this.State != States.STATE_ONLINE)
                                    _this.emit('connected');
                                _this.State = States.STATE_ONLINE;
                            }
                            if (Math.abs(_this.PredGameTick - _this.AckGameTick) > 10)
                                _this.PredGameTick = _this.AckGameTick + 1;
                            // snapChunks.forEach(chunk => {
                            var unpacker = new MsgUnpacker_1.MsgUnpacker(chunk.raw);
                            var NumParts = 1;
                            var Part = 0;
                            var GameTick = unpacker.unpackInt();
                            var DeltaTick = GameTick - unpacker.unpackInt();
                            var PartSize = 0;
                            var Crc = 0;
                            var CompleteSize = 0;
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
                            if (GameTick >= _this.currentSnapshotGameTick) {
                                if (GameTick != _this.currentSnapshotGameTick) {
                                    _this.snaps = [];
                                    _this.SnapshotParts = 0;
                                    _this.currentSnapshotGameTick = GameTick;
                                }
                                // chunk.raw = Buffer.from(unpacker.remaining);
                                _this.snaps[Part] = unpacker.remaining;
                                _this.SnapshotParts |= 1 << Part;
                                if (_this.SnapshotParts == ((1 << NumParts) - 1)) {
                                    var mergedSnaps = Buffer.concat(_this.snaps);
                                    _this.SnapshotParts = 0;
                                    var snapUnpacked = _this.SnapUnpacker.unpackSnapshot(mergedSnaps, DeltaTick, GameTick, Crc);
                                    _this.emit("snapshot", snapUnpacked.items);
                                    _this.AckGameTick = snapUnpacked.recvTick;
                                    if (Math.abs(_this.PredGameTick - _this.AckGameTick) > 10)
                                        _this.PredGameTick = _this.AckGameTick + 1;
                                    _this.sendInput();
                                }
                            }
                            // })
                        }
                        if (chunk.msgid >= NETMSG_Sys.NETMSG_WHATIS && chunk.msgid <= NETMSG_Sys.NETMSG_CHECKSUM_ERROR) {
                            if (chunk.msgid == NETMSG_Sys.NETMSG_WHATIS) {
                                var Uuid = chunk.raw.slice(0, 16);
                                var uuid = _this.UUIDManager.LookupUUID(Uuid);
                                var packer = new MsgPacker_1.MsgPacker(0, true, 1);
                                if (uuid !== undefined) {
                                    // IT_IS msg
                                    packer.AddBuffer(_this.UUIDManager.LookupType(NETMSG_Sys.NETMSG_ITIS).hash);
                                    packer.AddBuffer(Uuid);
                                    packer.AddString(uuid.name);
                                }
                                else {
                                    // dont_know msg
                                    packer.AddBuffer(_this.UUIDManager.LookupType(NETMSG_Sys.NETMSG_IDONTKNOW).hash);
                                    packer.AddBuffer(Uuid);
                                }
                                _this.QueueChunkEx(packer);
                            }
                            if (chunk.msgid == NETMSG_Sys.NETMSG_MAP_DETAILS) { // TODO: option for downloading maps
                                var unpacker = new MsgUnpacker_1.MsgUnpacker(chunk.raw);
                                var map_name = unpacker.unpackString();
                                var map_sha256 = Buffer.alloc(32);
                                if (unpacker.remaining.length >= 32)
                                    map_sha256 = unpacker.unpackRaw(32);
                                var map_crc = unpacker.unpackInt();
                                var map_size = unpacker.unpackInt();
                                var map_url = "";
                                if (unpacker.remaining.length)
                                    map_url = unpacker.unpackString();
                                _this.emit("map_details", { map_name: map_name, map_sha256: map_sha256, map_crc: map_crc, map_size: map_size, map_url: map_url });
                                // unpacker.unpack
                            }
                            else if (chunk.msgid == NETMSG_Sys.NETMSG_CAPABILITIES) {
                                var unpacker = new MsgUnpacker_1.MsgUnpacker(chunk.raw);
                                var Version = unpacker.unpackInt();
                                var Flags = unpacker.unpackInt();
                                if (Version <= 0)
                                    return;
                                var DDNet = false;
                                if (Version >= 1) {
                                    DDNet = Boolean(Flags & 1);
                                }
                                var ChatTimeoutCode = DDNet;
                                var AnyPlayerFlag = DDNet;
                                var PingEx = false;
                                var AllowDummy = true;
                                var SyncWeaponInput = false;
                                if (Version >= 1) {
                                    ChatTimeoutCode = Boolean(Flags & 2);
                                }
                                if (Version >= 2) {
                                    AnyPlayerFlag = Boolean(Flags & 4);
                                }
                                if (Version >= 3) {
                                    PingEx = Boolean(Flags & 8);
                                }
                                if (Version >= 4) {
                                    AllowDummy = Boolean(Flags & 16);
                                }
                                if (Version >= 5) {
                                    SyncWeaponInput = Boolean(Flags & 32);
                                }
                                _this.emit("capabilities", { ChatTimeoutCode: ChatTimeoutCode, AnyPlayerFlag: AnyPlayerFlag, PingEx: PingEx, AllowDummy: AllowDummy, SyncWeaponInput: SyncWeaponInput });
                                // https://github.com/ddnet/ddnet/blob/06e3eb564150e9ab81b3a5595c48e9fe5952ed32/src/engine/client/client.cpp#L1565
                            }
                            else if (chunk.msgid == NETMSG_Sys.NETMSG_PINGEX) {
                                var packer = new MsgPacker_1.MsgPacker(0, true, 2);
                                packer.AddBuffer(_this.UUIDManager.LookupType(NETMSG_Sys.NETMSG_PONGEX).hash);
                                _this.SendMsgEx(packer, 2);
                            }
                        }
                    }
                    else {
                        // game messages
                        // vote list:
                        if (chunk.msgid == NETMSG_Game.SV_VOTECLEAROPTIONS) {
                            _this.VoteList = [];
                        }
                        else if (chunk.msgid == NETMSG_Game.SV_VOTEOPTIONLISTADD) {
                            var unpacker = new MsgUnpacker_1.MsgUnpacker(chunk.raw);
                            var NumOptions = unpacker.unpackInt();
                            var list = [];
                            for (var i = 0; i < 15; i++) {
                                list.push(unpacker.unpackString());
                            }
                            list = list.slice(0, NumOptions);
                            (_a = _this.VoteList).push.apply(_a, list);
                        }
                        else if (chunk.msgid == NETMSG_Game.SV_VOTEOPTIONADD) {
                            var unpacker = new MsgUnpacker_1.MsgUnpacker(chunk.raw);
                            _this.VoteList.push(unpacker.unpackString());
                        }
                        else if (chunk.msgid == NETMSG_Game.SV_VOTEOPTIONREMOVE) {
                            var unpacker = new MsgUnpacker_1.MsgUnpacker(chunk.raw);
                            var index_1 = _this.VoteList.indexOf(unpacker.unpackString());
                            if (index_1 > -1)
                                _this.VoteList = _this.VoteList.splice(index_1, 1);
                        }
                        // events
                        if (chunk.msgid == NETMSG_Game.SV_EMOTICON) {
                            var unpacker = new MsgUnpacker_1.MsgUnpacker(chunk.raw);
                            var unpacked_1 = {
                                client_id: unpacker.unpackInt(),
                                emoticon: unpacker.unpackInt()
                            };
                            if (unpacked_1.client_id != -1) {
                                unpacked_1.author = {
                                    ClientInfo: _this.SnapshotUnpacker.getObjClientInfo(unpacked_1.client_id),
                                    PlayerInfo: _this.SnapshotUnpacker.getObjPlayerInfo(unpacked_1.client_id)
                                };
                            }
                            _this.emit("emote", unpacked_1);
                        }
                        else if (chunk.msgid == NETMSG_Game.SV_BROADCAST) {
                            var unpacker = new MsgUnpacker_1.MsgUnpacker(chunk.raw);
                            _this.emit("broadcast", unpacker.unpackString());
                        }
                        if (chunk.msgid == NETMSG_Game.SV_CHAT) {
                            var unpacker = new MsgUnpacker_1.MsgUnpacker(chunk.raw);
                            var unpacked_2 = {
                                team: unpacker.unpackInt(),
                                client_id: unpacker.unpackInt(),
                                message: unpacker.unpackString()
                            };
                            if (unpacked_2.client_id != -1) {
                                unpacked_2.author = {
                                    ClientInfo: _this.SnapshotUnpacker.getObjClientInfo(unpacked_2.client_id),
                                    PlayerInfo: _this.SnapshotUnpacker.getObjPlayerInfo(unpacked_2.client_id)
                                };
                            }
                            _this.emit("message", unpacked_2);
                        }
                        else if (chunk.msgid == NETMSG_Game.SV_KILLMSG) {
                            var unpacked_3 = {};
                            var unpacker = new MsgUnpacker_1.MsgUnpacker(chunk.raw);
                            unpacked_3.killer_id = unpacker.unpackInt();
                            unpacked_3.victim_id = unpacker.unpackInt();
                            unpacked_3.weapon = unpacker.unpackInt();
                            unpacked_3.special_mode = unpacker.unpackInt();
                            if (unpacked_3.victim_id != -1 && unpacked_3.victim_id < 64) {
                                unpacked_3.victim = { ClientInfo: _this.SnapshotUnpacker.getObjClientInfo(unpacked_3.victim_id), PlayerInfo: _this.SnapshotUnpacker.getObjPlayerInfo(unpacked_3.victim_id) };
                            }
                            if (unpacked_3.killer_id != -1 && unpacked_3.killer_id < 64)
                                unpacked_3.killer = { ClientInfo: _this.SnapshotUnpacker.getObjClientInfo(unpacked_3.killer_id), PlayerInfo: _this.SnapshotUnpacker.getObjPlayerInfo(unpacked_3.killer_id) };
                            _this.emit("kill", unpacked_3);
                        }
                        else if (chunk.msgid == NETMSG_Game.SV_MOTD) {
                            var unpacker = new MsgUnpacker_1.MsgUnpacker(chunk.raw);
                            var message = unpacker.unpackString();
                            _this.emit("motd", message);
                        }
                        // packets neccessary for connection
                        // https://ddnet.org/docs/libtw2/connection/
                        if (chunk.msgid == NETMSG_Game.SV_READYTOENTER) {
                            var Msg = new MsgPacker_1.MsgPacker(15, true, 1); /* entergame */
                            _this.SendMsgEx(Msg);
                        }
                    }
                });
                if (new Date().getTime() - _this.time >= 1000 && _this.State == States.STATE_ONLINE) {
                    _this.time = new Date().getTime();
                    _this.SendControlMsg(0);
                }
            });
    };
    /** Sending the input. (automatically done unless options.lightweight is on) */
    Client.prototype.sendInput = function (input) {
        if (input === void 0) { input = this.movement.input; }
        if (this.State != States.STATE_ONLINE)
            return;
        var inputMsg = new MsgPacker_1.MsgPacker(16, true, 0);
        inputMsg.AddInt(this.AckGameTick);
        inputMsg.AddInt(this.PredGameTick);
        inputMsg.AddInt(40);
        inputMsg.AddInt(input.m_Direction);
        inputMsg.AddInt(input.m_TargetX);
        inputMsg.AddInt(input.m_TargetY);
        inputMsg.AddInt(input.m_Jump);
        inputMsg.AddInt(input.m_Fire);
        inputMsg.AddInt(input.m_Hook);
        inputMsg.AddInt(input.m_PlayerFlags);
        inputMsg.AddInt(input.m_WantedWeapon);
        inputMsg.AddInt(input.m_NextWeapon);
        inputMsg.AddInt(input.m_PrevWeapon);
        this.SendMsgEx(inputMsg);
    };
    Object.defineProperty(Client.prototype, "input", {
        /** returns the movement object of the client */
        get: function () {
            return this.movement.input;
        },
        enumerable: false,
        configurable: true
    });
    /** Disconnect the client. */
    Client.prototype.Disconnect = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.SendControlMsg(4).then(function () {
                resolve(true);
                if (_this.socket)
                    _this.socket.close();
                _this.socket = undefined;
                _this.State = States.STATE_OFFLINE;
            });
        });
    };
    Object.defineProperty(Client.prototype, "VoteOptionList", {
        /** Get all available vote options (for example for map voting) */
        get: function () {
            return this.VoteList;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "rawSnapUnpacker", {
        get: function () {
            return this.SnapUnpacker;
        },
        enumerable: false,
        configurable: true
    });
    return Client;
}(stream_1.EventEmitter));
exports.Client = Client;
